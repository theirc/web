import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";
import HeaderBar from "./HeaderBar";
import { Language } from "material-ui-icons";

var tinycolor = require("tinycolor2");

class ServiceList extends React.Component {
	state = {
		category: {},
		services: [],
		loaded: false,
		errorMessage: null,
		serviceType: [],
	};
	componentDidMount() {
		const { servicesByType, listAllServices } = this.props;
		if (servicesByType) {
			servicesByType()
				.then(({ services, category }) => this.setState({ services, category, loaded: true }))
				.catch(c => this.setState({ errorMessage: c.message, category: null, loaded: true }));
		}
		if (listAllServices) {
			listAllServices()
				.then(({ services, category }) => this.setState({ services, category, loaded: true }))
				.catch(c => this.setState({ errorMessage: c.message, category: null, loaded: true }));
		}
		const { fetchCategory} = this.props;
		const { serviceType } = this.state;
		if (fetchCategory && serviceType.length === 0) {
			fetchCategory().then(serviceType => {
				this.setState({ serviceType });
			});
		}
	}
	renderService(s) {
		const { goToService, measureDistance } = this.props;
		const distance = measureDistance && s.location && measureDistance(s.location);

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
		let fullAddress = [s.address, s.address_city].filter(val => val).join(", ");
		let mainType = s.type ? s.type : s.types[0];
		let subTypes = s.types.filter(t => t.id > 0 && t.id !== mainType.id);
		return [
			<li key={s.id} className="Item" onClick={() => goToService(s.id)}>
				<div className="Icon" key={`${s.id}-0`}>
					<i className={iconWithPrefix(mainType.vector_icon)} style={categoryStyle(mainType.color)} />
				</div>
				<div className="Info">
					<h1>{s.name}</h1>
					<h2>
						{s.provider.name}{" "}
						<span>
							{fullAddress}
							{distance && ` - ${distance}`}
						</span>
						<div className="Icons">
							{subTypes.map((t, idx) => (
								<div className="Icon" key={`${s.id}-${idx}`}>
									<i className={iconWithPrefix(t.vector_icon)} style={categoryStyle(t.color)} />
								</div>
							))}
						</div>
					</h2>
				</div>
				<i className="material-icons" />
			</li>,
		];
	}
	render() {
		const { services, category, loaded, errorMessage, serviceType} = this.state;
		const { t, locationEnabled, toggleLocation, nearby, showMap, title, id  } = this.props;
		let categoryName;
		serviceType.length != 0 && (categoryName = serviceType.name);
		let titleName = categoryName ? categoryName : t("Services");


		// vacancy === false --> available
		// vacancy === true  --> unavailable
		const availableServices = services.filter(s => !s.provider.vacancy);
		let sortedAvailableServices =[]
		if (availableServices){
			sortedAvailableServices = _.orderBy(availableServices, ["region.level", "region.name", "name"], ["desc", "asc", "asc"]);
		}
		const unavailableServices = services.filter(s => s.provider.vacancy);
		if (!loaded) {
			return (
				<div className="ServiceList">
					<HeaderBar title={nearby ? t("Nearby Services") : titleName}>
					</HeaderBar>
					<div className="loader" />
				</div>
			);
		}

		return (
			<div className="ServiceList">
				<HeaderBar title={nearby ? t("Nearby Services") : (category ? category.name : titleName)}>
					
				</HeaderBar>
				{errorMessage && (
					<div className="Error">
						<em>{errorMessage}</em>
					</div>
				)}
				{services.length === 0 &&
					!errorMessage && (
						<div className="Error">
							<em>{t("No services found")}</em>
						</div>
					)}

				{sortedAvailableServices.length > 0 && (
					<div className="ServiceListContainer">
						<ul className="Items">
							<li
								className="Item service-map"
								onClick={showMap}
								style={{
									flexBasis: "100%",
								}}
							>
								<div className="Icon">
									<i className="fa fa-map" />
								</div>
								<div
									className="Info"
									style={{
										alignSelf: "center",
									}}
								>
									<h1>{t("Service Map")}</h1>
								</div>
								<i className="material-icons" />
							</li>
							{sortedAvailableServices.map(this.renderService.bind(this))}
						</ul>
					</div>
				)}


				{unavailableServices.length > 0 && (
					<div className="ServiceListContainer Unavailable">
						<ul className="Items">
							<li
								style={{
									flexBasis: "100%",
								}}
							>
							<h1>Currently unavailable:</h1>
							</li>
							{unavailableServices.map(this.renderService.bind(this))}
						</ul>
					</div>
				)}
			</div>
		);
	}
}
export default translate()(ServiceList);