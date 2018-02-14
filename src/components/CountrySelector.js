import React, { Component } from "react";
//import PropTypes from 'prop-types';
import { translate } from "react-i18next";
import "./CountrySelector.css";

import getSessionStorage from "../shared/sessionStorage";

import _ from "lodash";

class CountrySelector extends Component {
	static propTypes = {};

	componentDidMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			delete sessionStorage.country;
			delete sessionStorage.dismissedNotifications;
		}
	}

	render() {
		const { onGoTo, t } = this.props;
		let countryList = this.props.countryList.map(_.identity);

		if (global.navigator && navigator.geolocation) {
			countryList.push({
				id: "detect-me",
				fields: {
					slug: "detect-me",
					name: t("Detect My Location"),
				},
			});
		}

		return (
			<div className="CountrySelector">
				<div className="text">
					<i className="material-icons">my_location</i>
					<h1>{t("Where are you now?")}</h1>
				</div>
				{countryList.map((c, i) => (
					<button
						className="item "
						key={c.id}
						onClick={() => {
							onGoTo(c.fields.slug);
						}}
					>
						{c.fields.name}
					</button>
				))}{" "}
				<div className="spacer" />
			</div>
		);
	}
}
export default translate()(CountrySelector);
