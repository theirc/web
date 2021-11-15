import cn from './cuentanos.org/instance';
import ki from './khabrona.info/instance';
import ri from './refugee.info/instance';
import iq from './simaetbhatha.com/instance';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const loadinginstance = urlParams.get('loadinginstance')
let azurewebsites = null;
switch(loadinginstance){
	case 'khabrona':
		azurewebsites = ki;
		break;
	case 'refugee':
		azurewebsites = ri;
		break;
	case 'simaetbhatha':
		azurewebsites = iq;
		break;
	default:
		azurewebsites = cn;
		break;
}

const instances = {
	'cuentanos.org': cn,
	'khabrona.info': ki,
	'refugee.info': ri,
	'simaetbhatha.com': iq,
	'azurewebsites.net': azurewebsites,
};

export default instances;
