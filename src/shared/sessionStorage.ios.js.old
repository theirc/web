import _ from "lodash";
import Promise from "bluebird";
import { AsyncStorage } from "react-native";

function lsTest() {
	var test = "test";
	try {
		global.localStorage.setItem(test, test);
		global.localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

let mock = {};
AsyncStorage.getAllKeys().then(keys => Promise.all(keys.map(k => AsyncStorage.getItem(k).then(i => (mock[k] = i)))));

export default function getSessionStorage() {
	if (!lsTest()) {
		//global.window.sessionStorage = null;
		if (global.Proxy) {
			var handler = {
				get: function(target, name) {
					return target[name];
				},
				set: function(target, name, value) {
					target[name] = _.isObjectLike(value) ? JSON.stringify(value) : _.toString(value);

					AsyncStorage.setItem(name, target[name]);
				},
			};

			var p = new Proxy(mock, handler);
			if (global.window) {
				global.window.mockSessionStorage = p;
			}

			return p;
		}
		return mock;
	} else return global.sessionStorage;
}
