import React from "react";
import { connect } from "react-redux";
import { ServiceMap, ServiceCategoryList, ServiceList, ServiceDetail } from "../components";
import { Route, Switch } from "react-router";
import { Skeleton } from ".";
import "../components/ServiceHome.css";
import { push } from "react-router-redux";

import _ from "lodash";

import actions from "../actions";

import servicesApi from "../content/servicesApi";
const turf = require("@turf/turf");

const measureDistance = (a, language, noFormat) => b => {
	if (a && b) {
		const currentGeoJSON = {
			type: "Point",
			coordinates: [a.longitude, a.latitude],
		};

		let distance = turf.distance(currentGeoJSON, b, "kilometers");
		if (!noFormat) {
			distance = distance.toFixed(3);
			if (Intl.NumberFormat) {
				let i18 = new Intl.NumberFormat(language);
				distance = i18.format(distance);
			}
		}
		return distance;
	}
	return null;
};

class Services extends React.Component {
	servicesByType(props) {
		const { country, language, currentCoordinates } = this.props;
		const { match } = props;
		const categoryId = match.params.categoryId;

		const orderByDistance = c => (currentCoordinates ? _.sortBy(c, s => measureDistance(currentCoordinates, language, true)(s.location)) : _.identity(c));
		return servicesApi
			.fetchAllServices(country.fields.slug, language, categoryId)
			.then(s => orderByDistance(s.results))
			.then(services => servicesApi.fetchCategoryById(language, categoryId).then(category => ({ services, category })));
	}

	fetchAllServices() {
		const { country, language, currentCoordinates } = this.props;

		const orderByDistance = c => (currentCoordinates ? _.sortBy(c, s => measureDistance(currentCoordinates, language, true)(s.location)) : _.identity(c));

		return servicesApi
			.fetchAllServices(country.fields.slug, language)
			.then(s => orderByDistance(s.results))
			.then(services => ({ services, category: null }));
	}

	fetchService(props) {
		const { language } = this.props;
		const { match } = props;
		const serviceId = match.params.serviceId;

		return servicesApi.fetchServiceById(language, serviceId);
	}

	serviceTypes() {
		const { language } = this.props;

		return servicesApi.fetchCategories(language);
	}

	render() {
		const { match, listServicesInCategory, goToService, serviceGeolocation, toogleServiceGeolocation, currentCoordinates, language, listAllServices } = this.props;
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
										locationEnabled={serviceGeolocation}
										measureDistance={measureDistance(currentCoordinates, language)}
										toggleLocation={() => toogleServiceGeolocation(!serviceGeolocation)}
										servicesByType={() => this.fetchAllServices()}
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
									<ServiceDetail {...props} language={language} fetchService={() => this.fetchService(props)} />
								</div>
							</Skeleton>
						)}
					/>
				</Switch>
				<Route
					path={`${match.url}/by-category/:categoryId/`}
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
								<ServiceList
									{...props}
									goToService={goToService}
									locationEnabled={serviceGeolocation}
									measureDistance={measureDistance(currentCoordinates, language)}
									toggleLocation={() => toogleServiceGeolocation(!serviceGeolocation)}
									servicesByType={() => this.servicesByType(props)}
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
									locationEnabled={serviceGeolocation}
									toggleLocation={() => toogleServiceGeolocation(!serviceGeolocation)}
									onSelectCategory={onSelectCategory}
									listAllServices={listAllServices}
								/>
							</div>
						</Skeleton>
					)}
				/>
				<Route
					path={`${match.url}/map/`}
					component={() => (
						<Skeleton hideFooter={true}>
							<ServiceMap services={[]} />
						</Skeleton>
					)}
				/>
			</div>
		);
	}
}

const mapState = ({ country, language, serviceGeolocation, currentCoordinates }, p) => {
	return { country, language, serviceGeolocation, currentCoordinates };
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
		toogleServiceGeolocation(value) {
			d(actions.toggleServiceGeolocation(value));
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(p => {
					const { latitude, longitude } = p.coords;
					d(actions.recordCoordinates({ latitude, longitude }));
				});
			}
		},
	};
};

export default connect(mapState, mapDispatch)(Services);
