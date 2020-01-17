import i18n from "i18next";

/**
 * @function
 * @description Helper to lazy load language files in components
 */
const i18nHelpers = {
	loadResource: (json, namespace) => {
		for(let l in json)
			i18n.addResourceBundle(l, namespace, json[l][namespace]);
	}
}

export default i18nHelpers;
