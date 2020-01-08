const loadInstanceSettings = () => {
	let { instance, env } = require(`../config/localhost`).default;

	// load settings depending on the environment/instance
	if(window.location.hostname !== 'localhost') {
		let subdomain = window.location.hostname.split('.');
		env = subdomain.shift(); // e.g.: qa
		instance = subdomain.join('.'); // e.g.: cuentanos.org
	}
	
	let config = {
		...require(`../config/${instance}/instance`).default, // load whole instance object
		env: require(`../config/${instance}/envs/${env}`).default // load specific env (qa, staging, www)
	};

	return config;
};

let instance = loadInstanceSettings();
export default instance;
