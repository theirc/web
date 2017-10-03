import config from "./config";
import _ from "lodash";
const contentful = require("contentful");
let client = null;
let siteConfig = null;

for (let key of Object.keys(config)) {
	if (global.window && global.window.location) {
		if (window.location.hostname.indexOf(key) > -1) {
			siteConfig = config[key];
			client = contentful.createClient({
				...siteConfig,
			});
		}
	}
}

function loadCountry(slug) {
	const entriesAsDictionary = e => {
		return _.fromPairs(e.map(o => [o.sys.id, o.fields]));
	};
	return client
		.getEntries({ content_type: "country", "fields.slug": slug, include: 10 })
		.then(e => {
			let { includes, items } = e;

			if (items.length == 0) {
				throw Error("No Country Found");
            }

            return items[0].fields;
		});
}

export default {
	client,
	loadCountry,
	siteConfig,
};
