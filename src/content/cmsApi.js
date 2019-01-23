import getSessionStorage from "../shared/sessionStorage";
import { Promise } from "es6-promise";

const contentful = require("contentful");

function cmsApi(config) {
	let languageDictionary = {
		en: "en-US",
		ar: "ar-001",
		fa: "fa-AF",
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
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			if(sessionStorage[`${language}-${slug}`] && sessionStorage[`${language}-${slug}`] !== []) {
				let e = JSON.parse(sessionStorage[`${language}-${slug}`]);
				let entities = client.parseEntries(e);

				resolve(entities.items[0]);
			} else {
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
						let entities = client.parseEntries(e);
						let { items } = entities;

						if (items.length === 0) {
							if (global.location) {
								global.document.location = "/";
							} else {
								throw Error("No Country Found");
							}
						}

						sessionStorage[`${language}-${slug}`] = toStore;
						resolve(items[0]);
					});
			}
		});
	}

	return {
		client,
		loadCountry,
		listCountries,
	};
}

export default cmsApi;
