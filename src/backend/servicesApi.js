import getSessionStorage from "../shared/sessionStorage";
import instance from './settings';

var request = require("superagent");
var Promise = require("bluebird");
var _ = require("lodash");
const BACKEND_URL = instance.env.backendUrl;
const INSTANCE_ID = instance.env.instanceId;

module.exports = {
	fetchCategoriesByCountry(language, countryId) {
		return new Promise((resolve, reject) => {
			// Do not cache, categories order changes
			request
				.get(BACKEND_URL + `/service-categories/by-country/?countryId=${countryId}&language=${language}`)
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
	fetchCategoriesByRegion(language, regionId) {
		return new Promise((resolve, reject) => {
			// Do not cache, categories order changes
			request
				.get(BACKEND_URL + `/service-categories/by-region/?regionId=${regionId}&language=${language}`)
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
	fetchCategoriesByCity(language, cityId) {
		return new Promise((resolve, reject) => {
			// Do not cache, categories order changes
			request
				.get(BACKEND_URL + `/service-categories/by-city/?cityId=${cityId}&language=${language}`)
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
					.get(BACKEND_URL + "/regions/list/")
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}

						try {
							// remove unused session items
							instance.languages.map(i => sessionStorage.removeItem(`${i[0]}-regions`));
							sessionStorage[`${language}-regions`] = JSON.stringify(res.body);
						} catch (e) {
							console.log('Session storage is full. Regions Request not cached.');
						}

						resolve(res.body);
					});
			}
		});
	},

	fetchCities(regionId, language) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();

			if (sessionStorage[`${language}-cities`]) {
				resolve(JSON.parse(sessionStorage[`${language}-cities`]));
			} else {
				request
					.get(BACKEND_URL + "/cities/list/?regionId=" + regionId)
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

	fetchCountries(language) {
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			if (sessionStorage[`${language}-countries`]) {
				resolve(JSON.parse(sessionStorage[`${language}-countries`]));
			} else {
				request
					.get(BACKEND_URL + "/countries/list/?instanceId=" + INSTANCE_ID)
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}

						try {
							// remove unused session items
							instance.languages.map(i => sessionStorage.removeItem(`${i[0]}-countries`));
							sessionStorage[`${language}-countries`] = JSON.stringify(res.body);
						} catch (e) {
							console.log('Session storage is full. Countries Request not cached.');
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

	fetchAllServices(countryId, language, categoryId, regionId, cityId, searchTerm, status, ignoreRegions = false) {
		//If the region is a country, search for all the services in any location from that country
		//If the region is a city, search for all the services in the city AND country wide services
		//let filter = ignoreRegions ? 'relatives' : "with-parents";
		console.log('FETCH ALL SERVICES');
		console.log(countryId, ', ', language, ', ', categoryId, ', ', searchTerm );

		// if (!ignoreRegions && sessionStorage[`${language}-regions`]) {
		if (!ignoreRegions) {
			let regions = JSON.parse(sessionStorage[`${language}-regions`]);
			let region = _.first(regions.filter(c => c.country.id === countryId));
			//filter = region.level === 3 ? "with-parents" : "relatives";
		}

			return new Promise((resolve, reject) => {
			let sl = sessionStorage[`serviceList`] !== undefined ? JSON.parse(sessionStorage[`serviceList`]) : null;

			if (sl && sl.country === countryId && sl.language === language && sl.categoryId === categoryId && (sl.searchTerm === null || sl.searchTerm === undefined)) {
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
				"/services/list/?countryId=" + (countryId || "") +
				(searchTerm ? `&search=${searchTerm}` : "") +
				(categoryId ? `&serviceCategories=${categoryId}` : "") + 
				(regionId ? `&regionId=${regionId}` : "") +
				(cityId ? `&cityId=${cityId}` : "") +
				(status ? `&status=${status}` : "") +
				"&language=" + (language || "");
				
				const headers = { 'Accept-Language': language };

				request
					.get(BACKEND_URL + requestUrl)
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(res.body);
					});

				// fetch(BACKEND_URL + requestUrl, { headers })
				// 	.then(res => {res.json();})
				// 	.then(data => {
				// 		console.log(data);
				// 		let services = data

				// 		resolve(services);
				// 	})
				// 	.catch((err) => {
				// 		console.log("error", err);
				// 		reject(err);
				// 		return;
				// 	});

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
					.get(BACKEND_URL + "/services/" + serviceId)
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}
						let services = _.first(res.body);

						resolve(res.body);
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
