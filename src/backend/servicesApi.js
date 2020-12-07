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
		});
	},

	fetchAllServices(countryId, language, categoryId, regionId, cityId, searchTerm, status) {
		var requestUrl =
			"/services/list/?countryId=" + (countryId || "") +
			(searchTerm ? `&search=${searchTerm}` : "") +
			(categoryId ? `&serviceCategories=${categoryId}` : "") +
			(regionId ? `&regionId=${regionId}` : "") +
			(cityId ? `&cityId=${cityId}` : "") +
			(status ? `&status=${status}` : "") +
			"&language=" + (language || "");
		return new Promise((resolve, reject) => {
			const sessionStorage = getSessionStorage();
			const servicesStored = sessionStorage[`${language}-serviceList`] && (_.first(JSON.parse(sessionStorage[`${language}-serviceList`])).countryId === countryId)
			const servicesFetched = sessionStorage[`${language}-serviceRequest`] && sessionStorage[`${language}-serviceRequest`] === requestUrl;
			if (servicesStored && servicesFetched) {
				resolve(_.orderBy(JSON.parse(sessionStorage[`${language}-serviceList`]), ['providerId']));
			} else {
				request
					.get(BACKEND_URL + requestUrl)
					.set("Accept-Language", language)
					.end((err, res) => {
						if (err) {
							reject(err);
							return;
						}

						try {
							// remove unused session items
							instance.languages.map(i => sessionStorage.removeItem(`${i[0]}-serviceList`) && sessionStorage.removeItem(`${i[0]}-serviceRequest`));
							sessionStorage[`${language}-serviceList`] = JSON.stringify(res.body);
							sessionStorage[`${language}-serviceRequest`] = requestUrl;
						} catch (e) {
							console.log('Session storage is full. Services Request not cached.');
						}

						resolve(_.orderBy(res.body, ['providerId']));
					});
			}
		});
	},

	fetchServiceById(language, serviceId) {
		return new Promise((resolve, reject) => {
			request
				.get(BACKEND_URL + "/services/" + serviceId)
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
	}
};
