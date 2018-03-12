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
const conf = require("../content/config");
const cms = require("../content/cms").default;
const servicesApi = require("../content/servicesApi");
const cmsApi = require("../content/cmsApi").default;
const ReactApp = require("../App").default;

const React = require("react");
const renderToString = require("react-dom/server").renderToString;
const {
	store,
	history
} = require("../store");
const Provider = require("react-redux").Provider;
const _ = require("lodash");
const toMarkdown = require("to-markdown");
let {
	languageDictionary
} = conf;

const app = feathers();
app.configure(configuration());

app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

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

var mainRequest = function (context) {
	return function (request, response, next) {
		let configKey = _.first(
			Object.keys(conf).filter(k => {
				return request.headers.host.indexOf(k) > -1;
			})
		);

		if (configKey) {
			const {
				appId
			} = conf[configKey];
			context = Object.assign(context || {}, {
				appId: appId
			});
			context.title = context.title || conf[configKey].title;
			context.image = context.image || conf[configKey]["thumbnail"];
		}

		fs.readFile(path.join(path.dirname(path.dirname(__dirname)), "build", "index.html"), (err, data) => {
			if (err) throw err;

			var fullUrl = request.protocol + "://" + request.headers.host + request.originalUrl;
			let hostname = request.headers.host;
			nunjucks.renderString(data.toString(), Object.assign(context, {
				hostname: hostname,
				url: fullUrl
			}), function (err, compiled) {
				response.send(compiled);
			});
		});
	};
};
const parseLanguage = function (req) {
	let configKey = _.first(
		Object.keys(conf).filter(k => {
			return req.headers.host.indexOf(k) > -1;
		})
	);
	let possibleLanguages = ["en"];

	if (configKey) {
		const {
			languages
		} = conf[configKey];
		possibleLanguages = languages.map(l => l[0]);
	}
	let selectedLanguage = "en";

	if ("language" in req.query) {
		selectedLanguage = req.query.language;
	} else if ("accept-language" in req.headers) {
		let languages = req.headers["accept-language"]
			.split(",")
			.map(l => _.first(l.split("-")))
			.map(l => _.first(l.split(";")));

		const favoriteLanguage = _.first(languages);
		if (favoriteLanguage !== selectedLanguage) {
			selectedLanguage = favoriteLanguage;
		}
	}

	return possibleLanguages.indexOf(selectedLanguage) > -1 ? selectedLanguage : 'en';
};

const markdownOptions = {
	converters: [{
		filter: ["span"],

		replacement: function (innerHTML, node) {
			return innerHTML;
		},
	}, ],
};

const getFirsLevel = (slug, selectedLanguage) => {
	return servicesApi
		.fetchRegions(selectedLanguage)
		.then(rs => {
			let selected = _.first(rs.filter(r => r.slug == slug));
			if (selected.level !== 1) {
				const parents = _.fromPairs(rs.map(r => [r.id, r]));

				while (selected.level !== 1) {
					if (!selected.parent || !parents[selected.parent]) break;

					selected = parents[selected.parent];
				}
			}
			return selected.slug;
		})
		.catch(() => slug);
};

// Host the public folder
app.get("/", mainRequest({}));
app.use("/", feathers.static("build"));
app.get("/preview/:serviceId/", function (req, res, err) {
	const selectedLanguage = parseLanguage(req);
	const {
		serviceId
	} = req.params;

	try {
		servicesApi
			.fetchServicePreviewById(selectedLanguage, serviceId)
			.then(s => {
				return getFirsLevel(s.region.slug, selectedLanguage).then(c => {
					res.redirect(`/${c}/services/preview/${serviceId}/`);
				});
			})
			.catch(e => res.redirect("/"));
	} catch (e) {
		res.redirect("/");
	}
});
app.get("/:country/services/:serviceId/", function (req, res, err) {
	const selectedLanguage = parseLanguage(req);
	const {
		country,
		serviceId
	} = req.params;

	try {
		getFirsLevel(country, selectedLanguage).then(c => {
			if (c !== country) {
				res.redirect(`/${c}/services/${serviceId}`);
				return;
			}
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
		});
	} catch (e) {
		mainRequest({
			description: e.toString(),
			image: ""
		})(req, res, err);
	}
});
app.get("/:country/services/", function (req, res, err) {
	const selectedLanguage = parseLanguage(req);
	const {
		country,
		serviceId
	} = req.params;

	getFirsLevel(country, selectedLanguage).then(c => {
		if (c !== country) {
			if (req.query.type) {
				res.redirect(`/${c}/services/by-category/${req.query.type}/`);
			} else {
				res.redirect(`/${c}/services/`);
			}
			return;
		}

		if (req.query.type) {
			res.redirect(`/${country}/services/by-category/${req.query.type}/`);
		} else {
			// There is no ?type= x in the query string
			// https://www.refugee.info/greece/services/?type=x is the format old site
			mainRequest({})(req, res, err);
		}
	});
});

app.get("/:country/:category/:article", function (req, res, err) {
	const selectedLanguage = parseLanguage(req);
	let configKey = _.first(
		Object.keys(conf).filter(k => {
			return req.headers.host.indexOf(k) > -1;
		})
	);
	let context = {};
	const {
		country,
		category,
		article
	} = req.params;
	try {
		if (configKey) {
			getFirsLevel(country, selectedLanguage).then(c => {
				if (c !== country) {
					res.redirect(
						`/${c}/${category}/${article}?${_.toPairs(req.query)
							.map(x => x.join("="))
							.join("&")}`
					);
					return;
				}

				const {
					accessToken,
					space
				} = conf[configKey];
				languageDictionary = Object.assign(languageDictionary, conf[configKey]);

				let cms = cmsApi(conf[configKey], languageDictionary);
				cms.client
					.getEntries({
						content_type: "article",
						"fields.slug": article,
						locale: languageDictionary[selectedLanguage] || selectedLanguage,
					})
					.then(c => {
						return cms.client
							.getEntries({
								content_type: "country",
								"fields.slug": country,
								locale: languageDictionary[selectedLanguage] || selectedLanguage,
								include: 10,
							})
							.then(cc => {
								let match = _.first(c.items.filter(i => i.fields.country && i.fields.category && i.fields.country.fields && i.fields.category.fields)
									.filter(i => i.fields.country.fields.slug === country && i.fields.category.fields.slug === category));
								if (!match) {
									let _cnt = _.first(cc.items);
									let _cat = _.first(_cnt.fields.categories.filter(x=>x).filter(x => x.fields && x.fields.slug === category));
									if (_cat) {
										match = _.first(_cat.fields.articles.filter(x=>x).filter(x => x.fields &&  x.fields.slug === article));
									}
								}

								console.log("match" + match);
								if (!match) {
									return cms.client
										.getEntries({
											content_type: "country",
											"fields.slug": country,
											locale: languageDictionary[selectedLanguage] || selectedLanguage,
										})
										.then(c => {
											if (c.items.length > 0) {
												res.redirect("/" + country);
											} else {
												res.redirect("/");
											}
										});
								} else {
									console.log("fields:" + match.fields);
									return mainRequest({
										title: match.fields.title,
										description: (match.fields.lead || "").replace(/&nbsp;/gi, " "),
										image: (match.fields.hero && match.fields.hero.fields.file && "https:" + match.fields.hero.fields.file.url) || "",
									})(req, res, err);
								}
							});

					})
					.catch(e => {
						console.log(e);
						res.redirect(`/${country}/`);
					});
			});
		}
	} catch (e) {
		mainRequest({
			description: e.toString(),
			image: ""
		})(req, res, err);
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