export default {
	goToService: (country, language, id) => (`/${country.fields.slug}/services/${id}?language=${language}`),
	// goToCategoryMap: (country, category) => {
	// 	return d(push(`/${country.fields.slug}/services/by-category/${category}/map/`));
	// },
	// goToLocation: (location) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-location/${location}/`));
	// },
	// goToLocationByCategory: (category, location) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-category/${category}/location/${location}`));
	// },
	// goToLocationList: () => {
	// 	return d(push(`/${p.country.fields.slug}/services/locations/`));
	// },
	// goToDepartmentList: () => {
	// 	return d(push(`/${p.country.fields.slug}/services/departments/`));
	// },
	// goToLocationMap: (location) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-location/${location}/map/`));
	// },
	// goToLocationCategoryMap: (location, category) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-category/${category}/location/${location}/map/`));
	// },
	// goToMap: () => {
	// 	return d(push(`/${p.country.fields.slug}/services/map/`));
	// },
	// listAllServices: () => {
	// 	return d(push(`/${p.country.fields.slug}/services/all/`));
	// },
	// listAllServicesinLocation: (location) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-location/${location}/all/`));
	// },
	// listServicesInCategory: (category) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-category/${category.id}/`));
	// },
	// servicesInCategoryMap: (category, location) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-location/${location}/by-category/${category}/map`));
	// },
	// servicesInLocationMap: (location) => {
	// 	return d(push(`/${p.country.fields.slug}/services/by-location/${location}/map`));
	// }
};
