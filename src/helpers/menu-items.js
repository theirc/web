// TODO: refactor this
let selectedMenuItem = () => {
	let pathParts = document.location.pathname.split('/');
	let selectedIndex = 0;
	
	if (pathParts.length > 2) {
		if (pathParts[2] === 'article') {
			selectedIndex = -1;
		} else if (pathParts[2] === 'search') {
			selectedIndex = 3;
		} else if (pathParts[2] === 'services') {
			selectedIndex = 2;
		} else {
			selectedIndex = 1;
		}
	}

	return selectedIndex;
};

export default selectedMenuItem;
