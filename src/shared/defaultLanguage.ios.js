import queryString from "query-string";
import getSessionStorage from "./sessionStorage";
import appConfig from "../../config.app.json";
import DeviceInfo from "react-native-device-info";

const conf = require("../backend/config");
const sessionStorage = getSessionStorage();
let defaultLanguage = "en";
const config = conf[appConfig.app.url];

if (DeviceInfo && DeviceInfo.getDeviceLocale()) {
	defaultLanguage = DeviceInfo.getDeviceLocale().split("-")[0];
} else if (sessionStorage.language) {
	defaultLanguage = sessionStorage.language;
} else if (global.navigator && global.navigator.languages) {
	defaultLanguage = global.navigator.languages[0] && global.navigator.languages[0].split("-")[0];
} else if (global.navigator && global.navigator.language) {
	defaultLanguage = global.navigator.language.split("-")[0];
}

if (config.languages.map(l => l[0]).indexOf(defaultLanguage) === -1) {
	defaultLanguage = "en";
}

export default defaultLanguage;
