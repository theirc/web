// libs
import queryString from "query-string";

// local
import cms from "../backend/cms";
import getLocalStorage from "./localStorage";

const localStorage = getLocalStorage();
let defaultLanguage = cms.siteConfig.languages[0][0];

if (global.window && global.location && global.navigator) {
	let parsed = queryString.parse(global.location.search);

	// SP-354 disable tigrinya and french from italy
	for (let i = 0; i < cms.siteConfig.hideLangsPerCountry.length; i++) {
		if (global.location.href.indexOf(`/${cms.siteConfig.hideLangsPerCountry[i].country}`) > 0 &&
			(cms.siteConfig.hideLangsPerCountry[i].langs.indexOf(parsed.language) >= 0 ||
				cms.siteConfig.hideLangsPerCountry[i].langs.indexOf(localStorage.language) >= 0)) {
			parsed.language = 'en';
		}
	}

	if (parsed.language) {
		defaultLanguage = parsed.language;
		localStorage.language = defaultLanguage;
	} else if (localStorage.language) {
		defaultLanguage = localStorage.language;
	} else if (global.navigator.languages) {
		defaultLanguage = global.navigator.languages[0] && global.navigator.languages[0].split("-")[0];
	} else if (global.navigator.language) {
		defaultLanguage = global.navigator.language.split("-")[0];
	}

	if (cms.siteConfig.languages.map(l => l[0]).indexOf(defaultLanguage) === -1) {
		defaultLanguage = cms.siteConfig.languages[0][0];
	}
}

export default defaultLanguage;
