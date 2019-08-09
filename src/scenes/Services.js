import React from "react";
import { connect } from "react-redux";
import { ServiceMap, ServiceCategoryList, ServiceLocationList, ServiceList, ServiceDetail, ServiceDepartmentList, ServiceCategoryListDesktop } from "../components";
import { Route, Switch } from "react-router";
import { Skeleton } from ".";
import { push } from "react-router-redux";
import measureDistance from "@turf/distance";
import PropTypes from 'prop-types';

import _ from "lodash";
import Promise from "bluebird";

import actions from "../actions";
import servicesApi from "../content/servicesApi";
import getSessionStorage from "../shared/sessionStorage";

class Services extends React.Component {
	state = {
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
		width: window.innerWidth,
	};

	static contextTypes = {
		config: PropTypes.object,
	};
	

	componentDidMount(){
		window.addEventListener('resize', () => { this.setState({ width: window.innerWidth })});
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

	servicesByType(routeProps) {
		const { country, language, showErrorMessage } = this.props;
		const { sortingByLocationEnabled, errorWithGeolocation, fetchingLocation, geolocation } = this.state;
		const { match } = routeProps;
		const categoryId = match.params.categoryId;

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
			.fetchAllServices(country.fields.slug, language, categoryId)
			.then(s => orderByDistance(s.results))
			.then(services => servicesApi.fetchCategoryById(language, categoryId).then(category => ({ services, category })))
			.catch(e => {
				console.log(e.stack);
				throw e;
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

	fetchAllServices() {
		const { country } = this.props;
		return this.fetchAllInLocation(country.fields.slug);
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

	fetchService(props) {
		const { language } = this.props;
		const { match } = props;
		const serviceId = match.params.serviceId;

		return servicesApi.fetchServiceById(language, serviceId);
	}
	fetchServicePreview(props) {
		const { language } = this.props;
		const { match } = props;
		const serviceId = match.params.serviceId;

		return servicesApi.fetchServicePreviewById(language, serviceId);
	}

	fetchServicesInSameLocation(props) {
		const { language } = this.props;
		const { match } = props;
		const serviceId = match.params.serviceId;

		return servicesApi.fetchServicesInSameLocation(language, serviceId);
	}

	serviceTypes() {
		const { language, country } = this.props;
		if (this.state.location){
			return servicesApi.fetchCategories(language, this.state.location);
		}
		return servicesApi.fetchCategories(language, country.fields.slug);
	}

	serviceTypesByLocation(location) {
		const { language, country } = this.props;
		if (location){
			return servicesApi.fetchCategories(language, location);
		}
		return servicesApi.fetchCategories(language, country.fields.slug);
	}

	getLocation(){
		const { country } = this.props;
		return this.state.location ? this.state.location : country.fields.slug;
	}

	fetchServices(location, category){
		const { language } = this.props;
		return servicesApi.fetchAllServices(location, language, category, null, 2000)
	}
	goTo(location, category, mapview = false){	
		console.log("Go to", location, category, mapview);
		const {
			goToLocationMap,
			goToCategoryMap,
			goToLocationCategoryMap,
			goToLocationByCategory,
			goToMap,
			listAllServices,
			listAllServicesinLocation,
			listServicesInCategory
		} = this.props;
		if (mapview){
			if ((!location || location.level === 1)  && !category){
				goToMap();
			}else if(location && location.level !== 1 && !category){
				goToLocationMap(location.slug);			
			}else if((!location || location.level === 1) && category){			
				goToCategoryMap(category.id);
			}else if(location && location.level !== 1 && category){			
				goToLocationCategoryMap(location.slug, category.id);
			}
		}else{
			if ((!location || location.level === 1)  && !category){
				listAllServices();
			}else if(location && location.level !== 1 && !category){
				listAllServicesinLocation(location.slug);			
			}else if((!location || location.level === 1) && category){			
				listServicesInCategory(category);
			}else if(location && location.level !== 1 && category){			
				goToLocationByCategory(category.id, location.slug);
			}
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
			goToNearby,
			goToService,
			language,
			listAllServices,
			listAllServicesinLocation,
			listServicesInCategory,
			servicesInCategoryMap,
			servicesInLocationMap,
			match,
			regions,
		} = this.props;
		const { width } = this.state;
		const isMobile = width <= 1000;
		  
		let regionDictionary = _.fromPairs(regions.map(r => [r.id, r]));
		let regionsWithCountry = regions.map(r => {
			let parent = r.parent ? regionDictionary[r.parent] : null;
			let country = r.parent ? (parent.parent ? regionDictionary[parent.parent] : parent) : r;
			return {
				country,
				...r
			};
		});
		let countryRegions = regionsWithCountry.filter(c => c.country.slug === country.fields.slug && [1, 3].indexOf(c.level) > - 1 && !c.hidden);
		let countryDepartments = regionsWithCountry.filter(c => c.country.slug === country.fields.slug && c.level === 2 && !c.hidden);

		const { sortingByLocationEnabled, geolocation, errorWithGeolocation } = this.state;
		const { coordinates } = country.fields;
		let defaultLocation = {};
		if (coordinates) {
			defaultLocation = {
				latitude: coordinates.lat,
				longitude: coordinates.lon,
			};
		}		

		const { config } = this.context;
		const onSelectCategory = (c) => {
			this.setState({ categoryName: c.name, category: c.id });
			listServicesInCategory(c);
			if (this.state.location){
				goToLocationByCategory(c.id, this.state.location);
			}
		};

		const onOpenLocation = (location,name ) => {
			this.sessionStorage.location = JSON.stringify(location);
			this.setState({ location: location.slug, department: null, departmentName: null});
		}

		const onOpenDepartment = (id, department, name, location) => {
			this.setState({ departmentId: id, departmentName: name, department: department, location: department });
		}

		const goToLocations = (iscountrylist) => {		
			if (config.showDepartments && (!this.state.department || iscountrylist)){
				goToDepartmentList();
			}else{
				goToLocationList();
			}
		}

		const onGoToMap = (isCountryWide = null) => {	
			this.setState({keepPreviousZoom: false});		
			if (!isCountryWide && this.state.location){
				goToLocationMap(this.state.location);
			}else{
				goToMap();
			}
		}	

		const onGoToLocationMap = (location) => {
			this.setState({keepPreviousZoom: false});
			goToLocationMap(location);
		}

		const getLocationName = (slug) =>{
			const { regions} = this.props;
			if (!this.state.locationName){
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
									{ isMobile && <ServiceMap
										{...props}
										goToService={goToService}
										language={language}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										findServicesInLocation={bbox => this.fetchServicesWithinLocation(bbox, props.match.params.location)}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => _.identity()}
										nearby={true}
										defaultLocation={defaultLocation}
										categoryName="All Services"
										keepPreviousZoom = {this.state.keepPreviousZoom}
										changeCategory={() => { goToLocation(this.state.location) }}
									/>}
									{ !isMobile && 
										<ServiceCategoryListDesktop
											{...props}
											goToService={goToService}
											language={language}
											locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
											findServicesInLocation={bbox => this.fetchServicesWithinLocation(bbox, props.match.params.location)}
											measureDistance={this.measureDistance(geolocation, language)}
											toggleLocation={() => _.identity()}
											nearby={true}
											defaultLocation={defaultLocation}
											categoryName="All Services"
											keepPreviousZoom = {this.state.keepPreviousZoom}
											changeCategory={() => { goToLocation(this.state.location) }}
											mapView={true}
											fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
											fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
											goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
											showDepartments={config.showDepartments}
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
								{ isMobile && 
									<ServiceList
										{...props}
										goToService={goToService}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
										servicesByType={() => this.fetchAllServices()}
										showMap={() => goToMap()}
									/>}
									{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={false}									
									location = {null}
									category = {null}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
								/>
							
							}	
								</div>
							</Skeleton>
						)}
					/>{" "}
					<Route
						path={`${match.url}/nearby/`}
						exact
						component={props => (
							<Skeleton headerColor='light'>
								<div className="SkeletonContainer">
									<ServiceList
										{...props}
										goToService={goToService}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => _.identity()}
										servicesByType={() => this.fetchAllServicesNearby()}
										nearby={true}
										showMap={() => goToMap()}
									/>
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
										goToService={goToService}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => _.identity()}
										nearby={true}
										openLocation={(location, name) => {
											onOpenLocation(location, name);
											goToLocation(location.slug);
										}}
										departmentId={this.state.departmentId}
										department={this.state.department}
										departmentName={this.state.departmentName}
										allRegions={countryRegions}
										goToMap={() => goToMap()}
										country={country}
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
										goToService={goToService}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => _.identity()}
										nearby={true}
										onOpenDepartment={(id, department, name) => {
											onOpenDepartment(id, department, name);
											goToLocation(department);
											//goToLocationList();
										}}
										allRegions={countryDepartments}
										goToMap={() => goToMap()}
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
										language={language}
										goToService={goToService}
										fetchService={() => this.fetchServicePreview(props)}
										fetchServicesInSameLocation={() => this.fetchServicesInSameLocation(props)}
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
										language={language}
										goToService={goToService}
										fetchService={() => this.fetchService(props)}
										fetchServicesInSameLocation={() => this.fetchServicesInSameLocation(props)}
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
							{ isMobile &&
								<ServiceMap
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									findServicesInLocation={bbox => this.fetchServicesWithin(bbox, props.match.params.categoryId)}
									nearby={true}
									defaultLocation={defaultLocation}
									categoryName={this.state.categoryName}
									directMap = {this.state.directMap}
									changeCategory={() => { goToLocation(this.state.location) }}
									
								/>}
								{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={true}
									location = {null}
									category = {props.match.params.categoryId}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
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
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
							{ isMobile && 
								<ServiceList
									{...props}
									goToMap={() => goToMap()}
									goToService={goToService}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									servicesByType={() => this.fetchAllInLocation(this.getLocation(), props.match.params.categoryId)}
									showMap={() => goToCategoryMap(props.match.params.categoryId)}
									title={this.state.categoryName}
								/>
							}
								{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={false}
									location = {null}
									category = {props.match.params.categoryId}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
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
								{ isMobile &&
								<ServiceCategoryList
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									onSelectCategory={onSelectCategory}
									listAllServices={() => listAllServicesinLocation(props.match.params.location)}
									goToNearby={() => goToNearby()}
									goToMap={() => onGoToLocationMap(props.match.params.location)}
									goToLocationList={()=> {goToLocations(false)}}
									showLocations={true}
									location={props.match.params.location}
									locationName={getLocationName(props.match.params.location)}
									departmentSelected = {this.state.department}
								/>
								}
								{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={false}
									location = {props.match.params.location}
									category = {null}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
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
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
							{ isMobile && 
								<ServiceList
									{...props}
									goToMap={() => goToLocationCategoryMap(props.match.params.location,props.match.params.categoryId )}
									goToService={goToService}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									servicesByType={() => this.fetchAllInLocation(props.match.params.location, props.match.params.categoryId)}
									showMap={() => goToLocationCategoryMap(props.match.params.location,props.match.params.categoryId )}
									title={this.state.categoryName}
									location={props.match.params.location}
								/>
							}
								{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={false}
									location = {props.match.params.location}
									category = {props.match.params.categoryId}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
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
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInCategoryMap(this.state.category, this.state.location)} >
							<div className="SkeletonContainer">
							{ isMobile && 
								<ServiceMap
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
						 			measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									findServicesInLocation={bbox => this.fetchServicesWithinCategoryLocation(bbox, props.match.params.location, props.match.params.categoryId)}
									nearby={true}
									defaultLocation={defaultLocation}
									categoryName="All Services"
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
							/>}	
								{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={true}
									location = {props.match.params.location}
									category = {props.match.params.categoryId}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
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
						<Skeleton headerColor='light' showMapButton={true} goToMap={() => servicesInLocationMap(this.state.location)}>
							<div className="SkeletonContainer">
							{ isMobile && 
								<ServiceList
									{...props}
									goToMap={() => goToMap()}
									goToService={goToService}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									servicesByType={() => this.fetchAllInLocation(props.match.params.location)}
									showMap={() => goToLocationMap(props.match.params.location )}
									title={this.state.categoryName}
									location={props.match.params.location}
								/>}
							{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={false}
									location = {props.match.params.location}
									category = {null}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
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
							{ isMobile && 
								<ServiceMap
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									findServicesInLocation={bbox => this.fetchServicesWithinLocation(bbox, props.match.params.location)}
									nearby={true}
									defaultLocation={defaultLocation}
									categoryName="All Services"
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
								/>}
								{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={true}
									location = {props.match.params.location}
									category = {null}
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									showDepartments={config.showDepartments}
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
							{ isMobile && 
								<ServiceCategoryList
									fetchCategories={() => this.serviceTypes()}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									onSelectCategory={onSelectCategory}
									listAllServices={listAllServices}
									goToNearby={() => goToNearby()}
									goToMap={() => onGoToMap(true)}
									goToLocationList={()=> {goToLocations(true)}}
									showLocations={true}
								/>
							}

							{ !isMobile && 
								<ServiceCategoryListDesktop
									{...props}
									goToService={goToService}
									language={language}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									findServicesInLocation={bbox => this.fetchServicesWithinLocation(bbox, props.match.params.location)}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => _.identity()}
									nearby={true}
									defaultLocation={defaultLocation}
									categoryName="All Services"
									keepPreviousZoom = {this.state.keepPreviousZoom}
									changeCategory={() => { goToLocation(this.state.location) }}
									mapView={false}
									showFilter = { true }
									fetchCategories={() => this.serviceTypesByLocation(props.match.params.location)}
									fetchCategoriesByLocation={(location) => this.serviceTypesByLocation(location)}
									goTo={(location, category, mapview) => this.goTo(location, category, mapview)}
									fetchServices={(location, category) => servicesApi.fetchAllServices(location, language, category, null, 2000)}
									location={{}}
									showDepartments={config.showDepartments}
								/>
							
							}
							</div>
						</Skeleton>
					)}
				/>
			</div>
		);
	}
}

const mapState = ({ country, language, regions }, p) => {
	return { country, language, regions };
};
const mapDispatch = (d, p) => {
	const _goToCategoryMap = (category)=> {
		return d(push(`/${p.country.fields.slug}/services/by-category/${category}/map/`));
	}
	return {
		
		goToCategoryMap:_goToCategoryMap,

		goToLocation(location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/`));
		},
		goToLocationByCategory(category, location) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category}/location/${location}`));
		},
		goToLocationList() {
			return d(push(`/${p.country.fields.slug}/services/locations/`));
		},
		goToDepartmentList() {
			return d(push(`/${p.country.fields.slug}/services/departments/`));
		},
		goToLocationMap(location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/map/`));
		},
		goToLocationCategoryMap(location, category) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category}/location/${location}/map/`));
		},
		goToMap() {
			return d(push(`/${p.country.fields.slug}/services/map/`));
		},
		goToNearby() {
			return d(push(`/${p.country.fields.slug}/services/nearby/`));
		},
		goToService(id) {
			return d(push(`/${p.country.fields.slug}/services/${id}?language=${p.language}`));
		},
		listAllServices() {
			return d(push(`/${p.country.fields.slug}/services/all/`));
		},
		listAllServicesinLocation(location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/all/`));
		},
		listLocationsFilter(category) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category.id}/locations/`));
		},
		listServicesInCategory(category) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category.id}/`));
		},
		servicesInCategoryMap(category, location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/by-category/${category}/map`));
		},
		servicesInLocationMap(location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/map`));
		},
		loadGeolocation() {
			console.log("NOOP");
		},
		showErrorMessage(error) {
			d(actions.showErrorMessage(error));
		},
		toggleServiceGeolocation(value) {
			console.log("NOOP");
		},
	};
};

export default connect(mapState, mapDispatch)(Services);
