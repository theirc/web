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
const logger = require("winston");
const fs = require("fs");
const nunjucks = require("nunjucks");
const conf = require("../backend/config");
const servicesApi = require("../backend/servicesApi");
const cmsApi = require("../backend/cmsApi").default;
const _ = require("lodash");
const toMarkdown = require("to-markdown");
let { languageDictionary } = conf;
let instance = null;

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

/**
 * @function
 * @description 
 */
var mainRequest = function (context) {
	return function (request, response, next) {
		let hostname = request.hostname || request.headers.host;
		let protocol = request.protocol;
		let originalUrl = request.originalUrl;

		// !instance && initInstance(hostname);
		initInstance(hostname);

		const { appId } = instance.thirdParty.facebook;
		context = Object.assign(context || {}, { appId: appId });

		context.title = instance.brand.tabTitle;
		context.image = instance.brand.images.thumbnail;
		console.log(context);

		fs.readFile(path.join(path.dirname(path.dirname(__dirname)), "build", "index.html"), (err, data) => {
			if (err) throw err;

			var fullUrl = protocol + "://" + hostname + originalUrl;
			nunjucks.renderString(data.toString(), Object.assign(context, {
				hostname: hostname,
				url: fullUrl
			}), function (err, compiled) {
				response.send(compiled);
			});
		});
	};
};

const initInstance = (hostname) => {
	instance = require('../backend/settings').default;
	// console.log('Setting up instance for hostname: ', hostname);
	instance = instance.loader(hostname);
	// console.log(instance);
}

/**
 * @function
 * @description 
 */
const parseLanguage = function (req) {
	let possibleLanguages = instance.languages.map(l => l[0]);
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

	return possibleLanguages.indexOf(selectedLanguage) > -1 ? selectedLanguage : possibleLanguages[0];
};

const markdownOptions = {
	converters: [{
		filter: ["span"],

		replacement: function (innerHTML, node) {
			return innerHTML;
		},
	},],
};

/**
 * @class
 * @description 
 */
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
app.get("/", (req, res, err) => mainRequest({})(req, res, err));
app.use("/", feathers.static("build"));
app.use("/images", feathers.static("build/images"));
app.use("/fonts", feathers.static("build/fonts"));

app.get("/bulgaria/*", function (req, res, err) {
	res.redirect(`/bulgaria`);
})

require('./twilio-routes.js')(app);

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
app.get('/:country/subscribe/:category', function(req, res, err){
    return mainRequest({
        title: "Subscripción",
        description: "Subscrición a notificaciones",
        image: "",
    })(req, res, err);
})

app.get("/:country/:category/:article", function(req, res, err) {
		initInstance(req.headers.host);

		const selectedLanguage = parseLanguage(req);

    let configKey = _.first(
        Object.keys(conf).filter(k => {
            return req.headers.host.indexOf(k) > -1;
        })
    );
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

				languageDictionary = Object.assign(languageDictionary, conf[configKey]); // TODO: replace this config by the new instances
				console.log('LOCALE: ', languageDictionary[selectedLanguage] || selectedLanguage);
				let cms = cmsApi(instance.env.thirdParty.contentful);
				cms.client
					.getEntries({
						content_type: "article",
						"fields.slug": article,
						locale: languageDictionary[selectedLanguage] || selectedLanguage,
					})
					.then(c => {
						console.log('STEP 1\n');
						return cms.client
							.getEntries({
								content_type: "country",
								"fields.slug": country,
								locale: languageDictionary[selectedLanguage] || selectedLanguage,
								include: 10,
							})
							.then(cc => {
								let match = _.first((c.items || []).filter(i => i.fields.country && i.fields.category && i.fields.country.fields && i.fields.category.fields)
								.filter(i => i.fields.country.fields.slug === country && i.fields.category.fields.slug === category));

								console.log('STEP 2\n');
								
								if (!match) {
									let _cnt = _.first(cc.items);
									let _cat = _.first((_cnt.fields.categories || []).filter(x => {
										return x.fields && x.fields.slug === category;
									}));
									
									if (_cat) {
										console.log('STEP 3\n');
										match = _.first((_cat.fields.articles || []).concat([_cat.fields.overview]).filter(x => x).filter(x => x.fields && x.fields.slug === article));
									}
								}
								
								// console.log("match" + match);
								if (!match) {
									console.log('STEP 4\n');
									return cms.client
										.getEntries({
											content_type: "country",
											"fields.slug": country,
											locale: 'es',//languageDictionary[selectedLanguage] || selectedLanguage,
										})
										.then(c => {
											if (c.items.length > 0) {
												res.redirect("/404");
											} else {
												res.redirect("/");
											}
										});
								} else {
									console.log('STEP 5\n');
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
						// res.redirect(`/${country}/`);
						res.redirect(`/404`);
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

app.get("*", (req, res, err) => mainRequest({})(req, res, err));

app.use(notFound());
app.use(handler());

const port = app.get("port") || process.env.PORT || 3000;
const host = app.get("host") || "localhost";

app.set("port", port);
app.set("host", host);

const server = app.listen(port);

process.on("unhandledRejection", (reason, p) => logger.error("Unhandled Rejection at: Promise ", p, reason));

server.on("listening", () => logger.info(`Feathers application started on ${app.get("host")}:${port}`));
