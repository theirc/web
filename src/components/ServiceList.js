import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";
import HeaderBar from "./HeaderBar";

var tinycolor = require("tinycolor2");

class ServiceList extends React.Component {
	state = {
		category: {},
		services: [],
		loaded: false,
		errorMessage: null,
	};
	componentDidMount() {
		const { servicesByType } = this.props;
		if (servicesByType) {
			servicesByType()
				.then(({ services, category }) => this.setState({ services, category, loaded: true }))
				.catch(c => this.setState({ errorMessage: c.message, category: null, loaded: true }));
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
		return [
			<li key={s.id} className="Item" onClick={() => goToService(s.id)}>
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
						{s.provider.name}{" "}
						<small>
							{fullAddress}
							{distance && ` - ${distance}`}
						</small>
					</h2>
				</div>
				<i className="material-icons" />
			</li>,
		];
	}
	render() {
		const { services, category, loaded, errorMessage } = this.state;
		const { t, locationEnabled, toggleLocation, nearby, showMap } = this.props;

		if (!loaded) {
			return (
				<div className="ServiceList">
					<HeaderBar title={nearby ? t("Nearby Services") : t("Services")}>
						{!nearby &&
							navigator.geolocation && (
								<li onClick={toggleLocation || _.identity}>
									<h1>{t("Order results by distance to me")}</h1>
									{!locationEnabled && <i className="MenuIcon material-icons">radio_button_unchecked</i>}
									{locationEnabled && <i className="MenuIcon material-icons">radio_button_checked</i>}
								</li>
							)}
					</HeaderBar>
					<div className="loader" />
				</div>
			);
		}

		return (
			<div className="ServiceList">
				<HeaderBar subtitle={category && `${category.name}:`} title={nearby ? t("Nearby Services") : t("Services")}>
					{!nearby &&
						navigator.geolocation && (
							<li onClick={toggleLocation || _.identity}>
								<h1>{t("Order results by distance to me")}</h1>
								{!locationEnabled && <i className="MenuIcon material-icons">radio_button_unchecked</i>}
								{locationEnabled && <i className="MenuIcon material-icons">radio_button_checked</i>}
							</li>
						)}
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

				{services.length > 0 && (
					<div className="ServiceListContainer">
						<ul className="Items">
							<li
								className="Item"
								onClick={showMap}
								style={{
									flexBasis: "100%",
								}}
							>
								<div className="Icons">
									<div className="Icon">
										<i className="fa fa-map" />
									</div>
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
							{services.map(this.renderService.bind(this))}
						</ul>
					</div>
				)}
			</div>
		);
	}
}
export default translate()(ServiceList);
