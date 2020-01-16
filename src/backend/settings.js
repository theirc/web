import instances from '../config';

/**
 * @function
 * @description Creates an object with instance/country/environment related settings.
 * @returns instance object
 */
const loadInstanceSettings = () => {
	let { instance: domain, env } = require('../config/localhost').default;

	// load settings depending on the environment/domain
	if (global.window && (global.window.location.hostname !== 'localhost')) {
		let subdomain = global.window.location.hostname.split('.');
		env = subdomain.shift(); // e.g.: qa
		domain = subdomain.join('.'); // e.g.: cuentanos.org
	}

	return { ...instances[domain], env: instances[domain].envs[env] };
};

let instance = loadInstanceSettings();
console.log(instance);
export default instance; // TODO: change this to be named export
