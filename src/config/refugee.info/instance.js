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
	env: null, // dynamically loaded
	envs: {
		qa: require('./envs/qa').default,
		staging: require('./envs/staging').default,
		www: require('./envs/www').default
	},
	languages: [['ar', 'العربيـة'], ['en', 'English'], ['fa', 'فارسی'], ['fr', 'Français'], ['ur', 'اردو']],
	switches: {
		cookieBanner: true,
		disableCountrySelector: false,
		disableLanguageSelector: false,
	}
};
