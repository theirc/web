// libs
import React from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { push } from "react-router-redux";
import measureDistance from "@turf/distance";
import { Redirect } from 'react-router';
import Promise from "bluebird";
import _ from "lodash";

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
		let countryRegions = regions.filter(r => r.country && r.country.slug === country.fields.slug && r.isActive);
		countryRegions.unshift(countryRegions[0].country)

		this.setState({ countryRegions });

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
					const currentGeoJSON = {
						type: "Point",
						coordinates: [a.longitude, a.latitude],
					};
					let originalDistance = measureDistance(currentGeoJSON, b, "kilometers");
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

	fetchAllInLocation(location, categoryId = null) {
		const { language, showErrorMessage, regions } = this.props;
		const { sortingByLocationEnabled, errorWithGeolocation, fetchingLocation, geolocation, regionId, cityId } = this.state;
		const country = this.props.regions.find(r => r.country.slug === location);
		const countryId = country ? country.country.id : '';

		if (!errorWithGeolocation) {
			if (sortingByLocationEnabled && fetchingLocation) {
				return new Promise(() => { });
			}

			if (sortingByLocationEnabled && !fetchingLocation && !geolocation) {
				this.setState({ fetchingLocation: true });
				this.findUsersPosition()
					.then(pos => {
						this.setState({ fetchingLocation: false, geolocation: pos });
					})
					.catch(e => {
						showErrorMessage("Error loading geolocation");
						this.setState({ errorWithGeolocation: true, fetchingLocation: false });
					});

				return new Promise(() => { });
			}
		}

		const orderByDistance = c => (sortingByLocationEnabled && geolocation ? _.sortBy(c, s => this.measureDistance(geolocation, language, true)(s.location)) : _.identity(c));
		return servicesApi
			.fetchAllServices(countryId, language, categoryId, regionId, cityId)
			.then(services => ({ services: services.filter(service => service.status === "current"), category: null }));
	}

	serviceTypes() {
		const { language, country, regions } = this.props;
		const { regionId, cityId } = this.state;
		const countryId = (regions.find(r => r.country.slug === country.fields.slug)).country.id;

		if (regionId && !cityId) {
			return servicesApi.fetchCategoriesByRegion(language, regionId);
		} else if (cityId) {
			return servicesApi.fetchCategoriesByCity(language, cityId)
		}

		return servicesApi.fetchCategoriesByCountry(language, countryId);
	}

	getLocation() {
		const { country } = this.props;
		return this.state.location ? this.state.location : country.fields.slug;
	}

	goTo(location, category, mapview = false) {
		const {
			country,
			goToLocationByCategory,
			goToLocationCategoryMap,
			goToCategoryMap,
			goToLocationMap,
			goToMap,
			listAllServices,
			listAllServicesinLocation,
			listServicesInCategory,
		} = this.props;

		if ((!location || location.slug === country.fields.slug) && !category) {
			mapview ? goToMap(country) : listAllServices(country);
		} else if (location  && !category) {
			mapview ? goToLocationMap(country, location.slug) : listAllServicesinLocation(country, location.slug);
		} else if ((!location || location.level === 1) && category) {
			mapview ? goToCategoryMap(country, category.id) : listServicesInCategory(country, category);
		} else if (location && category) {
			mapview ? goToLocationCategoryMap(country, location.slug, category.id) : goToLocationByCategory(country, category.id, location.slug);
		}
	}

	render() {
		const {
			country,
			goToLocation,
			goToLocationList,
			goToDepartmentList,
			goToLocationMap,
			goToCategoryMap,
			goToLocationCategoryMap,
			goToLocationByCategory,
			goToMap,
			language,
			listAllServices,
			listAllServicesinLocation,
			listServicesInCategory,
			servicesInCategoryMap,
			servicesInLocationMap,
			match,
		} = this.props;

		const { isMobile, cities, countryRegions, geolocation, locationName } = this.state;

		const onSelectCategory = (c) => {
			this.setState({ categoryName: c.name, category: c.id });
			listServicesInCategory(this.props.country, c);
			if (this.state.location) {
				goToLocationByCategory(this.props.country, c.id, this.state.location);
			}
		};

		const onOpenLocation = (location, name) => {
			this.sessionStorage.location = JSON.stringify(location);
			this.setState({ location: location.slug, region: null, cityId: location.id, city: location, cityName: name, locationName: name });
		}

		const onOpenDepartment = (id, department, name, location) => {
			let cities;
			servicesApi.fetchCities(id)
				.then(city => cities = city)
				.then(() => { this.setState({ regionId: id, locationName: name, regionName: name, region: department, location: department, cities, cityId: null, cityName: null, city: null })});
		}

		const goToLocations = (iscountrylist) => {
			const { country } = this.props;
			// const showDepartments = _.has(country, 'fields.slug') && instance.countries[country.fields.slug].switches.showDepartments;
			
			if (!this.state.region || iscountrylist) {
				goToDepartmentList(this.props.country);
			} else {
				goToLocationList(this.props.country);
			}
		}

		const onGoToMap = (isCountryWide = null) => {
			this.setState({ keepPreviousZoom: false });
			if (!isCountryWide && this.state.location) {
				goToLocationMap(this.props.country, this.state.location);
			} else {
				goToMap(this.props.country);
			}
		}

		const onGoToLocationMap = (location) => {
			this.setState({ keepPreviousZoom: false });
			goToLocationMap(this.props.country, location);
		}

		const getLocationName = (slug) => {
			const { regions } = this.props;
			if (!this.state.locationName) {
				var loc = regions.filter(x => x.slug === slug);
				return loc.length > 0 ? loc[0].name : "";
			}
			return this.state.locationName;
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
											fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
											fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
											fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
											fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
											fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
											goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
											mapView={true}
											measureDistance={this.measureDistance(geolocation, language)}
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
											measureDistance={this.measureDistance(geolocation, language)}
											servicesByType={() => this.fetchAllInLocation(country.fields.slug)}
											showMap={() => goToMap(country)}
										/>}
									{!isMobile &&
										<ServiceCategoryListDesktop
											{...props}
											fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
											fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
											fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
											fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
											fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)} /* TODO: Fix number of services */
											goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
											measureDistance={this.measureDistance(geolocation, language)}
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
										allRegions={cities}
										department={this.state.region}
										departmentId={this.state.regionId}
										departmentName={this.state.regionName}
										openLocation={(location, name) => {
											onOpenLocation(location, name);
											goToLocation(country, location.slug);
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
										allRegions={countryRegions}
										onOpenDepartment={(id, department, name) => {
											onOpenDepartment(id, department, name);
											goToLocation(country, department);
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
										fetchService={() => servicesApi.fetchServicePreviewById(language, props.match.params.serviceId)}
										// fetchServicesInSameLocation={() => servicesApi.fetchServicesInSameLocation(language, props.match.params.serviceId)}
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
										fetchService={() => servicesApi.fetchServiceById(language, props.match.params.serviceId)}
										// fetchServicesInSameLocation={() => servicesApi.fetchServicesInSameLocation(language, props.match.params.serviceId)}
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
										findServicesInLocation={() => this.fetchAllInLocation(this.getLocation(), props.match.params.categoryId)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
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
										servicesByType={() => this.fetchAllInLocation(this.getLocation(), props.match.params.categoryId)}
										showMap={() => goToCategoryMap(country, props.match.params.categoryId)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
										measureDistance={this.measureDistance(geolocation, language)}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-location/:location/`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceCategoryList
										fetchCategories={() => this.serviceTypes()}
										onSelectCategory={onSelectCategory}
										listAllServices={() => listAllServicesinLocation(country, props.match.params.location)}
										goToMap={() => onGoToLocationMap(props.match.params.location)}
										goToLocationList={() => { goToLocations(false) }}
										locationName={locationName}
										departmentSelected={this.state.region}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
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
										fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										measureDistance={this.measureDistance(geolocation, language)}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
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
										fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
										category={props.match.params.categoryId}
										fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
									/>
								}
							</div>
						</Skeleton>
					)}
				/>
				<Route
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
										fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
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
										fetchCitiesByRegion={(regionId) => servicesApi.fetchCities(regionId, language)}
										fetchCategories={(countryId) => servicesApi.fetchCategoriesByCountry(language, countryId)}
										fetchCategoriesByRegion={(regionId) => servicesApi.fetchCategoriesByRegion(language, regionId)}
										fetchCategoriesByCity={(cityId) => servicesApi.fetchCategoriesByCity(language, cityId)}
										fetchServices={(countryId, category, regionId, cityId) => servicesApi.fetchAllServices(countryId, language, category, regionId, cityId)}
										goTo={(location, category, mapview, cities) => {this.goTo(location, category, mapview); this.setState({cities})}}
										location={props.match.params.location}
										mapView={true}
										measureDistance={this.measureDistance(geolocation, language)}
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
										fetchCategories={() => this.serviceTypes()}
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
	goToLocationByCategory: (country, category, location) => d(push(routes.goToLocationByCategory(country, category, location))),
	goToLocationList: (country) => d(push(routes.goToLocationList(country))),
	goToDepartmentList: (country) => d(push(routes.goToDepartmentList(country))),
	goToLocationMap: (country, location) => d(push(routes.goToLocationMap(country, location))),
	goToLocationCategoryMap: (country, location, category) => d(push(routes.goToLocationCategoryMap(country, location, category))),
	goToMap: (country) => d(push(routes.goToMap(country))),
	listAllServices: (country) => d(push(routes.listAllServices(country))),
	listAllServicesinLocation: (country, location) => d(push(routes.listAllServicesinLocation(country, location))),
	listServicesInCategory: (country, category) => d(push(routes.listServicesInCategory(country, category))),
	servicesInCategoryMap: (country, category, location) => d(push(routes.servicesInCategoryMap(country, category, location))),
	servicesInLocationMap: (country, location) => d(push(routes.servicesInLocationMap(country, location))),
	showErrorMessage: (error) => d(actions.showErrorMessage(error)),
});

export default connect(mapState, mapDispatch)(Services);
