/**
 * @file
 * @description Initialization for i18n lib, resources are loaded dynamically in each component.
 */

// libs
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// local
import i18nConfig from "./config.js";

const options = {
	fallbackLng: "en",

	interpolation: {
		escapeValue: false, // not needed for react!!
	},
	resources: i18nConfig, // TODO: remove this once it's completely empty

	// react i18next special options (optional)
	react: {
		wait: true,
	},
};

i18n.use(initReactI18next).init(options);

export default i18n;
