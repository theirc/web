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

export default function getSessionStorage() {
	if (!lsTest()) {
		if (global.Proxy) {
			var handler = {
				get: function (target, name) {
					return target[name];
				},
				set: function (target, name, value) {
					target[name] = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value);
					return target[name];
				},
			};

			var p = new Proxy({}, handler);

			if (global.window) {
				global.window.mockSessionStorage = p;
			}

			return p;
		}
		return {};
	} else return global.sessionStorage;
}
