// libs
import React from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { push } from "react-router-redux";
// import measureDistance from "@turf/distance";
import { Redirect } from 'react-router';
import Promise from "bluebird";

// local
import { ServiceMap, ServiceCategoryList, ServiceLocationList, ServiceList,
	ServiceDetail, ServiceDepartmentList, ServiceCategoryListDesktop } from "../../components";
import { Skeleton } from "..";
import actions from "../../shared/redux/actions";
import getSessionStorage from "../../shared/sessionStorage";
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
import languages from './languages';
import routes from './routes';
import servicesApi from "../../backend/servicesApi";

const NS = { ns: 'Services' };

/**
 * @class
 * @description Messiest class in the whole project
 */
class Services extends React.Component {
	state = {
		countryRegions: null,
		sortingByLocationEnabled: false,
		fetchingLocation: false,
		errorWithGeolocation: false,
		geolocation: null,
		categoryName: null,
		category: null,
		location: null,
		locationName: null,
		regionName: null,
		region: null,
		regionId: null,
		keepPreviousZoom: true,
		isMobile: window.innerWidth <= 1000,
		cities: null,
		cityName: null,
		city: null,
		cityId: null
	};

	constructor() {
		super();
		i18nHelpers.loadResource(languages, NS.ns);
	}

	componentWillMount() {
		let { regions, country, changeDefaultLocation } = this.props;
		const countryData = {id: regions[0].countryID, name: country.fields.name, slug: country.fields.slug}
		let countryRegions = [...regions];
		
		if (countryRegions[0].slug !== country.fields.slug) countryRegions.unshift(countryData);

		this.setState({ countryRegions});

		const { coordinates } = country.fields;
		if (coordinates) {
			changeDefaultLocation({
				latitude: coordinates.lat,
				longitude: coordinates.lon,
			});
		}
	}
	
	componentDidMount() {
		window.addEventListener('resize', () => {
			!this.state.isMobile && window.innerWidth <= 1000 && this.setState({ isMobile: true });
			this.state.isMobile && window.innerWidth >= 1000 && this.setState({ isMobile: false });
		});
	}

	sessionStorage = getSessionStorage();
	measureDistance(a, language, sort) {
		return b => {
			try {
				if (a && b) {
					// const currentGeoJSON = {
					// 	type: "Point",
					// 	coordinates: [a.longitude, a.latitude],
					// };
					let originalDistance = 0
					// let originalDistance = measureDistance(currentGeoJSON, b, "kilometers");
					let distance = originalDistance;
					let unit = "km";

					if (distance < 2) {
						unit = "m";
						distance = Math.round(distance * 1000);
					}

					if (!sort) {
						distance = distance.toFixed(1);
						if (Intl.NumberFormat) {
							let i18 = new Intl.NumberFormat(language);
							distance = i18.format(distance);
						}
						return `${distance} ${unit}`;
					} else {
						return originalDistance * 1000;
					}
				}
			} catch (e) { }
			return null;
		};
	}

	findUsersPosition() {
		return new Promise((res, rej) => {
			const rejectMe = () => rej({ message: "Unable to determine position" });

			if (!navigator.geolocation) {
				rejectMe();
			}

			navigator.geolocation.getCurrentPosition(
				p => {
					const { latitude, longitude } = p.coords;
					res({ latitude, longitude });
				},
				e => {
					rejectMe();
				}
			);
		});
	}

