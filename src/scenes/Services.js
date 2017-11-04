import React from "react";
import { connect } from "react-redux";
import { ServiceMap } from "../components";
import { Route } from "react-router";
import { Skeleton } from ".";
import "../components/ServiceHome.css";
import { push } from "react-router-redux";

import request from "superagent";
import Promise from "bluebird";
import { translate } from "react-i18next";
import _ from "lodash";

var tinycolor = require("tinycolor2");

class ServiceCategoryList extends React.Component {
	state = {
		categories: [],
	};
	componentDidMount() {
		const { fetchCategories } = this.props;
		if (fetchCategories) {
			fetchCategories().then(categories => this.setState({ categories }));
		}
	}

	renderCategory(c) {
		let { onSelectCategory } = this.props;
		onSelectCategory = onSelectCategory || (() => console.log("noop"));

		let { id, color, name, vector_icon } = c;

		if (!color) {
			color = "#FFF";
		} else if (color.indexOf("#") === -1) {
			color = `#${color}`;
		}

		color = tinycolor(color)
			.saturate(30)
			.toHexString();

		let iconPrefix = vector_icon.split("-")[0];
		let style = {
			backgroundColor: color,
			borderColor: tinycolor(color).darken(10),
			color: tinycolor.mostReadable(color, ["#000", "#444", "#888", "#FFF"]).toHexString(),
		};

		return (
			<div key={id} className="CategoryContainer">
				<button className="Category" style={style} onClick={() => setTimeout(() => onSelectCategory(c), 300)}>
					<i className={`${iconPrefix} ${vector_icon}`} />
					<span>{name}</span>
				</button>
			</div>
		);
	}
	render() {
		const { categories } = this.state;
		const { t } = this.props;

		return (
			<div className="ServiceCategoryList">
				<div className="ServiceCategoryTitle">
					<h1>{t("Service Categories")}</h1>
				</div>
				{(categories || []).map(this.renderCategory.bind(this))}
			</div>
		);
	}
}

ServiceCategoryList = translate()(ServiceCategoryList);

class ServiceList extends React.Component {
	state = {
		category: {},
		services: [],
		loaded: false,
	};
	componentDidMount() {
		const { servicesByType } = this.props;
		if (servicesByType) {
			servicesByType().then(({ services, category }) => this.setState({ services, category, loaded: true }));
		}
	}
	renderService(s) {
		const { goToService } = this.props;

		let iconWithPrefix = vector_icon => vector_icon.split("-")[0] + " " + vector_icon;
		let categoryStyle = color => {
			if (!color) {
				color = "#000";
			} else if (color.indexOf("#") === -1) {
				color = `#${color}`;
			}

			color = tinycolor(color)
				.saturate(30)
				.darken(10)
				.toHexString();

			return {
				color: color,
				borderColor: tinycolor(color).darken(10),
			};
		};

		return [
			<div key={s.id} className="Item" onClick={() => goToService(s.id)}>
				<div className="Icons">
					{s.types.map((t, idx) => (
						<div className="Icon" key={`${s.id}-${idx}`}>
							<i className={iconWithPrefix(t.vector_icon)} style={categoryStyle(t.color)} />
						</div>
					))}
				</div>
				<div className="Info">
					<h1>{s.name}</h1>
					<h2>
						{s.provider.name} <small>{s.region.title}</small>
					</h2>
				</div>
				<i className="material-icons" />
			</div>,
		];
	}
	render() {
		const { services, category, loaded } = this.state;
		const { t } = this.props;

		if (!loaded) {
			return <div />;
		}

		return (
			<div className="ServiceList">
				<div className="ServiceListTitle">
					<h1>
						<small>{category.name}:</small>
						{t("Services")}
					</h1>
				</div>
				<div className="ServiceListItems">{services.map(this.renderService.bind(this))}</div>
			</div>
		);
	}
}
ServiceList = translate()(ServiceList);

class ServiceDetail extends React.Component {
	state = {
		service: null,
	};
	componentDidMount() {
		const { fetchService } = this.props;
		if (fetchService) {
			fetchService().then(service => this.setState({ service }));
		}
	}
	render() {
		const { service } = this.state;
		const { t } = this.props;
		if (!service) {
			return null;
		}

		return (
			<div className="ServiceDetail">
				<div className="Title">
					<h1>
						<small>{_.first(service.types).name}:</small>
						{service.name}
					</h1>
				</div>
				{service.image && (
					<div className="hero">
						<img src={service.image} alt={service.provider.name} />
					</div>
				)}
				<article>
					<p dangerouslySetInnerHTML={{ __html: service.description }} />
					{service.additional_information && [<h3>{t("Additional Information")}</h3>, <p dangerouslySetInnerHTML={{ __html: service.additional_information }} />]}
					<h3>{t("Address")}</h3>
					<p>
						<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service['address_en'])}`} target="_blank">
							{service.address}
						</a>
					</p>
					<p dangerouslySetInnerHTML={{ __html: service.address_in_country_language }} />
				</article>
			</div>
		);
	}
}
ServiceDetail = translate()(ServiceDetail);

class Services extends React.Component {
	servicesByType(props) {
		const { country, language } = this.props;
		const { match } = props;
		const categoryId = match.params.categoryId;

		return new Promise((resolve, reject) => {
			request
				.get(`https://admin.next.refugee.info/e/production/v2/services/search/?filter=relatives&geographic_region=${country.fields.slug}&page=1&page_size=1000&type_numbers=${categoryId}`)
				.set("Accept-Language", language)
				.end((err, res) => {
					if (err) {
						reject(err);
					}
					let services = res.body.results;

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
		const { match, listServicesInCategory, goToService } = this.props;
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
								<ServiceList {...props} goToService={goToService} servicesByType={() => this.servicesByType(props)} />
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
								<ServiceCategoryList fetchCategories={() => this.serviceTypes()} onSelectCategory={onSelectCategory} />
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
	};
};

export default connect(mapState, mapDispatch)(Services);
