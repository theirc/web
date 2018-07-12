import _ from "lodash";

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

export default function getLocalStorage() {
	if (!lsTest()) {
		if (global.Proxy) {
			var handler = {
				get: function(target, name) {
					return target[name];
				},
				set: function(target, name, value) {
					target[name] = _.isObjectLike(value) ? JSON.stringify(value) : _.toString(value);
					return target[name];
				},
			};

			var p = new Proxy({}, handler);
			if (global.window) {
				global.window.mocklocalStorage = p;
			}
			return p;
		}
		return {};
	} else return global.localStorage;
}
