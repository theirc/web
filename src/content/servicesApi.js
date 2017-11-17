var request = require("superagent");
var Promise = require("bluebird");
var _ = require("lodash");

//var RI_URL = "https://admin.refugee.info/e/production/v2";
var RI_URL = "http://localhost:8000/e/production/v2";

module.exports = {
	fetchCategories(language) {
		return new Promise((resolve, reject) => {
			request
				.get(RI_URL + "/service-types/")
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
						return;
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
						return;
					}

					resolve(res.body);
				});
		});
	},
	fetchAllServices(country, language, categoryId, searchTerm, pageSize = 1000) {
		return new Promise((resolve, reject) => {
			var requestUrl =
				"/services/search/?filter=relatives&geographic_region=" +
				country +
				"&page=1&page_size=" +
				pageSize +
				"&type_numbers=" +
				(categoryId || "") +
				(searchTerm ? "&search=" + searchTerm : "");
			request
				.get(RI_URL + requestUrl)
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
						return;
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
						return;
					}
					let services = _.first(res.body);

					resolve(services);
				});
		});
	},
};
