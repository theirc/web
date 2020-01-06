
export default {
	brand: {
		images: {
			favicon: "/images/favicons/ki-favicon.png",
			logo: "/images/logos/logo-ki-white.png",
			logoBlack: "/images/logos/logo-ki-black.png",
			thumbnail: "/images/logos/ki-thumbnail.png",
			},
		code: 'ki',
		name: 'Khabrona Info',
		tabTitle: 'Khabrona.Info',
		theme: 'mc',
		url: 'khabrona.info'
	},
	countries: {
		'el-salvador': require('./countries/jordan').default,
		'honduras': require('./countries/honduras').default,
	},
	env: null,
	switches: {
		cookieBanner: false,
		disableCountrySelector: true,
		disableLanguageSelector: false,
		showDepartments: true,
	}
};
