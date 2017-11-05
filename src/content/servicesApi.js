var request = require("superagent");
var Promise = require("bluebird");
var _ = require("lodash");

var RI_URL = "https://admin.refugee.info/e/production/v2";

module.exports = {
	fetchCategories(language) {
		return new Promise((resolve, reject) => {
			request
				.get(RI_URL + "/service-types/")
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}

					resolve(res.body);
				});
		});
	},
	fetchCategoryById(language, categoryId) {
		return new Promise((resolve, reject) => {
			request
				.get(RI_URL + "/service-types/" + categoryId + "/")
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}

					resolve(res.body);
				});
		});
	},
	fetchAllServices(country, language, categoryId) {
		return new Promise((resolve, reject) => {
			request
				.get(RI_URL + "/services/search/?filter=relatives&geographic_region=" + country + "&page=1&page_size=1000&type_numbers=" + (categoryId || ""))
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}
					let services = res.body;

					resolve(services);
				});
		});
	},
	fetchServiceById(language, serviceId) {
		return new Promise((resolve, reject) => {
			request
				.get(RI_URL + "/services/search/?id=" + serviceId)
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}
					let services = _.first(res.body);

					resolve(services);
				});
		});
	},
};
