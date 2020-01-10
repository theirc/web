import instances from '../config';

const loadInstanceSettings = () => {
	let { instance: domain, env } = require('../config/localhost').default;

	// load settings depending on the environment/domain
	if(window.location.hostname !== 'localhost') {
		let subdomain = window.location.hostname.split('.');
		env = subdomain.shift(); // e.g.: qa
		domain = subdomain.join('.'); // e.g.: cuentanos.org
	}
	
	let instance = instances[domain];
	instance.env = instance.envs[env];
	console.log(instance);

	return instance;
};

let instance = loadInstanceSettings();
export default instance;
