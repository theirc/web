import instances from '../config';

/**
 * @function
 * @description Creates an object with instance/country/environment related settings.
 * @returns instance object
 */
const loadInstanceSettings = (serverHost = null) => {
	let { instance: domain, env } = require('../config/localhost').default;

	// load settings depending on the environment/domain
	if ((serverHost && !serverHost.includes('localhost')) || (global.window && (global.window.location.hostname !== 'localhost'))) {
		let subdomain = serverHost ? serverHost.split('.') : global.window.location.hostname.split('.');
		env = subdomain.shift(); // e.g.: qa
		domain = subdomain.join('.'); // e.g.: cuentanos.org
		console.log('Settings: ', domain, env);
	} else {
		console.log('Settings: [localhost.js] ', domain, env);
	}

	return { ...instances[domain], env: instances[domain].envs[env] };
};

let instance = loadInstanceSettings();
instance.loader = loadInstanceSettings;

export default instance; // TODO: change this to be named export
