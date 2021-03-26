import getSessionStorage from "../shared/sessionStorage";
import instance from "./settings";

var request = require("superagent");
var Promise = require("bluebird");
const BACKEND_URL = instance.env.backendUrl;
const INSTANCE_ID = instance.env.instanceId;

function servicesApi() {
  function fetchCategoriesByCountry(language, countryId) {
    return new Promise((resolve, reject) => {
      request
        .get(
          BACKEND_URL +
            `/service-categories/by-country/?countryId=${countryId}&language=${language}&hasService=1`
        )
        .set("Accept-Language", language)
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(res.body);
        });
    });
  }

  function fetchCategoriesByRegion(language, regionId) {
    return new Promise((resolve, reject) => {
      request
        .get(
          BACKEND_URL +
            `/service-categories/by-region/?regionId=${regionId}&language=${language}&hasService=1`
        )
        .set("Accept-Language", language)
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(res.body);
        });
    });
  }

  function fetchCategoriesByCity(language, cityId) {
    return new Promise((resolve, reject) => {
      request
        .get(
          BACKEND_URL +
            `/service-categories/by-city/?cityId=${cityId}&language=${language}&hasService=1`
        )
        .set("Accept-Language", language)
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(res.body);
        });
    });
  }

  function fetchRegions(language, countrySlug) {
    return new Promise((resolve, reject) => {
      const sessionStorage = getSessionStorage();
      // const country = sessionStorage[`${language}-countries`] ?
      // JSON.parse(sessionStorage[`${language}-countries`]).filter(c => c.slug === countrySlug)[0] : '';
      // var requestUrl =
      // "/regions/list/" + (country ? `?countryId=${country.id}&language=${language}&hasService=1` : "");
      var requestUrl = "/regions/list/";
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
            instance.languages.map((i) =>
              sessionStorage.removeItem(`${i[0]}-regions`)
            );
            sessionStorage[`${language}-regions`] = JSON.stringify(res.body);
          } catch (e) {
            console.log("Session storage is full. Regions Request not cached.");
          }

          resolve(res.body);
        });
    });
  }

  function fetchCities(regionId, language) {
    return new Promise((resolve, reject) => {
      request
        .get(
          BACKEND_URL +
            `/cities/list/?regionId=${regionId}&language=${language}&hasService=1`
        )
        .set("Accept-Language", language)
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(res.body);
        });
    });
  }

  function fetchCountries(language) {
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
              instance.languages.map((i) =>
                sessionStorage.removeItem(`${i[0]}-countries`)
              );
              sessionStorage[`${language}-countries`] = JSON.stringify(
                res.body
              );
            } catch (e) {
              console.log(
                "Session storage is full. Countries Request not cached."
              );
            }

            resolve(res.body);
          });
      }
    });
  }

  function fetchCategoryById(language, categoryId) {
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
  }

  function fetchAllServices(
    countryId,
    language,
    categoryId,
    regionId,
    cityId,
    searchTerm,
    status
  ) {
    var requestUrl =
      "/services/list/?countryId=" +
      (countryId || "") +
      (searchTerm ? `&search=${searchTerm}` : "") +
      (categoryId ? `&serviceCategories=${categoryId}` : "") +
      (regionId ? `&regionId=${regionId}` : "") +
      (cityId ? `&cityId=${cityId}` : "") +
      (status ? `&status=${status}` : "") +
      "&language=" +
      (language || "");
    return new Promise((resolve, reject) => {
      const sessionStorage = getSessionStorage();
      const servicesStored =
        sessionStorage[`${language}-serviceList`] &&
        !!JSON.parse(sessionStorage[`${language}-serviceList`]).length &&
        JSON.parse(sessionStorage[`${language}-serviceList`])[0].countryId ===
          countryId;
      const servicesFetched =
        sessionStorage[`${language}-serviceRequest`] &&
        sessionStorage[`${language}-serviceRequest`] === requestUrl;
      if (servicesStored && servicesFetched) {
        resolve(JSON.parse(sessionStorage[`${language}-serviceList`]));
      } else {
        request
          .get(BACKEND_URL + requestUrl)
          .set("Accept-Language", language)
          .end((err, res) => {
            if (err) {
              reject(err);
              return;
            }

            const filteredServices = res.body.filter(
              (service) => service.status === "public"
            );

            function compare(a, b) {
              // Use toUpperCase() to ignore character casing
              const provA = a.provider.name.toLowerCase();
              const provB = b.provider.name.toLowerCase();

              let comparison = 0;
              if (provA > provB) {
                comparison = 1;
              } else if (provA < provB) {
                comparison = -1;
              }
              return comparison;
            }

            const orderedServices = filteredServices.sort(compare);

            try {
              // remove unused session items
              instance.languages.map((i) => {
                sessionStorage.removeItem(`${i[0]}-serviceList`);
                sessionStorage.removeItem(`${i[0]}-serviceRequest`);
              });
              sessionStorage[`${language}-serviceList`] = JSON.stringify(
                orderedServices
              );
              sessionStorage[`${language}-serviceRequest`] = requestUrl;
            } catch (e) {
              console.log(
                "Session storage is full. Services Request not cached."
              );
            }

            resolve(orderedServices);
          });
      }
    });
  }

  function fetchServiceById(language, serviceId) {
    return new Promise((resolve, reject) => {
      request
        .get(BACKEND_URL + "/services/" + serviceId +'&language=' + language)
        .set("Accept-Language", language)
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(res.body);
        });
    });
  }

  function fetchServicePreviewById(language, serviceId) {
    return new Promise((resolve, reject) => {
      request
        .get(BACKEND_URL + "/services/preview/?id=" + serviceId)
        .set("Accept-Language", language)
        .end((err, res) => {
          if (err) {
            reject(err);
            return;
          }
          let services = res.body[0];

          resolve(services);
        });
    });
  }

  return {
	fetchCategoriesByCountry,
	fetchCategoriesByRegion,
	fetchCategoriesByCity,
	fetchRegions,
	fetchCities,
	fetchCountries,
	fetchCategoryById,
	fetchAllServices,
	fetchServiceById,
	fetchServicePreviewById
  }
}

export default servicesApi;