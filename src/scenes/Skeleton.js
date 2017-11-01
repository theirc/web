import React from "react";
import { actions } from "../store";
import { connect } from "react-redux";
import { AppHeader, Footer } from "../components";
import { BottomNavContainer } from "../containers";
import { push } from "react-router-redux";
import cms from "../content/cms";

import { Helmet } from "react-helmet";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // initialized i18next instance

import "./Skeleton.css";

class Skeleton extends React.Component {
	componentDidMount() {
		if (global.window) {
			if (global.window && global.window.document) {
				const document = global.window.document;
				var intro = document.querySelector(".intro");
				var root = document.querySelector("#root");

				intro.remove();
				root.className = "";
			}
		}
	}

	render() {
		const { children, country, language, match, onGoHome, onGoToSearch, onChangeLocation, onChangeLanguage, deviceType } = this.props;

		return (
			<I18nextProvider i18n={i18n}>
				<div className="Skeleton">
					<Helmet>
						<title>{cms.siteConfig.title}</title>
						<link rel="shortcut icon" href={cms.siteConfig.favicon} />
					</Helmet>
					<AppHeader country={country} language={language} onGoHome={onGoHome(country)} onGoToSearch={onGoToSearch(country)} onChangeCountry={onChangeLocation} logo={cms.siteConfig.logo} />
					{children}
					{country &&
						language && (
							<Footer
								questionLink={cms.siteConfig.questionLink}
								disableCountrySelector={!!cms.siteConfig.disableCountrySelector}
								onChangeLocation={onChangeLocation}
								onChangeLanguage={onChangeLanguage}
								deviceType={deviceType}
							/>
						)}
					{country && language && <BottomNavContainer match={match} />}
				</div>
			</I18nextProvider>
		);
	}
}

const mapState = ({ country, language, deviceType }, p) => {
	return {
		country,
		language,
		deviceType,
	};
};
const mapDispatch = (d, p) => {
	return {
		onGoHome: country => () => {
			if (country) d(push(`/${country.fields.slug || ""}`));
		},
		onGoToSearch: country => () => {
			if (country) d(push(`/${country.slug}/search`));
		},
		onChangeLocation: () => {
			d(actions.changeCountry(null));
			d(push(`/country-selector`));
		},
		onChangeLanguage: () => {
			d(actions.changeLanguage(null));
			d(push(`/language-selector`));
		},
	};
};

export default connect(mapState, mapDispatch)(Skeleton);
