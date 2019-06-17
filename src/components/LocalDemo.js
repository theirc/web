import React, { Component } from "react";
import { translate } from "react-i18next";
import { Helmet } from "react-helmet";
import HeaderBar from "./HeaderBar";

import "./LanguageSelector.css";
import getSessionStorage from "../shared/sessionStorage";

class LocalDemo extends Component {
	static propTypes = {};

	componentDidMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();
			delete sessionStorage.country;
			delete sessionStorage.dismissedNotifications;
		}
	}
    
	render() {
        const { language, country, t } = this.props;
        const startCache = () =>{
            console.log("Start");
        }
        console.log(country);
		return (
			<div className="LocalDemo">
                <Helmet>
					<title>{t('Download data for offline use')}</title>
				</Helmet>
                <HeaderBar title={t('Download data for offline use')} />

                <span>{country.fields.name}</span>
                <span>{language}</span>
                <button onClick={startCache}>{t('Download site')}</button>
			</div>
		);
	}
}

export default translate()(LocalDemo);
