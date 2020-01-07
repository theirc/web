
export default {
	brand: {
		code: 'ki',
		images: {
			favicon: "/images/favicons/ki-favicon.png",
			logo: "/images/logos/logo-ki-white.png",
			logoBlack: "/images/logos/logo-ki-black.png",
			thumbnail: "/images/logos/ki-thumbnail.png",
			},
		name: 'Khabrona Info',
		tabTitle: 'Khabrona.Info',
		theme: 'mc',
		url: 'khabrona.info'
	},
	countries: {
		'jordan': require('./countries/jordan').default,
	},
	env: null,
	switches: {
		cookieBanner: false,
		disableCountrySelector: true,
		disableLanguageSelector: false,
	}
};
