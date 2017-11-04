import React from "react";
import { connect } from "react-redux";
import { ServiceMap, ServiceCategoryList, ServiceList, ServiceDetail } from "../components";
import { Route } from "react-router";
import { Skeleton } from ".";
import "../components/ServiceHome.css";
import { push } from "react-router-redux";

import request from "superagent";
import Promise from "bluebird";
import _ from "lodash";

import actions from "../actions";
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

		return new Promise((resolve, reject) => {
			request
				.get(`https://admin.next.refugee.info/e/production/v2/services/search/?filter=relatives&geographic_region=${country.fields.slug}&page=1&page_size=1000&type_numbers=${categoryId}`)
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}
					let services = orderByDistance(res.body.results);

					request
						.get(`https://admin.next.refugee.info/e/production/v2/service-types/${categoryId}/`)
						.set("Accept-Language", language)
						.end((err, res) => {
							if (err) {
								reject(err);
							}

							resolve({
								category: res.body,
								services,
							});
						});
				});
		});
	}

	fetchService(props) {
		const { language } = this.props;
		const { match } = props;
		const serviceId = match.params.serviceId;

		return new Promise((resolve, reject) => {
			request
				.get(`https://admin.next.refugee.info/e/production/v2/services/search/?id=${serviceId}`)
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}
					let service = _.first(res.body);

					resolve(service);
				});
		});
	}

	serviceTypes() {
		return new Promise((resolve, reject) => {
			const { language } = this.props;

			request
				.get(`https://admin.next.refugee.info/e/production/v2/service-types/`)
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}

					resolve(res.body);
				});
		});
	}

	render() {
		const { match, listServicesInCategory, goToService, serviceGeolocation, toogleServiceGeolocation, currentCoordinates, language } = this.props;
		const onSelectCategory = c => {
			listServicesInCategory(c);
		};
		return (
			<div>
				<Route
					path={`${match.url}/:serviceId/`}
					exact
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
								<ServiceDetail {...props} fetchService={() => this.fetchService(props)} />
							</div>
						</Skeleton>
					)}
				/>
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
