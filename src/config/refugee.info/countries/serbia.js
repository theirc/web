export default {
	countryCode: '', // +381 code was included in services already
	flag: '',
	languages: ['ar', 'en', 'fa', 'ur'],
	movedToPartner: {
		// i18n tags from languages.js except link
		buttons: [
			{
				label: 'banner.Serbia articles label',
				link: 'http://azil.rs/categories',
			},
			{
				label: 'banner.Serbia services label',
				link: 'http://azil.rs/services',
			},
		],
		text: 'banner.Serbia text',
		title: 'banner.Serbia title',
	},
	questionLink: 'https://m.me/refugee.info',
	switches: {
		showArticles: true,
		showDepartments: false,
		showLinkToAdministration: false,
		showServices: true,
	},
	thirdParty: {
		facebook: {
			page: 'https://www.facebook.com/refugee.info'
		}
	}
};
