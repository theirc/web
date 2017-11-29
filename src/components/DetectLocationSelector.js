import React, { Component } from "react";
//import PropTypes from 'prop-types';
import { translate } from "react-i18next";

import "./DetectLocationSelector.css";

class DetectLocationSelector extends Component {
	static propTypes = {};
	state = {
		active: false,
	};

	render() {
		const { onBackToList, onLocationFound, onLocationError, t } = this.props;
		const { active } = this.state;

		return (
			<div className="DetectLocationSelector">
				<div className="spacer" />

				<div className="text">
					<i className="material-icons">my_location</i>
					<h2>
						{t(
							"In order to detect your location, we need to request permission to do so on your device. If you would like to use GPS to find your information tap OK, if not tap Back to List"
						)}
					</h2>
				</div>
				<div className="spacer" />
				<button
					className="item "
					onClick={() => {
						this.setState({ active: true });
						const self = this;
						let time = null;

						let locationFound = l => {
							if (time) clearTimeout(time);

							self.setState({ active: false });
							if (onLocationFound) onLocationFound(l);
						};

						let errorOut = () => {
							alert(t("We cannot determine your location. Please select a location from the list"));
							if (onBackToList) onBackToList();
						};

						let locationError = l => {
							if (time) clearTimeout(time);

							self.setState({ active: false });
							if (onLocationError) onLocationError(l);

							errorOut();
						};
						const noop = () => console.log("noop");

						navigator.geolocation.getCurrentPosition(l => locationFound(l), () => locationError());

						time = setTimeout(() => {
							locationFound = noop;
							locationError = noop;

							self.setState({ active: false });

							if (onLocationError) onLocationError();
							errorOut();
						}, 30 * 1e3);
					}}
				>
					{t("OK")}
				</button>
				<button className="item " onClick={() => onBackToList && onBackToList()}>
					{t("Back to List")}
				</button>
				<div className="bottom" />
				<div className={["overlay", active ? "active" : ""].join(" ")}>
					<h1>{t("Loading location")}</h1>
				</div>
			</div>
		);
	}
}
export default translate()(DetectLocationSelector);
