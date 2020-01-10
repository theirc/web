import instances from '../config';

const loadInstanceSettings = () => {
	let { instance, env } = require('../config/localhost').default;

	
	// load settings depending on the environment/instance
	if(window.location.hostname !== 'localhost') {
		let subdomain = window.location.hostname.split('.');
		env = subdomain.shift(); // e.g.: qa
		instance = subdomain.join('.'); // e.g.: cuentanos.org
	}
	
	let config = instances[instance];
	config.env = config.envs[env];
	console.log(config);

	return config;
};

let instance = loadInstanceSettings();
export default instance;
