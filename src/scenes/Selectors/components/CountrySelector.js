// libs
import React, { Component } from "react";
import { translate } from "react-i18next";
import _ from "lodash";

// local
import getSessionStorage from "../../../shared/sessionStorage";
import instance from '../../../backend/settings';
import "./CountrySelector.css";

const NS = { ns: 'Selectors' };

class CountrySelector extends Component {

	componentDidMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			delete sessionStorage.country;
			delete sessionStorage.dismissedNotifications;
		}
	}

	filterCountry(countryList, currentLang) {
		return countryList.filter(l => instance.countries[l.slug] && instance.countries[l.slug].languages.includes(currentLang));
	}

	render() {
		const {
			onGoTo,
			t,
			language,
			backToLanguage
		} = this.props;
		let disableLanguageSelector = instance.switches.disableLanguageSelector;
		let countryList = this.props.countryList.map(_.identity);
		let regionList = this.props.regionList.filter(r => r.languages_available.split(',').map(a => a.trim()).indexOf(language) > -1).map(r => r.slug);
		let availableCountryList = countryList.filter(c => regionList.indexOf(c.fields.slug) > -1 && instance.countries[c.fields.slug]);

		// SP-354 disable tigrinya and french from italy
		availableCountryList = this.filterCountry(availableCountryList, language);

		if (global.navigator && navigator.geolocation) {
			countryList.push({
				id: "detect-me",
				fields: {
					slug: "detect-me",
					name: t("country.Detect My Location", NS),
				},
			});
		}

		return (
			<div className="CountrySelector">
				<div className="text">
					<i className="material-icons">my_location</i>
					<h1>{t("country.Where are you now?", NS)}</h1>
				</div>

				{availableCountryList.map((c, i) => (
					<button
						className="item "
						key={c.id}
						onClick={() => {
							onGoTo(c.fields.slug);
						}}
					>
						{c.fields.name}
					</button>
				))
				}

				{!disableLanguageSelector && availableCountryList.length > 0 && (
				<span className="item-language" onClick={() => backToLanguage()}>
					{t("country.Choose a different language", NS)}
				</span>)
				}
			</div>
		);
	}
}
export default translate()(CountrySelector);
