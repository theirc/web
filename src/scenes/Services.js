import React from "react";
import { connect } from "react-redux";
import { ServiceMap, ServiceCategoryList, ServiceList, ServiceDetail } from "../components";
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

	fetchAllInLocation(location) {
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
			.fetchAllServices(country, language)
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
		const { match, goToCategoryMap, country, listServicesInCategory, goToMap, goToNearby, goToService, language, listAllServices } = this.props;

		const { sortingByLocationEnabled, geolocation, errorWithGeolocation } = this.state;
		const { coordinates } = country.fields;
		let defaultLocation = {};
		if (coordinates) {
			defaultLocation = {
				latitude: coordinates.lat,
				longitude: coordinates.lon,
			};
		}

		const onSelectCategory = c => {
			listServicesInCategory(c);
		};

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
									/>
								</div>
							</Skeleton>
						)}
					/>{" "}
					<Route
						path={`${match.url}/map/`}
						exact
						component={props => (
							<Skeleton>
								<div className="SkeletonContainer">
									<ServiceMap
										{...props}
										goToService={goToService}
										locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
										measureDistance={this.measureDistance(geolocation, language)}
										toggleLocation={() => _.identity()}
										findServicesInLocation={bbox => this.fetchServicesWithin(bbox)}
										nearby={true}
										defaultLocation={defaultLocation}
									/>
								</div>
							</Skeleton>
						)}
					/>
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
					path={`${match.url}/by-category/:categoryId/map/`}
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
					path={`${match.url}/by-category/:categoryId/`}
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
								<ServiceList
									{...props}
									goToService={goToService}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									servicesByType={() => this.servicesByType(props)}
									showMap={() => goToCategoryMap(props.match.params.categoryId)}
								/>
							</div>
						</Skeleton>
					)}
				/>
				<Route
					path={`${match.url}/by-location/:location/`}
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
								<ServiceList
									{...props}
									goToService={goToService}
									locationEnabled={sortingByLocationEnabled && !errorWithGeolocation}
									measureDistance={this.measureDistance(geolocation, language)}
									toggleLocation={() => this.setState({ sortingByLocationEnabled: true })}
									servicesByType={() => this.fetchAllInLocation(props.match.params.location)}
									showMap={() => goToMap()}
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
								/>
							</div>
						</Skeleton>
					)}
				/>
			</div>
		);
	}
}

const mapState = ({ country, language }, p) => {
	return { country, language };
};
const mapDispatch = (d, p) => {
	return {
		listServicesInCategory(category) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category.id}/`));
		},
		goToService(id) {
			return d(push(`/${p.country.fields.slug}/services/${id}/`));
		},

		listAllServices() {
			return d(push(`/${p.country.fields.slug}/services/all/`));
		},
		goToNearby() {
			return d(push(`/${p.country.fields.slug}/services/nearby/`));
		},
		goToMap() {
			return d(push(`/${p.country.fields.slug}/services/map/`));
		},
		goToCategoryMap(category) {
			return d(push(`/${p.country.fields.slug}/services/by-category/${category}/map/`));
		},
		showErrorMessage(error) {
			d(actions.showErrorMessage(error));
		},
		toggleServiceGeolocation(value) {
			console.log("NOOP");
		},
		loadGeolocation() {
			console.log("NOOP");
		},
	};
};

export default connect(mapState, mapDispatch)(Services);