	fetchAllInLocation(country = '', region = '', city = '', categoryId = null) {
		const { language, showErrorMessage, regions } = this.props;
		const { sortingByLocationEnabled, errorWithGeolocation, fetchingLocation, geolocation, cities, regionId, cityId } = this.state;
		
		const countryId = regions[0].countryID;

		if (country && !region && !city) {
			return this.fetchServices(countryId, language, categoryId, null, null)
		}

		let regionData;
		let cityData;
		let citiesList;

		if (region && !regionId) {
			regionData = regions.filter(x => x.slug === region)[0];
			this.setState({regionId: regionData.id})
		}

		if (city && cities && cities.length && !cityId) {
			cityData = cities.filter(x => x.slug === city)[0];
		} else if (city && !cities && !cityId) {
			servicesApi().fetchCities(regionId ? regionId : regionData.id, language)
					.then(city => citiesList = city)
					.then(() => {
						cityData = citiesList.filter(x => x.slug === city)[0];
						this.setState({ cities: citiesList, cityId: cityData.id, cityName: cityData.name, city: cityData })
					})
					.then(() => {
						return this.fetchServices(countryId, language, categoryId, regionId ? regionId : regionData.id, cityId ? cityId: cityData.id)
					})
		}

		return servicesApi()
			.fetchAllServices(countryId, language, categoryId, regionId ? regionId : regionData.id, cityId)
			.then(services => ({ services, category: null }));
		// if (!errorWithGeolocation) {
		// 	if (sortingByLocationEnabled && fetchingLocation) {
		// 		return new Promise(() => { });
		// 	}

		// 	if (sortingByLocationEnabled && !fetchingLocation && !geolocation) {
		// 		this.setState({ fetchingLocation: true });
		// 		this.findUsersPosition()
		// 			.then(pos => {
		// 				this.setState({ fetchingLocation: false, geolocation: pos });
		// 			})
		// 			.catch(e => {
		// 				showErrorMessage("Error loading geolocation");
		// 				this.setState({ errorWithGeolocation: true, fetchingLocation: false });
		// 			});

		// 		return new Promise(() => { });
		// 	}
		// }

	}

	fetchServices(countryId, language, categoryId, regionId, cityId) {
		return servicesApi()
			.fetchAllServices(countryId, language, categoryId, regionId, cityId)
			.then(services => ({ services, category: null }));
	}

	serviceTypes(countryWide = false) {
		const { language, regions } = this.props;
		const { regionId, cityId } = this.state;
		const countryId = regions[0].countryID;

		if (!countryWide && regionId && !cityId) {
			return servicesApi().fetchCategoriesByRegion(language, regionId);
		} else if (!countryWide && cityId) {
			return servicesApi().fetchCategoriesByCity(language, cityId)
		}

		return servicesApi().fetchCategoriesByCountry(language, countryId);
	}

	getLocation() {
		const { country } = this.props;
		return this.state.location ? this.state.location : country.fields.slug;
	}

	goTo(region, city, location, category, mapview = false) {
		const {
			country,
			goToRegionByCategory,
			goToCityByCategory,
			goToRegionCategoryMap,
			goToCityCategoryMap,
			goToCategoryMap,
			goToRegionMap,
			goToCityMap,
			goToMap,
			listAllServices,
			listAllServicesinRegion,
			listAllServicesinCity,
			listServicesInCategory,
		} = this.props;

		if ((!region || region.slug === country.fields.slug) && !category) {
			mapview ? goToMap(country) : listAllServices(country);
		} else if (region && region.slug && !city.slug && !category) {
			mapview ? goToRegionMap(country, region.slug) : listAllServicesinRegion(country, region.slug);
		} else if (region && region.slug && city && city.slug && !category) {
			mapview ? goToCityMap(country, region.slug, city.slug) : listAllServicesinCity(country, region.slug, city.slug);
		} else if (!region.slug && category) {
			mapview ? goToCategoryMap(country, category.id) : listServicesInCategory(country, category);
		} else if (region && region.slug && (!city || !city.slug) && category) {
			mapview ? goToRegionCategoryMap(country, category.id, region.slug) : goToRegionByCategory(country, category.id, region.slug);
		} else if (region && region.slug && city && city.slug && category) {
			mapview ? goToCityCategoryMap(country, category.id, region.slug, city.slug) : goToCityByCategory(country, category.id, region.slug, city.slug);
		}
	}

