import React, { Component } from "react";
//import PropTypes from 'prop-types';
import { translate } from "react-i18next";

import "./CountrySelector.css";
import getSessionStorage from "../shared/sessionStorage";

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
		const { countryList, onGoTo, t } = this.props;

		return (
			<div className="CountrySelector">
				<div className="spacer" />

				<div className="text">
					<i className="material-icons">my_location</i>
					<h1>{t("Where are you now?")}</h1>
				</div>
				<div className="spacer" />
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
				))}
				<div className="bottom" />
			</div>
		);
	}
}
export default translate()(CountrySelector);
