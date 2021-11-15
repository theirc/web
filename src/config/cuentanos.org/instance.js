export default {
	brand: {
		code: 'cn',
		images: {
			favicon: '/images/favicons/cn-favicon-blk.png',
			logo: '/images/logos/logo-cn-white.png',
			logoBlack: '/images/logos/logo-cn-black.png',
			thumbnail: '/images/logos/cn-thumbnail.png',
		},
		name: 'CuentaNos',
		tabTitle: 'Bienvenidos a CuentaNos',
		theme: 'generic',
		url: 'cuentanos.org'
	},
	countries: {
		'el-salvador': require('./countries/el-salvador').default,
		'guatemala': require('./countries/guatemala').default,
		'honduras': require('./countries/honduras').default,
		'colombia': require('./countries/colombia').default,
	},
	defaultLanguage: 'es',
	env: null, // dynamically loaded
	envs: {
		qa: require('./envs/qa').default,
		'theirc-refugee-info-frontend-qa': require('./envs/theirc-refugee-info-frontend-qa').default,
		staging: require('./envs/staging').default,
		'theirc-refugee-info-frontend-staging': require('./envs/theirc-refugee-info-frontend-staging').default,
		www: require('./envs/www').default
	},
	languages: [['es', 'Español']],
	switches: {
		cookieBanner: false,
		disableCountrySelector: false,
		disableLanguageSelector: true,
	},
	thirdParty: {
		facebook: {
			appId: '209295296327422',
		}
	}
};
