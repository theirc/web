// libs
import React from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { push } from "react-router-redux";
import measureDistance from "@turf/distance";
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import Promise from "bluebird";
import _ from "lodash";

// local
import { ServiceMap, ServiceCategoryList, ServiceLocationList, ServiceList, ServiceDetail, ServiceDepartmentList, ServiceCategoryListDesktop } from "../../components";
import { Skeleton } from "..";
import i18nHelpers from '../../helpers/i18n';
import languages from './languages';
import routes from './routes';
import actions from "../../shared/redux/actions";
import servicesApi from "../../backend/servicesApi";
import getSessionStorage from "../../shared/sessionStorage";

const NS = { ns: 'Services' };

class Services extends React.Component {
	state = {
		countryRegions: null,
		countryDepartments: null,
		sortingByLocationEnabled: false,
		fetchingLocation: false,
		errorWithGeolocation: false,
		geolocation: null,
		categoryName: null,
		category: null,
		location: null,
		departmentName: null,
		department: null,
		departmentId: null,
		keepPreviousZoom: true,
		isMobile: window.innerWidth <= 1000,
	};

	static contextTypes = {
		config: PropTypes.object,
	};

	componentWillMount() {
		let { regions, country, changeDefaultLocation } = this.props;
		let regionDictionary = _.fromPairs(regions.map(r => [r.id, r]));
		let regionsWithCountry = regions.map(r => {
			let parent = r.parent ? regionDictionary[r.parent] : null;
			let country = r.parent ? (parent.parent ? regionDictionary[parent.parent] : parent) : r;
			return { country, ...r };
		});
		let countryRegions = regionsWithCountry.filter(c => c.country.slug === country.fields.slug && [1, 3].indexOf(c.level) > - 1 && !c.hidden);
		let countryDepartments = regionsWithCountry.filter(c => c.country.slug === country.fields.slug && c.level === 2 && !c.hidden);

		this.setState({ countryRegions, countryDepartments });

		const { coordinates } = country.fields;
		if (coordinates) {
			changeDefaultLocation({
				latitude: coordinates.lat,
				longitude: coordinates.lon,
			});
		}
	}
	
	componentDidMount() {
		i18nHelpers.loadResource(languages, NS.ns);

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
		const { language, showErrorMessage } = this.props;
		const { sortingByLocationEnabled, errorWithGeolocation, fetchingLocation, geolocation } = this.state;
		const country = location;

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
			.fetchAllServices(country, language, categoryId)
			.then(s => orderByDistance(s.results))
			.then(services => ({ services, category: null }));
	}

	fetchAllServicesNearby() {
		const { country, language } = this.props;
		const { fetchingLocation, errorWithGeolocation, geolocation } = this.state;

		if (errorWithGeolocation) {
			return Promise.reject({
				message: "We cannot determine your location",
			});
		} else if (!fetchingLocation && !geolocation) {
			this.setState({ fetchingLocation: true });
			this.findUsersPosition()
				.then(pos => {
					this.setState({ fetchingLocation: false, geolocation: pos });
				})
				.catch(e => {
					this.setState({ errorWithGeolocation: true });
				});

			return new Promise(() => { });
		}

		if (fetchingLocation) {
			return new Promise(() => { });
		} else if (!geolocation) {
			return Promise.reject({
				message: "We cannot determine your location",
			});
		}

		const { latitude, longitude } = geolocation;
		const orderByDistance = c => (geolocation ? _.sortBy(c, s => this.measureDistance(geolocation, language, true)(s.location)) : _.identity(c));

		return servicesApi
			.fetchAllServicesNearby(country.fields.slug, language, [longitude, latitude])
			.then(s => orderByDistance(s.results))
			.then(services => ({ services, category: null }));
	}

	fetchServicesWithin(bbox, category = null) {
		const { country, language } = this.props;
		return servicesApi
			.fetchAllServices(country.fields.slug, language, category, null)
			.then(s => s.results)
			.then(services => ({ services, category: category }));
	}

	fetchServicesWithinCategoryLocation(bbox, location = null, category = null) {
		const { country, language } = this.props;

		return servicesApi
			.fetchAllServices(location || country.fields.slug, language, category, null)
			.then(s => s.results)
			.then(services => ({ services, category: null }));
	}

