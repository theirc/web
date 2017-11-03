import React from "react";
import { actions } from "../store";
import { connect } from "react-redux";
import { AppHeader, Footer, WarningDialog } from "../components";
import { BottomNavContainer } from "../containers";
import { push } from "react-router-redux";
import cms from "../content/cms";
import moment from "moment";

import { Helmet } from "react-helmet";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // initialized i18next instance

import "./Skeleton.css";

class Skeleton extends React.Component {
	componentDidMount() {
		const { language } = this.props;
		i18n.changeLanguage(language);
	}
	componentWillUpdate(newProps) {
		const { language } = this.props;
		if (language !== newProps.language) {
			i18n.changeLanguage(newProps.language);
		}
	}
	render() {
		const { children, country, language, match, onGoHome, onGoToSearch, onChangeLocation, onChangeLanguage, deviceType, router } = this.props;

		let notifications = [];
		const notificationType = n => {
			switch (n.fields.type) {
				case "Warning":
					return "red";
				case "Announcement":
					return "green";
				default:
					return "yellow";
			}
		};
		if (country && language) {
			const { sessionStorage } = global.window;
			const dismissed = JSON.parse(sessionStorage.dismissedNotifications || "[]");

			const notificationFilter = n => {
				return (!n.fields.expirationDate || moment(n.fields.expirationDate).unix() > moment().unix()) && dismissed.indexOf(n.sys.id) === -1;
			};

			const hideNotification = n => {
				dismissed.push(n.sys.id);
				sessionStorage.dismissedNotifications = JSON.stringify(dismissed);
			};

			notifications = (country.fields.notifications || []).filter(notificationFilter).map(n => (
				<WarningDialog type={notificationType(n)} key={n.sys.id} onHide={() => hideNotification(n)} autoDismiss={n.fields.autoDismiss} dismissable={n.fields.dismissable}>
					{n.fields.content}
				</WarningDialog>
			));
		}

		return (
			<I18nextProvider i18n={i18n}>
				<div className="Skeleton">
					<Helmet>
						<title>{cms.siteConfig.title}</title>
						<link rel="shortcut icon" href={cms.siteConfig.favicon} />
					</Helmet>
					<AppHeader country={country} language={language} onGoHome={onGoHome(country)} onGoToSearch={onGoToSearch(country)} onChangeCountry={onChangeLocation} logo={cms.siteConfig.logo} />
					{notifications}
					{children}
					{country &&
						language && (
							<Footer
								questionLink={cms.siteConfig.questionLink}
								disableCountrySelector={!!cms.siteConfig.disableCountrySelector}
								onChangeLocation={onChangeLocation}
								onChangeLanguage={onChangeLanguage.bind(this, router.location.pathname)}
								deviceType={deviceType}
							/>
						)}
					{country && language && <BottomNavContainer match={match} />}
				</div>
			</I18nextProvider>
		);
	}
}

const mapState = ({ country, language, deviceType, router }, p) => {
	return {
		country,
		language,
		deviceType,
		router,
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
		onChangeLanguage: redirect => {
			if (global && global.sessionStorage) {
				global.sessionStorage.redirect = redirect;
			}
			d(actions.changeLanguage(null));
			d(push(`/language-selector`));
		},
	};
};

export default connect(mapState, mapDispatch)(Skeleton);
