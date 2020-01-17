const _ = require("lodash");
const instance = require('../backend/settings').default;

module.exports = {
	/**
	 * @function
	 * @description 
	 */
	parseLanguage(req) {
		let possibleLanguages = instance.languages.map(l => l[0]);
		let selectedLanguage = "en";

		if ("language" in req.query) {
			selectedLanguage = req.query.language;
		} else if ("accept-language" in req.headers) {
			let languages = req.headers["accept-language"]
				.split(",")
				.map(l => _.first(l.split("-")))
				.map(l => _.first(l.split(";")));

			const favoriteLanguage = _.first(languages);
			if (favoriteLanguage !== selectedLanguage) {
				selectedLanguage = favoriteLanguage;
			}
		}

		return possibleLanguages.indexOf(selectedLanguage) > -1 ? selectedLanguage : possibleLanguages[0];
	}
}
