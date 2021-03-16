// libs
import { Promise } from "es6-promise";

// local
import getSessionStorage from "../shared/sessionStorage";
import instance from '../backend/settings';
const contentful = require("contentful");

function cmsApi(contentfulConfig = null) {
	let languageDictionary = {
		en: "en-US",
		ar: "ar-001",
		fa: "fa-AF",
	};

	let client = contentful.createClient(contentfulConfig || instance.env.thirdParty.contentful);

	function listCountries(language = "en") {
		return client.getEntries({
			content_type: "country",
			locale: languageDictionary[language] || language,
		});
	}

	function loadCountry(slug, language = "en") {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();

			if (sessionStorage[`${language}-${slug}`] && sessionStorage[`${language}-${slug}`] !== []) {
				let e = JSON.parse(sessionStorage[`${language}-${slug}`]);
				let entities = client.parseEntries(e);

				resolve(entities.items[0]);
			} else {
				return client
					.getEntries({
						content_type: "country",
						"fields.slug": slug,
						include: 10,
						locale: languageDictionary[language] || language,
						resolveLinks: false,
					})
					.then((e, r) => {
						let toStore = e.stringifySafe();
						const sessionStorage = getSessionStorage();
						let entities = client.parseEntries(e);
						let { items } = entities;

						if (items.length === 0 && !global.location) {
							throw Error("No Country Found");
						}

						try {
							// remove unused session items
							instance.languages.map(i => sessionStorage.removeItem(`${i[0]}-${slug}`));
							sessionStorage[`${language}-${slug}`] = toStore;
						} catch (e) {
							console.log('Session storage is full. Request not cached.');
						}
						resolve(items[0]);
					});
			}
		});
	}

	function loadArticle(slug, language = "en") {
		return new Promise((resolve, reject) => {
			return client
				.getEntries({
					content_type: "article",
					"fields.slug": slug,
					locale: languageDictionary[language] || language,
				})
				.then((e, r) => {
					let entities = client.parseEntries(e);
					let { items } = entities;

					if (items.length === 0) {
						if (global.location) {
							global.document.location = "/";
						} else {
							throw Error("No Country Found");
						}
					}
					resolve(items[0]);
				});
		});
	}

	return {
		client,
		loadCountry,
		loadArticle,
		listCountries,
	};
}

export default cmsApi;
