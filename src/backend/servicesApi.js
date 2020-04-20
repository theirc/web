import getSessionStorage from "../shared/sessionStorage";
import instance from './settings';

var request = require("superagent");
var Promise = require("bluebird");
var _ = require("lodash");
const BACKEND_URL = instance.env.backendUrl;

module.exports = {
	fetchCategories(language, region) {
		return new Promise((resolve, reject) => {
			// Do not cache, categories order changes
			request
				.get(BACKEND_URL + "/service-types/" + (region ? `?region=${region}` : ""))
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
	fetchRegions(language) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();

			if (sessionStorage[`${language}-regions`]) {
				resolve(JSON.parse(sessionStorage[`${language}-regions`]));
			} else {
				request
					.get(BACKEND_URL + "/regions/?exclude_geometry=true")
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}

						try {
							sessionStorage[`${language}-regions`] = JSON.stringify(res.body);
						} catch (e) {
							console.log('Session storage is full. Request not cached.');
						}

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
					.get(BACKEND_URL + "/regions/?countries=true")
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}

						try {
							sessionStorage[`${language}-countries`] = JSON.stringify(res.body);
						} catch (e) {
							console.log('Session storage is full. Request not cached.');
						}
						
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
					.get(BACKEND_URL + "/service-types/" + categoryId + "/")
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

	fetchAllServices(country, language, categoryId, searchTerm, pageSize = 1000, ignoreRegions = false, pageStart = 1) {
		//If the region is a country, search for all the services in any location from that country
		//If the region is a city, search for all the services in the city AND country wide services
		let filter = ignoreRegions ? 'relatives' : "with-parents";

		// if (!ignoreRegions && sessionStorage[`${language}-regions`]) {
		if (!ignoreRegions) {
			let regions = JSON.parse(sessionStorage[`${language}-regions`]);
			let region = _.first(regions.filter(c => c.slug === country));
			filter = region.level === 3 ? "with-parents" : "relatives";
		}

		return new Promise((resolve, reject) => {
			let sl = sessionStorage[`serviceList`] !== undefined ? JSON.parse(sessionStorage[`serviceList`]) : null;

			if (sl && sl.country === country && sl.language === language && sl.categoryId === categoryId && (sl.searchTerm === null || sl.searchTerm === undefined)) {
				if (sl.categoryId == null && sl.services.results && categoryId) {
					window.serviceList = sl.services.results;
					let list = sl.services.results && sl.services.results.filter(s => {
						return (s.type && s.type.id === categoryId) || (s.types && s.types.filter(t => { return t.id === categoryId }).length > 0)
					});
					sl.services.results = list;
					resolve(sl.services);
				} else {
					resolve(sl.services);
				}
			} else {
				var requestUrl =
				"/services/searchlist/?filter=" + filter + "&geographic_region=" +
				country +
				"&page=" + pageStart +
				"&page_size=" + pageSize +
				"&type_numbers=" +
				(categoryId || "") +
				(searchTerm ? "&search=" + searchTerm : "");
				
				const headers = { 'Accept-Language': language };

				fetch(BACKEND_URL + requestUrl, { headers })
					.then(res => res.json())
					.then(response => {
						let services = response

						resolve(services);
					})
					.catch((err) => {
						console.log("error", err);
						reject(err);
						return;
					});

			}

		});
	},

	fetchAllServicesNearby(country, language, position = [], distance = 5, pageSize = 50) {
		return new Promise((resolve, reject) => {
			var requestUrl = `/services/search/?filter=relatives&geographic_region=${country}&page=1&page_size=${pageSize}&near=${position.join(", ")}&near_km=${distance}`;

			request
				.get(BACKEND_URL + requestUrl)
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
		console.log('fetchServiceById', BACKEND_URL);
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			let list = (sessionStorage && sessionStorage[`offline-services`] !== undefined) ? JSON.parse(sessionStorage[`offline-services`]) : null;

			if (typeof window !== 'undefined' && !window.navigator.onLine && list && list.filter(s => { return s.id === serviceId }).length > 0) {
				let service = list.services.results.filter(c => { return c.id === serviceId });
				resolve(_.first(service));
			} else {
				request
					.get(BACKEND_URL + "/services/search/?id=" + serviceId)
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}
						let services = _.first(res.body);

						resolve(services);
					});
			}
		});
	},

	fetchServicePreviewById(language, serviceId) {
		return new Promise((resolve, reject) => {
			request
				.get(BACKEND_URL + "/services/preview/?id=" + serviceId)
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
				.get(BACKEND_URL + "/services/" + serviceId + "/get_same_coordinates_services/")
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
