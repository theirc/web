// libs
import i18n from "i18next";
import { reactI18nextModule } from "react-i18next";

// local
import i18nConfig from "./config.js";

i18n
//	.use(LanguageDetector)
	.use(reactI18nextModule) // if not using I18nextProvider
	.init({
		fallbackLng: "en",
		debug: false,

		interpolation: {
			escapeValue: false, // not needed for react!!
		},
		resources: i18nConfig,
		saveMissing: true,
		missingKeyHandler: function(lng, ns, key, fallbackValue) {
			window.missingKey = window.missingKey || {};
			window.missingKey[lng] = window.missingKey[lng] || [];
			window.missingKey[lng].push(key);
		},

		// react i18next special options (optional)
		react: {
			wait: false,
			bindI18n: "languageChanged loaded",
			bindStore: "added removed",
			nsMode: "default",
		},
	});

export default i18n;
