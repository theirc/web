/**
 * @function
 * @description Helper to share on fb
 */
const fbHelpers = {
	share: (language) => {
		if (global.window) {
			const { FB } = global.window;
			let { href } = window.location;

			href += (href.includes("?") ? "&" : "?") + "language=" + language;
	
			if (FB) {
				FB.ui({	method: "share", href }, (response) => {});
			}
		}
	}
}

export default fbHelpers;
