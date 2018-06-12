import React from "react";
import { connect } from "react-redux";
import { ServiceMap, ServiceCategoryList, ServiceLocationList, ServiceList, ServiceDetail } from "../components";
import { Route, Switch } from "react-router";
import { Skeleton } from ".";
import { push } from "react-router-redux";
import measureDistance from "@turf/distance";

import _ from "lodash";
import Promise from "bluebird";

import actions from "../actions";
import servicesApi from "../content/servicesApi";

class Services extends React.Component {
	state = {
		sortingByLocationEnabled: false,
		fetchingLocation: false,
		errorWithGeolocation: false,
		geolocation: null,
		categoryName: null,
		category: null,
		locationName: null,
		location: null,
	};

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
			} catch (e) {}
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
				return new Promise(() => {});
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
				return new Promise(() => {});
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
				return new Promise(() => {});
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

				return new Promise(() => {});
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

			return new Promise(() => {});
		}

		if (fetchingLocation) {
			return new Promise(() => {});
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
			.fetchAllServicesInBBox(country.fields.slug, language, bbox, 500, category)
			.then(s => s.results)
			.then(services => ({ services, category: null }));
	}
	fetchServicesWithinLocation(bbox, location = null) {
		const { country, language } = this.props;

		return servicesApi
			.fetchAllServicesInBBox(location || country.fields.slug, language, bbox, 500, null)
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

		return servicesApi.fetchCategories(language, country.fields.slug);
	}

	render() {
		const {
			country,
			goToCategoryMap,
			goToLocation,
			goToLocationByCategory,
			goToLocationList,
			goToLocationMap,
			goToMap,
			goToNearby,
			goToService,
			language,
			listAllServices,
			listLocationsFilter,
			listServicesInCategory,
			servicesInCategoryMap,
			match,
			regions,
		} = this.props;

		let regionDictionary = _.fromPairs(regions.map(r=> [r.id, r]));
		let regionsWithCountry = regions.map(r=> {
			let parent = r.parent ? regionDictionary[r.parent] : null;
			let country = r.parent ? (parent.parent ? regionDictionary[parent.parent] : parent) : r;
			return {
				country, 
				...r
			};
		});
		let countryRegions = regionsWithCountry.filter(c=> c.country.slug === country.fields.slug && [1,3].indexOf(c.level) > - 1 && !c.hidden);

		const { sortingByLocationEnabled, geolocation, errorWithGeolocation } = this.state;
		const { coordinates } = country.fields;
		let defaultLocation = {};
		if (coordinates) {
			defaultLocation = {
				latitude: coordinates.lat,
				longitude: coordinates.lon,
			};
		}

		const onSelectCategory = (c,cname, location) => {	
			this.setState({categoryName : cname, category: c.id});
			listServicesInCategory(c, this.state.location);
		};

		const onOpenLocation = (name, location) => {
			this.setState({locationName: name, location: location});
		}

		return (
			<div>
				<Switch>
					<Route
						path={`${match.url}/all/`}
						exact
						component={props => (
							<Skeleton>
								<div className="SkeletonContainer">
									<ServiceList
										{...props}
										goToService={goToService}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
										servicesByType={() => this.fetchAllServices()}
										showMap={() => goToMap()}
									/>
								</div>
							</Skeleton>
						)}
					/>{" "}					
					<Route
						path={`${match.url}/nearby/`}
						exact
						component={props => (
							<Skeleton>
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
							<Skeleton>
								<div className="SkeletonContainer">
									<ServiceLocationList
										{...props}
										goToService={goToService}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => _.identity()}
										nearby={true}
										openLocation={(location, name) => {
											onOpenLocation(name, location);
											goToLocation(location);											
										}}
										allRegions={countryRegions}
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
							<Skeleton>
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
							<Skeleton>
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
					path={`${match.url}/by-location/:location/by-category/:categoryId/map`}
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
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
								/>
							</div>
						</Skeleton>
					)}
				/>
				
				<Route
					exact
					path={`${match.url}/by-location/:location/by-category/:categoryId/`}
					component={props => (
						<Skeleton showMapButton={true} goToMap={() => servicesInCategoryMap(this.state.category, this.state.location) }>
							<div className="SkeletonContainer">
								<ServiceList
									{...props}
									goToMap={() => goToMap()}
									goToService={goToService}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									servicesByType={() => this.fetchAllInLocation(props.match.params.location, props.match.params.categoryId)}
									showMap={() => goToLocationMap(props.match.params.location,)}
								/>
							</div>
						</Skeleton>
					)}
				/>
				<Route
					exact
					path={`${match.url}/by-location/:location/`}
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
								<ServiceCategoryList
									fetchCategories={() => this.serviceTypes()}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									onSelectCategory={onSelectCategory}
									listAllServices={() => listAllServices(this.state.location)}
									goToNearby={() => goToNearby()}
									goToMap={() => goToMap()}
									goToLocationList={() => goToLocationList()}
									showLocations={true}
									location={this.state.location}
								/>				
								
								
							</div>
						</Skeleton>
					)}
				/>			
				<Route
					exact
					path={`${match.url}/by-location/:location/all`}
					component={props => (
						<Skeleton showMapButton={true} goToMap={() => servicesInCategoryMap(this.state.category, this.state.location) }>
							<div className="SkeletonContainer">
								<ServiceList
									{...props}
									goToService={goToService}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									servicesByType={() => this.fetchAllInLocation(props.match.params.location, props.match.params.categoryId)}
									showMap={() => goToLocationMap(props.match.params.location)}
									location={this.state.location}
								/>			
								
								
							</div>
						</Skeleton>
					)}
				/>				

				<Route
					exact
					path={`${match.url}/by-location/:location/map/`}
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
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
								/>
							</div>
						</Skeleton>
					)}
				/>				
				<Route
					exact
					path={`${match.url}`}
					component={() => (
						<Skeleton>
							<div className="SkeletonContainer">
								<ServiceCategoryList
									fetchCategories={() => this.serviceTypes()}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									onSelectCategory={onSelectCategory}
									listAllServices={listAllServices}
									goToNearby={() => goToNearby()}
									goToMap={() => goToMap()}
									goToLocationList={() => goToLocationList()}
									showLocations={true}
								/>
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
	return {
		goToCategoryMap(category) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category}/map/`));
		},
		goToLocation(location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/`));
		},
		goToLocationByCategory(category, location) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category}/locations/${location}`));
		},
		goToLocationList() {
			return d(push(`/${p.country.fields.slug}/services/locations/`));
		},
		goToLocationMap(location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/map/`));
		},
		goToMap() {
			return d(push(`/${p.country.fields.slug}/services/map/`));
		},
		goToNearby() {
			return d(push(`/${p.country.fields.slug}/services/nearby/`));
		},
		goToService(id) {
			return d(push(`/${p.country.fields.slug}/services/${id}/`));
		},
		listAllServices(location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/all/`));
		},
		listLocationsFilter(category) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category.id}/locations/`));
		},
		listServicesInCategory(category, location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/by-category/${category.id}/`));
		},
		servicesInCategoryMap(category, location) {
			return d(push(`/${p.country.fields.slug}/services/by-location/${location}/by-category/${category}/map`));
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
