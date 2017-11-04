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

var tinycolor = require("tinycolor2");

class ServiceHome extends React.Component {
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
			<div className="ServiceHome">
				<div className="ServiceCategoryTitle">
					<h1>{t("Service Categories")}</h1>
				</div>
				{(categories || []).map(this.renderCategory.bind(this))}
			</div>
		);
	}
}

ServiceHome = translate()(ServiceHome);

class ServiceCategoryList extends React.Component {
	state = {
		category: {},
		services: [],
		loaded: false,
	};
	componentDidMount() {
		const { fetchServices } = this.props;
		if (fetchServices) {
			fetchServices().then(({ services, category }) => this.setState({ services, category, loaded: true }));
		}
	}
	renderService(s) {
		let iconWithPrefix = vector_icon => vector_icon.split("-")[0] + " " + vector_icon;
		let categoryStyle = color => {
			if (!color) {
				color = "#000";
			} else if (color.indexOf("#") === -1) {
				color = `#${color}`;
			}

			color = tinycolor(color)
				.saturate(30)
				.toHexString();

			return {
				color: color,
				borderColor: tinycolor(color).darken(10),
			};
		};

		return [
			<div key={s.id} className="Item">
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
				<i className="material-icons"></i>
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
ServiceCategoryList = translate()(ServiceCategoryList);

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

	componentWillReceiveProps(nextProps) {
		/**
		const typePromise = new Promise((resolve, reject) => {
			request.get(`https://admin.next.refugee.info/e/production/v2/service-types/`).end((err, res) => {
				if (err) {
					reject(err);
				}
				
				resolve(res.body);
			});
		});
		
		Promise.all([typePromise]).then(results => {
			const [types] = results;
			this.setState({
				types,
			});
		});
		 * 
		 */
	}

	render() {
		const { match, listServicesInCategory } = this.props;
		const onSelectCategory = c => {
			listServicesInCategory(c);
		};
		return (
			<div>
				<Route
					path={`${match.url}/by-category/:categoryId`}
					component={props => (
						<Skeleton>
							<div className="SkeletonContainer">
								<ServiceCategoryList {...props} fetchServices={() => this.servicesByType(props)} />
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
								<ServiceHome fetchCategories={() => this.serviceTypes()} onSelectCategory={onSelectCategory} />
							</div>
						</Skeleton>
					)}
				/>
				<Route
					path={`${match.url}/map`}
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
			return d(push(`/${p.country.fields.slug}/services/by-category/${category.id}`));
		},
	};
};

export default connect(mapState, mapDispatch)(Services);