	render() {
		const {
			country,
			goToLocation,
			goToRegion,
			goToCity,
			goToLocationList,
			goToDepartmentList,
			goToLocationMap,
			goToRegionMap,
			goToCityMap,
			goToCategoryMap,
			goToLocationCategoryMap,
			goToRegionCategoryMap,
			goToCityCategoryMap,
			goToLocationByCategory,
			goToRegionByCategory,
			goToCityByCategory,
			goToMap,
			language,
			listAllServices,
			listAllServicesinLocation,
			listAllServicesinRegion,
			listAllServicesinCity,
			listServicesInCategory,
			servicesInCategoryMap,
			servicesInLocationMap,
			servicesInRegionMap,
			servicesInCityMap,
			match,
			goToCountry
		} = this.props;

		const { isMobile, cities, countryRegions, geolocation, locationName, region, city } = this.state;

		const onSelectCategory = (c) => {
			this.setState({ categoryName: c.name, category: c.id });
			listServicesInCategory(country, c);
			if (region && region !== country.fields.slug && !city) {
				goToRegionByCategory(country, c.id, region)
			} else if (region && region !== country.fields.slug && city) {
				goToCityByCategory(country, c.id, region, city)
			}
		};

		const onOpenLocation = (location, name) => {
			const { region } = this.state
			this.sessionStorage.location = JSON.stringify(location);
			this.setState({ location: location.slug, cityId: location.id, city: location, cityName: name, locationName: name });
			goToCity(country, region, location.slug)
		}

		const onOpenDepartment = (id, department, name, location) => {
			const { language } = this.props
			let cities;
			if (department !== country.fields.slug) {
				servicesApi().fetchCities(id, language)
					.then(city => cities = city)
					.then(() => { 
						this.setState({ regionId: id, locationName: name, regionName: name, region: department, location: department, cities, cityId: null, cityName: null, city: null })
						goToRegion(country, department);
					});
			} else {
				goToCountry(country);
			}
		}

		const goToLocations = (iscountrylist) => {
			const { country } = this.props;
			
			if (!this.state.region || iscountrylist) {
				goToDepartmentList(country);
			} else {
				goToLocationList(country);
			}
		}

		const onGoToMap = (isCountryWide = null) => {
			const { region, city } = this.state
			this.setState({ keepPreviousZoom: false });
			if (!isCountryWide && region && region !== country.fields.slug && !city) {
				goToRegionMap(country, region)
			} else if (!isCountryWide && region && region !== country.fields.slug && city) {
				goToCityMap(country, region, city)
			} else {
				goToMap(this.props.country);
			}
		}

		const onGoToLocationMap = (region, city = '') => {
			const { country } = this.props;
			this.setState({ keepPreviousZoom: false });
			if (region && !city) {
				goToRegionMap(country, region);
			} else if (region && city) {
				goToCityMap(country, region, city)
			}
		}

		return (
			<div className='Services'>
				<Switch>
					<Route
						exact
						path={`${match.url}/map/`}
						component={props => (
							<Skeleton headerColor='light'>
								<div className="SkeletonContainer">
									{isMobile &&
										<ServiceMap
											{...props}
											findServicesInLocation={() => this.fetchAllInLocation(country.fields.slug)}
											keepPreviousZoom={this.state.keepPreviousZoom}
										/>
									}
									{!isMobile &&
										<ServiceCategoryListDesktop
											{...props}
											fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
											fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
											fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
											fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
											fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
											goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
											mapView={true}
											measureDistance={this.measureDistance(geolocation, language)}
											cities={this.state.cities}
										/>
									}
								</div>
							</Skeleton>
						)}
					/>
					<Route
						path={`${match.url}/all/`}
						exact
						component={props => (
							<Skeleton headerColor='light'>
								<div className="SkeletonContainer">
									{isMobile &&
										<ServiceList
											{...props}
											language={language}
											measureDistance={this.measureDistance(geolocation, language)}
											servicesByType={() => this.fetchAllInLocation(country.fields.slug)}
											showMap={() => goToMap(country)}
										/>}
									{!isMobile &&
										<ServiceCategoryListDesktop
											{...props}
											fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
											fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
											fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
											fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
											fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)} /* TODO: Fix number of services */
											goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
											measureDistance={this.measureDistance(geolocation, language)}
											cities={this.state.cities}
										/>
									}
								</div>
							</Skeleton>
						)}
					/>
					<Route
						path={`${match.url}/locations/`}
						exact
						component={props => (
							<Skeleton headerColor='light'>
								<div className="SkeletonContainer">
									<ServiceLocationList
										{...props}
										language={language}
										allRegions={cities}
										department={this.state.region}
										departmentId={this.state.regionId}
										departmentName={this.state.regionName}
										openLocation={(location, name) => {
											onOpenLocation(location, name);
										}}
									/>
								</div>
							</Skeleton>
						)}
					/>
					<Route
						path={`${match.url}/departments/`}
						exact
						component={props => (
							<Skeleton headerColor='light'>
								<div className="SkeletonContainer">
									<ServiceDepartmentList
										{...props}
										language={language}
										allRegions={countryRegions}
										onOpenDepartment={(id, department, name) => {
											onOpenDepartment(id, department, name);
										}}
									/>
								</div>
							</Skeleton>
						)}
					/>
					<Route
						path={`${match.url}/preview/:serviceId/`}
						exact
						component={props => (
							<Skeleton headerColor='light'>
								<div className="SkeletonContainer">
									<ServiceDetail
										{...props}
										instance = {instance}
										fetchService={() => servicesApi().fetchServicePreviewById(language, props.match.params.serviceId)}
									/>
								</div>
							</Skeleton>
						)}
					/>
					<Route
						path={`${match.url}/:serviceId/`}
						exact
						component={props => (
							<Skeleton headerColor='light'>
								<div className="SkeletonContainer">
									<ServiceDetail
										{...props}
										instance = {instance}
										fetchService={() => servicesApi().fetchServiceById(language, props.match.params.serviceId)}
									/>
								</div>
							</Skeleton>
						)}
					/>
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/map`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={() => this.fetchAllInLocation(country.fields.slug, null, null, props.match.params.categoryId)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(country, this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceList
										{...props}
										measureDistance={this.measureDistance(geolocation, language)}
										servicesByType={() => this.fetchAllInLocation(country.fields.slug, null, null, props.match.params.categoryId)}
										showMap={() => goToCategoryMap(country, props.match.params.categoryId)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-region/:region/`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceCategoryList
										fetchCategories={() => this.serviceTypes()}
										onSelectCategory={onSelectCategory}
										listAllServices={() => listAllServicesinRegion(country, props.match.params.region)}
										goToMap={() => onGoToLocationMap(props.match.params.region)}
										goToLocationList={() => { goToLocations(false) }}
										locationName={locationName}
										departmentSelected={this.state.region}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/:region/by-city/:city/`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceCategoryList
										fetchCategories={() => this.serviceTypes()}
										onSelectCategory={onSelectCategory}
										listAllServices={() => listAllServicesinCity(country, props.match.params.region, props.match.params.city)}
										goToMap={() => onGoToLocationMap(props.match.params.region, props.match.params.city)}
										goToLocationList={() => { goToLocations(false) }}
										locationName={locationName}
										departmentSelected={this.state.region}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				{/* <Route
					exact
					path={`${match.url}/by-category/:categoryId/location/:location`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(country, this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceList
										{...props}
										measureDistance={this.measureDistance(geolocation, language)}
										servicesByType={() => this.fetchAllInLocation(props.match.params.location, props.match.params.categoryId)}
										showMap={() => goToLocationCategoryMap(country, props.match.params.location, props.match.params.categoryId)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/> */}
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/region/:region`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(country, this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceList
										{...props}
										measureDistance={this.measureDistance(geolocation, language)}
										servicesByType={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region, null, props.match.params.categoryId)}
										showMap={() => goToRegionCategoryMap(country, props.match.params.categoryId, props.match.params.region)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/region/:region/city/:city`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(country, this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceList
										{...props}
										measureDistance={this.measureDistance(geolocation, language)}
										servicesByType={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region, props.match.params.city, props.match.params.categoryId)}
										showMap={() => goToCityCategoryMap(country, props.match.params.categoryId, props.match.params.region, props.match.params.city)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				{/* <Route
					exact
					path={`${match.url}/by-category/:categoryId/location/:location/map`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(country, this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={() => this.fetchAllInLocation(props.match.params.location, props.match.params.categoryId)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										category={props.match.params.categoryId}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/> */}
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/region/:region/map`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(country, this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region, null, props.match.params.categoryId)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										category={props.match.params.categoryId}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/region/:region/city/:city/map`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(country, this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region, props.match.params.city, props.match.params.categoryId)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										category={props.match.params.categoryId}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				{/* <Route
					exact
					path={`${match.url}/by-location/:location/all`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInLocationMap(country, this.state.location)}>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceList
										{...props}
										measureDistance={this.measureDistance(geolocation, language)}
										servicesByType={() => this.fetchAllInLocation(props.match.params.location)}
										showMap={() => goToLocationMap(country, props.match.params.location)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/> */}
				<Route
					exact
					path={`${match.url}/by-region/:region/all/`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInRegionMap(country, region)}>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceList
										{...props}
										measureDistance={this.measureDistance(geolocation, language)}
										servicesByType={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region)}
										showMap={() => goToRegionMap(country, props.match.params.region)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/:region/by-city/:city/all`}
					component={props => (
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCityMap(country, region, city)}>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceList
										{...props}
										measureDistance={this.measureDistance(geolocation, language)}
										servicesByType={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region, props.match.params.city)}
										showMap={() => goToCityMap(country, props.match.params.region, props.match.params.city)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				{/* <Route
					exact
					path={`${match.url}/by-location/:location/map/`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={() => this.fetchAllInLocation(props.match.params.location)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/> */}
				<Route
					exact
					path={`${match.url}/by-region/:region/map/`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/:region/by-city/:city/map/`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={() => this.fetchAllInLocation(country.fields.slug, props.match.params.region, props.match.params.city)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi().fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi().fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi().fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi().fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi().fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(region, city, location, category, mapview, cities) => {this.goTo(region, city, location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
										cities={this.state.cities}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceCategoryList
										fetchCategories={() => this.serviceTypes(true)}
										onSelectCategory={onSelectCategory}
										listAllServices={() => listAllServices(country)}
										goToMap={() => onGoToMap(true)}
										goToLocationList={() => { goToLocations(true) }}
									/>
								}
								{!isMobile &&
									<Redirect to={routes.listAllServices(country)} />
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route component={() => <Redirect to={'/404'}/>} />
			</Switch>
			</div>
		);
	}
}

const mapState = ({ country, language, regions }, p) => ({ country, language, regions });

const mapDispatch = (d, p) => ({
	changeCountry: (country) => d(actions.changeCountry(country)),
	changeLanguage: (language) => d(actions.changeLanguage(language)),
	changeDefaultLocation: (location) => d(actions.changeDefaultLocation(location)),
	goToCategoryMap: (country, category) => d(push(routes.goToCategoryMap(country, category))),
	goToLocation: (country, location) => d(push(routes.goToLocation(country, location))),
	goToRegion: (country, region) => d(push(routes.goToRegion(country, region))),
	goToCity: (country, region, city) => d(push(routes.goToCity(country, region, city))),
	goToLocationByCategory: (country, category, location) => d(push(routes.goToLocationByCategory(country, category, location))),
	goToRegionByCategory: (country, category, region) => d(push(routes.goToRegionByCategory(country, category, region))),
	goToCityByCategory: (country, category, region, city) => d(push(routes.goToCityByCategory(country, category, region, city))),
	goToLocationList: (country) => d(push(routes.goToLocationList(country))),
	goToDepartmentList: (country) => d(push(routes.goToDepartmentList(country))),
	goToLocationMap: (country, location) => d(push(routes.goToLocationMap(country, location))),
	goToRegionMap: (country, region) => d(push(routes.goToRegionMap(country, region))),
	goToCityMap: (country, region, city) => d(push(routes.goToCityMap(country, region, city))),
	goToLocationCategoryMap: (country, location, category) => d(push(routes.goToLocationCategoryMap(country, location, category))),
	goToRegionCategoryMap: (country, category, region) => d(push(routes.goToRegionCategoryMap(country, category, region))),
	goToCityCategoryMap: (country, category, region, city) => d(push(routes.goToCityCategoryMap(country, category, region, city))),
	goToMap: (country) => d(push(routes.goToMap(country))),
	listAllServices: (country) => d(push(routes.listAllServices(country))),
	listAllServicesinLocation: (country, location) => d(push(routes.listAllServicesinLocation(country, location))),
	listAllServicesinRegion: (country, region) => d(push(routes.listAllServicesinRegion(country, region))),
	listAllServicesinCity: (country, region, city) => d(push(routes.listAllServicesinCity(country, region, city))),
	listServicesInCategory: (country, category) => d(push(routes.listServicesInCategory(country, category))),
	servicesInCategoryMap: (country, category, location) => d(push(routes.servicesInCategoryMap(country, category, location))),
	servicesInLocationMap: (country, location) => d(push(routes.servicesInLocationMap(country, location))),
	goToCountry: (country) => d(push(routes.goToCountry(country))),
	showErrorMessage: (error) => d(actions.showErrorMessage(error)),
});

export default connect(mapState, mapDispatch)(Services);
