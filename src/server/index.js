const path = require("path");
const compress = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const feathers = require("feathers");
const configuration = require("feathers-configuration");
const hooks = require("feathers-hooks");
const rest = require("feathers-rest");
const socketio = require("feathers-socketio");

const handler = require("feathers-errors/handler");
const notFound = require("feathers-errors/not-found");
const mustacheExpress = require("mustache-express");
const logger = require("winston");
const less = require("less");
const fs = require("fs");
const nunjucks = require("nunjucks");
const conf = require("../content/config").default;
const cms = require("../content/cms").default;
const servicesApi = require("../content/servicesApi");
const cmsApi = require("../content/cmsApi").default;
const ReactApp = require("../App").default;

const React = require("react");
const renderToString = require("react-dom/server").renderToString;
const { store, history } = require("../store");
const Provider = require("react-redux").Provider;
const _ = require("lodash");
const toMarkdown = require("to-markdown");

const app = feathers();
app.configure(configuration());

app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Plugins and providers
app.configure(hooks());
app.configure(rest());
app.configure(socketio());

app.get("/config", (rq, res) => {
	let serverConf = JSON.stringify({
		serverUrl: process.env.BACKEND_URL,
		hostname: rq.headers.host,
	});

	let config = Object.assign(serverConf, conf);
	let responseText = `
    window.siteConfig =  ${config}
    `;

	res.contentType("application/javascript");
	res.send(responseText);
});

var mainRequest = function(context) {
	return function(request, response, next) {
		fs.readFile(path.join(path.dirname(path.dirname(__dirname)), "build", "index.html"), (err, data) => {
			if (err) throw err;

			var fullUrl = request.protocol + "://" + request.headers.host + request.originalUrl;
			let hostname = request.headers.host;
			nunjucks.renderString(data.toString(), Object.assign(context, { hostname: hostname, url: fullUrl }), function(err, compiled) {
				response.send(compiled);
			});
		});
	};
};
const parseLanguage = function(req) {
	let selectedLanguage = "en";
	if ("accept-language" in req.headers) {
		let languages = req.headers["accept-language"]
			.split(",")
			.map(l => _.first(l.split("-")))
			.map(l => _.first(l.split(";")));

		const favoriteLanguage = _.first(languages);
		if (favoriteLanguage !== selectedLanguage) {
			selectedLanguage = favoriteLanguage;
		}
	}
	if ("language" in req.query) {
		selectedLanguage = req.query.language;
	}
	return selectedLanguage;
};

const markdownOptions = {
	converters: [
		{
			filter: ["span"],

			replacement: function(innerHTML, node) {
				return innerHTML;
			},
		},
	],
};

// Host the public folder
app.get("/", mainRequest({}));
app.use("/", feathers.static("build"));
app.get("/:country/services/:serviceId/", function(req, res, err) {
	const selectedLanguage = parseLanguage(req);
	const { country, serviceId } = req.params;

	try {
		servicesApi
			.fetchServiceById(selectedLanguage, serviceId)
			.then(s => {
				return mainRequest({
					title: s.name,
					description: toMarkdown(s.description, markdownOptions).replace(/&nbsp;/gi, " "),
					image: s.image,
				})(req, res, err);
			})
			.catch(e => mainRequest({})(req, res, err));
	} catch (e) {
		res.send(500);
	}
});
app.get("/:country/:category/:article", function(req, res, err) {
	const selectedLanguage = parseLanguage(req);
	let configKey = _.first(
		Object.keys(conf).filter(k => {
			return req.headers.host.indexOf(k) > -1;
		})
	);
	let context = {};
	const { country, category, article } = req.params;
	try {
		if (configKey) {
			const { accessToken, space } = conf[configKey];
			let cms = cmsApi(conf[configKey]);
			cms.client
				.getEntries({
					content_type: "article",
					"fields.slug": article,
				})
				.then(c => {
					let match = _.first(c.items.filter(i => i.fields.country.fields.slug === country && i.fields.category.fields.slug === category));
					if (!match) {
						mainRequest({})(req, res, err);
					} else {
						return mainRequest({
							title: match.fields.title,
							description: match.fields.lead.replace(/&nbsp;/gi, " "),
							image: (match.fields.hero && match.fields.hero.fields.file.url) || "",
						})(req, res, err);
					}
					F;
				})
				.catch(e => mainRequest({})(req, res, err));
		}
	} catch (e) {
		res.send(500);
	}
});

app.get("*", mainRequest({}));

app.use(notFound());
app.use(handler());

const port = app.get("port") || process.env.PORT || 3000;
const host = app.get("host") || "localhost";

app.set("port", port);
app.set("host", host);

const server = app.listen(port);

process.on("unhandledRejection", (reason, p) => logger.error("Unhandled Rejection at: Promise ", p, reason));

server.on("listening", () => logger.info(`Feathers application started on ${app.get("host")}:${port}`));
