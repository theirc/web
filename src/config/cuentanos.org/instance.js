
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
		'honduras': require('./countries/honduras').default,
	},
	env: null,
	switches: {
		cookieBanner: false,
		disableCountrySelector: false,
		disableLanguageSelector: true,
	}
};
