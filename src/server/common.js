const conf = require("../backend/config");
const _ = require("lodash");

module.exports = {
	/**
	 * @function
	 * @description 
	 */
	parseLanguage(req) {
		let hostname = req.hostname || req.headers.host;
		let configKey = _.first(
			Object.keys(conf).filter(k => {
				return hostname.indexOf(k) > -1;
			})
		);
		let possibleLanguages = ["en", "es"];

		if (configKey) {
			const {
				languages
			} = conf[configKey];
			possibleLanguages = languages.map(l => l[0]);
		}
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
