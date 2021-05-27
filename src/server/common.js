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
				.map(l => l.split("-")[0])
				.map(l => l.split(";")[0]);

			const favoriteLanguage = languages[0];
			if (favoriteLanguage !== selectedLanguage) {
				selectedLanguage = favoriteLanguage;
			}
		}

		return possibleLanguages.indexOf(selectedLanguage) > -1 ? selectedLanguage : possibleLanguages[0];
	}
}
