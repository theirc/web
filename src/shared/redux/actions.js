import { createAction } from "redux-actions";

const actionTypes = {
	changeOrganization: "CHANGE_ORGANIZATION",
	changeCountry: "CHANGE_COUNTRY",
	changeDefaultLocation: "CHANGE_DEFAULT_LOCATION",
	changeLanguage: "CHANGE_LANGUAGE",
	selectCategory: "SELECT_CATEGORY",
	selectArticle: "SELECT_ARTICLE",
	recordMatch: "RECORD_MATCH",
	selectCountryList: "SELECT_COUNTRY_LIST",
	recordCoordinates: "RECORD_COORDINATES",
	changeDeviceType: "CHANGE_DEVICE_TYPE",
	toggleServiceMap: "TOGGLE_SERVICE_MAP",

	toggleServiceGeolocation: "TOGGLE_SERVICE_GEOLOCATION",
	loadingGeolocation: "LOADING_GEOLOCATION",
	errorGeolocation: "ERROR_GEOLOCATION",
	showErrorMessage: "SHOW_ERROR_MESSAGE",
	storeRegions: "STORE_REGIONS",
};

export default {
	actionTypes,
	showErrorMessage: createAction(actionTypes.showErrorMessage),
	errorGeolocation: createAction(actionTypes.errorGeolocation),
	loadingGeolocation: createAction(actionTypes.loadingGeolocation),
	toggleServiceMap: createAction(actionTypes.toggleServiceMap),
	changeDeviceType: createAction(actionTypes.changeDeviceType),
	changeOrganization: createAction(actionTypes.changeOrganization),
	changeCountry: createAction(actionTypes.changeCountry),
	changeDefaultLocation: createAction(actionTypes.changeDefaultLocation),
	changeLanguage: createAction(actionTypes.changeLanguage),
	selectCategory: createAction(actionTypes.selectCategory),
	selectArticle: createAction(actionTypes.selectArticle),
	recordMatch: createAction(actionTypes.recordMatch),
	recordCoordinates: createAction(actionTypes.recordCoordinates),
	selectCountryList: createAction(actionTypes.selectCountryList),
	toggleServiceGeolocation: createAction(actionTypes.toggleServiceGeolocation),
	storeRegions: createAction(actionTypes.storeRegions),
};
