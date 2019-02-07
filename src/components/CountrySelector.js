import React, {
    Component
} from "react";
//import PropTypes from 'prop-types';
import {
    translate
} from "react-i18next";
import "./CountrySelector.css";

import getSessionStorage from "../shared/sessionStorage";
import PropTypes from "prop-types";

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

	static contextTypes = {
		config: PropTypes.object,
	};

    render() {
        const {
            onGoTo,
            t,
            language,
            backToLanguage
		} = this.props;
		const { config } = this.context;
        let countryList = this.props.countryList.map(_.identity);
        let regionList = this.props.regionList.filter(r => r.languages_available.split(',').map(a => a.trim()).indexOf(language) > -1).map(r => r.slug);
        let availableCountryList = countryList.filter(c => regionList.indexOf(c.fields.slug) > -1 &&  config.hideCountries.indexOf(c.fields.slug) === -1);
        let unavailableCountryList = countryList.filter(c => regionList.indexOf(c.fields.slug) === -1);
        if(language == "ti" || language == "fr"){
        availableCountryList = availableCountryList.filter(c => c.name.indexOf("Ital")!=0);
        }

        if (global.navigator && navigator.geolocation) {
            countryList.push({
                id: "detect-me",
                fields: {
                    slug: "detect-me",
                    name: t("Detect My Location"),
                },
            });
        }
        function clickk(name){
            sessionStorage.setItem('countryy',name);
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
                            clickk(c.fields.name);
							onGoTo(c.fields.slug);
<<<<<<< Updated upstream
						}}
					>
						{c.fields.name}
=======
                        }}
					>
                        {c.fields.name}
>>>>>>> Stashed changes
					</button>
				))}
				{unavailableCountryList.length > 0 && (
					<div className="other">
						<h1>{t("Countries with information in other languages")}</h1>
					</div>
					)}
					{unavailableCountryList.map((c, i) => (
					<button
						disabled={true}
						className="item "
						key={c.id}
						onClick={() => {
							onGoTo(c.fields.slug);
						}}
					>
						{c.fields.name}
					</button>
				))}
					{unavailableCountryList.length > 0 && (<button
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
