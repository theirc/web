import React from "react";
import { actions } from "../store";
import _ from "lodash";
import { connect } from "react-redux";
import { AppHeader, Footer, WarningDialog } from "../components";
import { BottomNavContainer } from "../containers";
import { push } from "react-router-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";
import PropTypes from "prop-types";

import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // initialized i18next instance

import "./Skeleton.css";
import getSessionStorage from "../shared/sessionStorage";

class Skeleton extends React.Component {
	state = {
		errorMessage: null,
	};

	static contextTypes = {
		config: PropTypes.object,
		api: PropTypes.object,
	};

	componentDidMount() {
		const { language, errorMessage } = this.props;
		i18n.changeLanguage(language);

		if (errorMessage) {
			this.setState({ errorMessage });
			setTimeout(() => {
				this.setState({ errorMessage: null });
			}, 20 * 1000);
		}
	}
	componentWillUpdate(newProps) {
		const { language, errorMessage } = this.props;
		if (language !== newProps.language) {
			i18n.changeLanguage(newProps.language);
		}

		if (newProps.errorMessage && errorMessage !== newProps.errorMessage) {
			this.setState({ errorMessage: newProps.errorMessage });
			setTimeout(() => {
				this.setState({ errorMessage: null });
			}, 20 * 1000);
		}
	}
	render() {
		const { children, country, language, match, onGoHome, onGoToSearch, onChangeLocation, onChangeLanguage, deviceType, router, hideFooter, removeErrorMessage } = this.props;
		const { errorMessage } = this.state;
		const { config } = this.context;

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
			const sessionStorage = getSessionStorage();
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
		if (errorMessage) {
			let error = (
				<WarningDialog type={"red"} key={"Error"} onHide={() => removeErrorMessage()} autoDismiss={true} dismissable={true}>
					{errorMessage}
				</WarningDialog>
			);
			notifications = [error].concat(notifications);
		}

		let showFooter = !hideFooter && country && language;
		let logo = _.template(config.logo)({ language: language || "en" });

		return (
			<I18nextProvider i18n={i18n}>
				<div className="Skeleton">
					<AppHeader
						disableCountrySelector={!!config.disableCountrySelector}
						disableLanguageSelector={!!config.disableLanguageSelector}
						country={country}
						language={language}
						onGoHome={onGoHome(country)}
						onGoToSearch={q => onGoToSearch(country, q)}
						onChangeCountry={onChangeLocation}
						onChangeLanguage={onChangeLanguage.bind(this, router.location.pathname)}
						logo={logo}
					/>
					{notifications}
					{children}
					{showFooter && (
						<Footer
							questionLink={config.questionLink}
							disableCountrySelector={!!config.disableCountrySelector}
							disableLanguageSelector={!!config.disableLanguageSelector}
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

const mapState = ({ country, language, deviceType, router, errorMessage }, p) => {
	return {
		country,
		language,
		deviceType,
		router,
		errorMessage,
	};
};
const mapDispatch = (d, p) => {
	return {
		onGoHome: country => () => {
			if (country) d(push(`/${country.fields.slug || ""}`));
		},
		onGoToSearch: (country, query) => {
			if (country) d(push(`/${country.fields.slug}/search?q=${query}`));
		},
		onChangeLocation: () => {
			d(actions.changeCountry(null));
			d(push(`/selectors`));
		},
		onChangeLanguage: redirect => {
			const sessionStorage = getSessionStorage();
			if (sessionStorage) {
				sessionStorage.redirect = redirect;
			}
			d(actions.changeLanguage(null));
			d(push(`/selectors`));
		},
		removeErrorMessage() {
			d(actions.showErrorMessage(null));
		},
	};
};

export default withRouter(connect(mapState, mapDispatch)(Skeleton));
