export default {
	brand: {
		images: {
			favicon: '/images/favicons/favicon.ico',
			logo: '/images/logos/logo-ri-white.png',
			logoBlack: '/images/logos/logo-ri-black.png',
			thumbnail: '/images/logos/ri-thumbnail.png',
		},
		code: 'ri',
		name: 'Refugee Info',
		tabTitle: 'Refugee Info',
		theme: 'irc',
		url: 'refugee.info'
	},
	countries: {
		'bulgaria': require('./countries/bulgaria').default,
		'greece': require('./countries/greece').default,
		'italy': require('./countries/italy').default,
		'serbia': require('./countries/serbia').default,
	},
	defaultLanguage: 'en',
	env: null, // dynamically loaded
	envs: {
		qa: require('./envs/qa').default,
		staging: require('./envs/staging').default,
		www: require('./envs/www').default
	},
  languages: [['en', 'English'], ['ar', 'العربيـة'], ['fa', 'فارسی'], ['fr', 'Français'], ['ur', 'اردو']], // English shows first in LanguageSelector
  // Note: in countries/xxx.js you can set the available languages for each country with a `languages` array, however you need to remember to set the same values for said country in each environment's DataBase `regions_geographicregion` table's `languages_available` column
	switches: { // TODO: change this to enable
		cookieBanner: true,
		disableCountrySelector: false,
		disableLanguageSelector: false,
	},
	thirdParty: {
		facebook: {
			appId: "708254579325899",
		}
	}
};
