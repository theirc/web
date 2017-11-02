const config = require("./config").default;
const contentful = require("contentful");
let client = null;
let siteConfig = null;

for (let key of Object.keys(config)) {
	if (global.window && global.window.location) {
		if (window.location.hostname.indexOf(key) > -1) {
			siteConfig = config[key];
			client = contentful.createClient({
				...siteConfig,
			});
		}
	}
}

if (!client) {
	siteConfig = config["refugee.info"];
	client = contentful.createClient({
		...siteConfig,
	});
}

function loadCountry(slug, language = "en") {
	let { languageDictionary } = config;

	if (siteConfig) {
		languageDictionary = Object.assign(languageDictionary, siteConfig.languageDictionary);
	}

	if (global.sessionStorage && global.sessionStorage.country) {
		const country = JSON.parse(global.sessionStorage.country);
		return Promise.resolve(client.parseEntries(country).items[0]);
	}

	return client
		.getEntries({
			content_type: "country",
			"fields.slug": slug,
			include: 10,
			locale: languageDictionary[language],
			resolveLinks: false,
		})
		.then((e, r) => {
			let toStore = e.stringifySafe();
			global.sessionStorage.country = toStore;
			//console.log(toStore, '\n\n\n\n', client);

			let entities = client.parseEntries(e);
			let { items } = entities;

			if (items.length === 0) {
				throw Error("No Country Found");
			}

			return items[0];
		});
}

export default {
	client,
	loadCountry,
	siteConfig,
};
