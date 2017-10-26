import feathers from "feathers/client";
import hooks from "feathers-hooks";
import auth from "feathers-authentication-client";
import reduxifyServices from "feathers-reduxify-services";

const superagent = require("superagent");
const rest = require("feathers-rest/client");
const { window } = global;
const { siteConfig } = (window||{});

const url = (siteConfig && siteConfig.serverUrl) || "http://backend.refugee.info/api";
const restClient = rest(url);

const client = feathers();
if (window) {
	client.configure(restClient.fetch(window.fetch.bind(window)));
} else {
	client.configure(restClient.superagent(superagent));
}
client.configure(hooks()).configure(auth());

const services = reduxifyServices(client, ["articles", "countries", "locations", "categories"]);

export default services;
