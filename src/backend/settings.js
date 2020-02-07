import instances from '../config';

/**
 * @function
 * @description Creates an object with instance/country/environment related settings.
 * @returns instance object
 */
const loadInstanceSettings = (host = null) => {
	let { instance: domain, env } = require('../config/localhost').default;

	// load settings depending on the environment/domain
	if ((host && !host.includes('localhost')) || (global.window && (global.window.location.hostname !== 'localhost'))) {
		console.log('Settings - hostname: ', host || global.window.location.hostname);
		let subdomain = host ? host.split('.') : global.window.location.hostname.split('.');
		env = subdomain.shift(); // e.g.: qa
		domain = subdomain.join('.'); // e.g.: cuentanos.org
	} else {
		console.log('Settings - default instance: ', domain, env);
	}

	return { ...instances[domain], env: instances[domain].envs[env] };
};

let instance = loadInstanceSettings();
instance.loader = loadInstanceSettings;

export default instance; // TODO: change this to be named export
