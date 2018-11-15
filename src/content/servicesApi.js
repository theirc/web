import getSessionStorage from "../shared/sessionStorage";
import cms from "./cms";

var request = require("superagent");
var Promise = require("bluebird");
var _ = require("lodash");
var { siteConfig } = cms;
var RI_URL = "https://admin.refugee.info/e/production/v2";
if (siteConfig && siteConfig.backendUrl) {
	RI_URL = siteConfig.backendUrl;	
}

//var RI_URL = "http://localhost:8000/e/production/v2";
module.exports = {
	fetchCategories(language, region) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			if (sessionStorage[`${language}-${region}-service-categories`] && sessionStorage[`${language}-${region}-service-categories`] !== "[]") {
				resolve(JSON.parse(sessionStorage[`${language}-${region}-service-categories`]));
			} else {
				request
					.get(RI_URL + "/service-types/" + (region ? `?region=${region}` : ""))
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}
						sessionStorage[`${language}-${region}-service-categories`] = JSON.stringify(res.body);
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
	fetchCountries(language) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			if (sessionStorage[`${language}-countries`]) {
				resolve(JSON.parse(sessionStorage[`${language}-countries`]));
			} else {
				request
					.get(RI_URL + "/regions/?countries=true")
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}
						sessionStorage[`${language}-countries`] = JSON.stringify(res.body);
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
		//If the region is a country, search for all the services in any location from that country
		//If the region is a city, search for all the services in the city AND country wide services
		let filter = "with-parents";
		if (sessionStorage[`${language}-regions`]){
			let regions = JSON.parse(sessionStorage[`${language}-regions`]);			
			let region = _.first(regions.filter(c => c.slug == country));
			filter = region.level == 1 ? "relatives" : "with-parents";
		}
		return new Promise((resolve, reject) => {
			var requestUrl =
				"/services/searchlist/?filter="+ filter +"&geographic_region=" +
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
	fetchAllServicesInBBox(country, language, bounds = [], pageSize = 200, category = null) {
		return new Promise((resolve, reject) => {
			var requestUrl = `/services/searchlist/?filter=relatives&geographic_region=${country}&page=1&page_size=${pageSize}&bounds=${bounds.join(", ")}`;
			if (category) {
				requestUrl += "&type_numbers=" + (category || "");
			}
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
