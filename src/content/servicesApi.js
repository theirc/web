import getSessionStorage from "../shared/sessionStorage";

var request = require("superagent");
var Promise = require("bluebird");
var _ = require("lodash");

var RI_URL = "https://admin.refugee.info/e/production/v2";

//var RI_URL = "http://localhost:8000/e/production/v2";

module.exports = {
	fetchCategories(language) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			if (sessionStorage[`${language}-service-categories`]) {
				resolve(JSON.parse(sessionStorage[`${language}-service-categories`]));
			} else {
				request
					.get(RI_URL + "/service-types/")
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}
						sessionStorage[`${language}-service-categories`] = JSON.stringify(res.body);
						resolve(res.body);
					});
			}
		});
	},
	fetchRegions(language) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			if (sessionStorage[`${language}-regions`]) {
				resolve(JSON.parse(sessionStorage[`${language}-regions`]));
			} else {
				request
					.get(RI_URL + "/regions/?exclude_geometry=true")
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}
						sessionStorage[`${language}-regions`] = JSON.stringify(res.body);
						resolve(res.body);
					});
			}
		});
	},
	fetchCategoryById(language, categoryId) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			if (sessionStorage[`${language}-service-categories`]) {
				let categories = JSON.parse(sessionStorage[`${language}-service-categories`]);
				resolve(_.first(categories.filter(c => c.id === categoryId)));
			} else {
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
			}
		});
	},
	fetchAllServices(country, language, categoryId, searchTerm, pageSize = 1000) {
		return new Promise((resolve, reject) => {
			var requestUrl = "/services/search/?filter=relatives&geographic_region=" + country + "&page=1&page_size=" + pageSize + "&type_numbers=" + (categoryId || "") + (searchTerm ? "&search=" + searchTerm : "");
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
	fetchAllServicesNearby(country, language, position = [], distance = 5, pageSize = 50) {
		return new Promise((resolve, reject) => {
			var requestUrl = `/services/search/?filter=relatives&geographic_region=${country}&page=1&page_size=${pageSize}&near=${position.join(", ")}&near_km=${distance}`;
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
	fetchServicePreviewById(language, serviceId) {
		return new Promise((resolve, reject) => {
			request
				.get(RI_URL + "/services/preview/?id=" + serviceId)
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
	fetchServicesInSameLocation(language, serviceId) {
		// get_same_coordinates_services
		return new Promise((resolve, reject) => {
			request
				.get(RI_URL + "/services/" + serviceId + "/get_same_coordinates_services/")
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
						return;
					}
					let services = res.body.results.filter(r => r.id !== serviceId);

					resolve(services);
				});
		});
	},
};
