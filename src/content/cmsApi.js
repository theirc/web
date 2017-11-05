const contentful = require("contentful");
function cmsApi(config) {
	let client = contentful.createClient({
		...config,
	});
	function listCountries(language = "en") {
		let { languageDictionary } = config;
		if (siteConfig) {
			languageDictionary = Object.assign(languageDictionary, siteConfig.languageDictionary);
		}

		return client.getEntries({
			content_type: "country",
			locale: languageDictionary[language],
		});
	}

	function loadCountry(slug, language = "en") {
		let { languageDictionary } = config;

		if (siteConfig) {
			languageDictionary = Object.assign(languageDictionary, siteConfig.languageDictionary);
		}

		/*
        if (global.sessionStorage && global.sessionStorage.country) {
            const country = JSON.parse(global.sessionStorage.country);
            return Promise.resolve(client.parseEntries(country).items[0]);
        }
        */

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

				let entities = client.parseEntries(e);
				let { items } = entities;

				if (items.length === 0) {
					throw Error("No Country Found");
				}

				return items[0];
			});
	}

	return {
		client,
		loadCountry,
		listCountries,
	};
}

export default cmsApi;
