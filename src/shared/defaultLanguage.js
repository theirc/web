// libs
import queryString from "query-string";

// local
import instance from '../backend/settings';
import getLocalStorage from "./localStorage";

const localStorage = getLocalStorage();
let defaultLanguage = instance.defaultLanguage;

if (global.window && global.location && global.navigator) {
	let parsed = queryString.parse(global.location.search);

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
	
	let country = global.window.location.pathname.split('/')[1].replace('?', '');
	if (instance.countries[country] && !instance.countries[country].languages.includes(defaultLanguage)) {
		defaultLanguage = instance.defaultLanguage;
		localStorage.language = defaultLanguage;
	}
}

export default defaultLanguage;
