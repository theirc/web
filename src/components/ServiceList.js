import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";

var tinycolor = require("tinycolor2");

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
						{s.provider.name}{" "}
						<small>
							{s.region.title}
							{distance && ` - ${distance} Km`}
						</small>
					</h2>
				</div>
				<i className="material-icons" />
			</div>,
		];
	}
	render() {
		const { services, category, loaded } = this.state;
		const { t, locationEnabled, toggleLocation } = this.props;

		if (!loaded) {
			return (
				<div className="ServiceList">
					<div className="Title">
						<h1>{t("Services")}</h1>
					</div>
					<div className="Spacer" />
				</div>
			);
		}

		return (
			<div className="ServiceList">
				<div className="Title">
					<h1>
						{category && <small>{category.name}:</small>}
						{t("Services")}
					</h1>
				</div>
				<div className="Items">{services.map(this.renderService.bind(this))}</div>
				<div className="footer">
					{navigator.geolocation && (
						<div className="Selector" onClick={toggleLocation || _.identity}>
							<h1>{t("Order results by distance to me")}</h1>
							{!locationEnabled && <i className="MenuIcon material-icons">radio_button_unchecked</i>}
							{locationEnabled && <i className="MenuIcon material-icons">radio_button_checked</i>}
						</div>
					)}
				</div>
			</div>
		);
	}
}
export default translate()(ServiceList);