	fetchServicesWithinLocation(bbox, location = null) {
		const { country, language } = this.props;

		return servicesApi
			.fetchAllServices(location || country.fields.slug, language, null, null)
			.then(s => s.results)
			.then(services => ({ services, category: null }));
	}

	serviceTypes() {
		const { language, country } = this.props;

		if (this.state.location) {
			return servicesApi.fetchCategories(language, this.state.location);
		}

		return servicesApi.fetchCategories(language, country.fields.slug);
	}

	serviceTypesByLocation(location) {
		const { language, country } = this.props;
		if (location) {
			return servicesApi.fetchCategories(language, location);
		}
		return servicesApi.fetchCategories(language, country.fields.slug);
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
		
		if ((!location || location.level === 1) && !category) {
			mapview ? goToMap(country) : listAllServices(country);
		} else if (location && location.level !== 1 && !category) {
			mapview ? goToLocationMap(country, location.slug) : listAllServicesinLocation(country, location.slug);
		} else if ((!location || location.level === 1) && category) {
			mapview ? goToCategoryMap(country, category.id) : listServicesInCategory(country, category);
		} else if (location && location.level !== 1 && category) {
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

		const { isMobile, countryDepartments, countryRegions, geolocation } = this.state;

		const { config } = this.context;

		const onSelectCategory = (c) => {
			this.setState({ categoryName: c.name, category: c.id });
			listServicesInCategory(this.props.country, c);
			if (this.state.location) {
				goToLocationByCategory(this.props.country, c.id, this.state.location);
			}
		};

		const onOpenLocation = (location, name) => {
			this.sessionStorage.location = JSON.stringify(location);
			this.setState({ location: location.slug, department: null, departmentName: null });
		}

		const onOpenDepartment = (id, department, name, location) => {
			this.setState({ departmentId: id, departmentName: name, department: department, location: department });
		}

		const goToLocations = (iscountrylist) => {
			if (config.showDepartments && (!this.state.department || iscountrylist)) {
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
			<div>
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
											findServicesInLocation={bbox => this.fetchServicesWithinLocation(bbox, props.match.params.location)}
											keepPreviousZoom={this.state.keepPreviousZoom}
										/>
									}
									{!isMobile &&
										<ServiceCategoryListDesktop
											{...props}
											fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
											fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
											goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
											fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
											fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
											fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 10)} /* TODO: Fix number of services */
											goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
										allRegions={countryRegions}
										department={this.state.department}
										departmentId={this.state.departmentId}
										departmentName={this.state.departmentName}
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
										allRegions={countryDepartments}
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
										fetchServicesInSameLocation={() => servicesApi.fetchServicesInSameLocation(language, props.match.params.serviceId)}
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
										fetchServicesInSameLocation={() => servicesApi.fetchServicesInSameLocation(language, props.match.params.serviceId)}
									/>
								</div>
							</Skeleton>
						)}
					/>
				</Switch>
				<Route
					exact
					path={`${match.url}/by-category/:categoryId/map`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={bbox => this.fetchServicesWithin(bbox, props.match.params.categoryId)}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
										fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
										goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
										fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
										goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										onSelectCategory={onSelectCategory}
										listAllServices={() => listAllServicesinLocation(country, props.match.params.location)}
										goToMap={() => onGoToLocationMap(props.match.params.location)}
										goToLocationList={() => { goToLocations(false) }}
										locationName={getLocationName(props.match.params.location)}
										departmentSelected={this.state.department}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
										fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
										goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
										fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
										goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
										findServicesInLocation={bbox => this.fetchServicesWithinCategoryLocation(bbox, props.match.params.location, props.match.params.categoryId)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										category={props.match.params.categoryId}
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
										fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
										goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
										fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
										goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
					path={`${match.url}/by-location/:location/map/`}
					component={props => (
						<Skeleton headerColor='light'>
							<div className="SkeletonContainer">
								{isMobile &&
									<ServiceMap
										{...props}
										findServicesInLocation={bbox => this.fetchServicesWithinLocation(bbox, props.match.params.location)}
										keepPreviousZoom={this.state.keepPreviousZoom}
									/>
								}
								{!isMobile &&
									<ServiceCategoryListDesktop
										{...props}
										fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
										fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
										fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
										goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
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
			</div>
		);
	}
}

const mapState = ({ country, language, regions }, p) => ({ country, language, regions });

const mapDispatch = (d, p) => ({
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
