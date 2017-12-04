import cms from "../content/cms";
import queryString from "query-string";
import getSessionStorage from "./sessionStorage";

const sessionStorage = getSessionStorage();
let defaultLanguage = "en";

if (global.window && global.location && global.navigator) {
	const parsed = queryString.parse(global.location.search);

	if (parsed.language) {
		defaultLanguage = parsed.language;
	} else if (sessionStorage.language) {
		defaultLanguage = sessionStorage.language;
	} else if (global.navigator.languages) {
		defaultLanguage = global.navigator.languages[0] && global.navigator.languages[0].split("-")[0];
	} else if (global.navigator.language) {
		defaultLanguage = global.navigator.language.split("-")[0];
	}

	if (cms.siteConfig.languages.map(l => l[0]).indexOf(defaultLanguage) === -1) {
		defaultLanguage = "en";
	}
}

export default defaultLanguage;
