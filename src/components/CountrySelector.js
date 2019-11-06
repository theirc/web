// libs
import React, { Component } from "react";
import { translate } from "react-i18next";
import PropTypes from "prop-types";
import _ from "lodash";

// local
import getSessionStorage from "../shared/sessionStorage";
import "./CountrySelector.css";

class CountrySelector extends Component {
    static propTypes = {};

    componentDidMount() {
        if (global.window) {
            const sessionStorage = getSessionStorage();
            delete sessionStorage.country;
            delete sessionStorage.dismissedNotifications;
        }
	}

	static contextTypes = {
		config: PropTypes.object,
	};

	filterCountry(config, countryList, currentLang) {
		for(let i = 0; i < config.hideLangsPerCountry.length; i++) {
			if(config.hideLangsPerCountry[i].langs.indexOf(currentLang) >= 0) {
				return countryList.filter(l => l.slug !== config.hideLangsPerCountry[i].country);
			}
		}
		return countryList;
	}

    render() {
        const {
            onGoTo,
            t,
            language,
            backToLanguage
		} = this.props;
		const { config } = this.context;
		let disableLanguageSelector = config.disableLanguageSelector;
		let countryList = this.props.countryList.map(_.identity);
		let regionList = this.props.regionList.filter(r => r.languages_available.split(',').map(a => a.trim()).indexOf(language) > -1).map(r => r.slug);
		let availableCountryList = countryList.filter(c => regionList.indexOf(c.fields.slug) > -1 &&  config.hideCountries.indexOf(c.fields.slug) === -1);
		let unavailableCountryList = countryList.filter(c => regionList.indexOf(c.fields.slug) === -1);
		
		// SP-354 disable tigrinya and french from italy
        availableCountryList = this.filterCountry(config, availableCountryList, language);

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
				))}
					{!disableLanguageSelector && unavailableCountryList.length > 0 && (<button
						className="item "
						onClick={() => {
							backToLanguage();
						}}
					>{t("Choose your language")}
					</button>)}
				<div className="spacer" />
			</div>
        );
    }
}
export default translate()(CountrySelector);
