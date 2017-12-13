import getSessionStorage from "../shared/sessionStorage";

const contentful = require("contentful");

function cmsApi(config) {
	let languageDictionary = {
		en: "en-US",
		ar: "ar-001",
		fa: "fa-AF",
		es: "es-491",
	};

	let client = contentful.createClient({
		...config,
	});
	function listCountries(language = "en") {
		return client.getEntries({
			content_type: "country",
			locale: languageDictionary[language] || language,
		});
	}

	function loadCountry(slug, language = "en") {
		return client
			.getEntries({
				content_type: "country",
				"fields.slug": slug,
				include: 10,
				locale: languageDictionary[language]|| language,
				resolveLinks: false,
			})
			.then((e, r) => {
				let toStore = e.stringifySafe();
				const sessionStorage = getSessionStorage();
				sessionStorage.country = toStore;

				let entities = client.parseEntries(e);
				let { items } = entities;

				if (items.length === 0) {
					if (global.location) {
						global.document.location = "/";
					} else {
						throw Error("No Country Found");
					}
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
