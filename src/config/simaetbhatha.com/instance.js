
export default {
	brand: {
		code: 'iq',
		images: {
			favicon: '/images/favicons/iq-favicon.png',
			logo: '/images/logos/logo-iq-white.png',
			logoBlack: '/images/logos/logo-iq-black.png',
			thumbnail: '/images/logos/iq-thumbnail.png',
			},
		name: 'Simaet Bhatha ',
		tabTitle: 'Simaetbhatha.com',
		theme: 'ri',
		url: 'simaetbhata.com'
	},
	countries: {
		'iraq': require('./countries/iraq').default,
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
	},
	thirdParty: {
		facebook: {
			appId: '154471931830995',
		}
	}
};
