// libs
import queryString from "query-string";

// local
import instance from '../backend/settings';
import getLocalStorage from "./localStorage";

const localStorage = getLocalStorage();
let defaultLanguage = instance.defaultLanguage;

if (global.window && global.location && global.navigator) {
	let parsed = queryString.parse(global.location.search);

	// Choose the language by priority in this order:
	// 1. Query string in url
	// 2. Local storage through language var
	// 3. Navigator settings
	// 4. Navigator settings
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
	
	// Get country from url if available
	let country = global.window.location.pathname.split('/')[1].replace('?', '');

	// Check at instance level
	let validLanguage = !!instance.languages.filter(l => l[0] === defaultLanguage).length;

	// Check at country level only if country exists in url
	instance.countries[country] && (validLanguage = instance.countries[country].languages.includes(defaultLanguage))

	// Override with defaults if the language is not available at instance/country level
	if (!validLanguage) {
		defaultLanguage = instance.defaultLanguage;
		localStorage.language = defaultLanguage;
	}
}

export default defaultLanguage;
