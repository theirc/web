
export default {
	brand: {
		code: 'ki',
		images: {
			favicon: '/images/favicons/ki-favicon.png',
			logo: '/images/logos/logo-ki-white.png',
			logoBlack: '/images/logos/logo-ki-black.png',
			thumbnail: '/images/logos/ki-thumbnail.png',
			},
		name: 'Khabrona Info',
		tabTitle: 'Khabrona.Info',
		theme: 'mc',
		url: 'khabrona.info'
	},
	countries: {
		'jordan': require('./countries/jordan').default,
	},
	defaultLanguage: 'en',
	env: null, // dynamically loaded
	envs: {
		qa: require('./envs/qa').default,
		staging: require('./envs/staging').default,
		www: require('./envs/www').default
	},
	languages: [['en', 'English'], ['ar', 'العربيـة']], // English shows first in LanguageSelector
	switches: {
		cookieBanner: false,
		disableCountrySelector: true,
		disableLanguageSelector: false,
	}
};
