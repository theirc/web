import React from "react";
import { actions, history } from "../store";
import _ from "lodash";
import { connect } from "react-redux";
import { AppHeader, Footer, WarningDialog, HomeWidget } from "../components";
import { BottomNavContainer } from "../containers";
import { push, goBack } from "react-router-redux";
import moment from "moment";
import { AppRegistry, StyleSheet, StatusBar, View, ScrollView, Dimensions, BackHandler } from "react-native";
import PropTypes from "prop-types";

import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // initialized i18next instance
import getSessionStorage from "../shared/sessionStorage";
import window from "../shared/nativeDimensions";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import getDirection from "../shared/getDirection";

const deviceDirection = getDirection(_.first(DeviceInfo.getDeviceLocale().split("-")));

class Skeleton extends React.Component {
	state = {
		errorMessage: null,
	};

	static contextTypes = {
		config: PropTypes.object,
		api: PropTypes.object,
	};

	static childContextTypes = {
		direction: PropTypes.string,
		textAlign: PropTypes.string,
		flexDirection: PropTypes.object,
	};

	getChildContext() {
		const { direction } = this.props;
		let flexDirection = {};
		let textAlign = "";
		if (Platform.OS === "android") {
			/**
			 * Android does not respect the "Direction" style
			 * This mess down here does the following.
			 * 1. If device is set to a LTR language, it will reverse the flex and text alignments when users change to an RTL language
			 * 2. If device is set up to an RTL language, it will reverse the flex and text alignments when users change to an LTR language
			 */
			if (direction === "ltr") {
				flexDirection = {
					row: { flexDirection: deviceDirection === "rtl" ? "row-reverse" : "row" },
					column: { flexDirection: deviceDirection === "rtl" ? "column-reverse" : "column" },
				};
				textAlign = deviceDirection === "rtl" ? "right" : "left";
			} else {
				flexDirection = {
					row: { flexDirection: deviceDirection === "ltr" ? "row-reverse" : "row" },
					column: { flexDirection: deviceDirection === "ltr" ? "column-reverse" : "column" },
				};

				textAlign = deviceDirection === "ltr" ? "right" : "left";
			}
		} else if (Platform.OS === "ios") {
			/**
			 * Apple just works
			 */
			flexDirection = {
				row: { flexDirection: "row" },
				column: { flexDirection: "column" },
			};

			textAlign = "left";
		}
		return {
			direction,
			flexDirection,
			textAlign,
		};
	}

	componentDidMount() {
		const { language, errorMessage } = this.props;
		i18n.changeLanguage(language);

		if (errorMessage) {
			this.setState({ errorMessage });
			setTimeout(() => {
				this.setState({ errorMessage: null });
			}, 20 * 1000);
		}

		BackHandler.addEventListener("hardwareBackPress", this.hardwareBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener("hardwareBackPress", this.hardwareBackPress);
	}

	hardwareBackPress = (() => {
		const { onGoBack } = this.props;
		if (onGoBack) {
			onGoBack();
		}
		if (history.index > 0) return true;
		else return false;
	}).bind(this);

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
		const sessionStorage = getSessionStorage();
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
				<View
					style={{
						backgroundColor: "#fff",
						height: "100%",
						paddingBottom: window.softMenuBar / 2,
						display: "flex",
					}}
				>
					<StatusBar backgroundColor="#000" barStyle="light-content" />
					<AppHeader country={country} language={language} onGoHome={onGoHome(country)} onGoToSearch={q => onGoToSearch(country, q)} onChangeCountry={onChangeLocation} logo={logo} />
					{notifications}
					<HomeWidget
						questionLink={config.questionLink}
						disableCountrySelector={!!config.disableCountrySelector}
						onChangeLocation={onChangeLocation}
						onChangeLanguage={onChangeLanguage}
						deviceType={deviceType}
					/>
					<ScrollView
						style={{
							display: "flex",
							flex: 1,
							minHeight: !showFooter ? window.usableHeight : 0,
							backgroundColor: "#000000",
						}}
					>
						{children}

						{showFooter && (
							<Footer
								questionLink={config.questionLink}
								disableCountrySelector={!!config.disableCountrySelector}
								disableLanguageSelector={!!config.disableLanguageSelector}
								onChangeLocation={onChangeLocation}
								onChangeLanguage={onChangeLanguage}
								deviceType={deviceType}
							/>
						)}
					</ScrollView>
					{country && language && <BottomNavContainer match={match} />}
				</View>
			</I18nextProvider>
		);
	}
}

const mapState = ({ country, direction, language, deviceType, router, errorMessage }, p) => {
	return {
		country,
		language,
		deviceType,
		router,
		errorMessage,
		direction,
	};
};
const mapDispatch = (d, p) => {
	return {
		onGoBack: () => {
			d(goBack());
		},
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

export default connect(mapState, mapDispatch)(Skeleton);
