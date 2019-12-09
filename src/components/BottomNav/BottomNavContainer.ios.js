import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, Dimensions } from "react-native";
import { BottomNavigation, ThemeProvider } from "react-native-material-ui";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import PropTypes from "prop-types";

const window = Dimensions.get("window");

class BottomNavContainer extends Component {
	static propTypes = {};
	state = {
		active: "home",
	};
	static contextTypes = {
		theme: PropTypes.object,
		flexDirection: PropTypes.object,
	};

	changeState(dest) {
		const { active } = this.state;
		const { onGoToCategories, onGoHome, country } = this.props;
		this.setState({ active: dest });

		switch (dest) {
			case "home":
				onGoHome(country.fields.slug);
				break;
			case "categories":
				onGoToCategories(country.fields.slug);
				break;
			default:
				break;
		}
	}

	render() {
		const { t, match } = this.props;
		const { flexDirection, theme } = this.context;
		const { country, onGoToCategories, onGoHome, onGoToSearch, showServiceMap, onGoToServices, router, direction } = this.props;
		let selectedIndex = 0;

		let pathParts = router.location.pathname.split("/");

		let { active } = this.state;
		if (pathParts.length > 2) {
			if (pathParts[2] === "services") {
				active = "services-list";
			} else {
				active = "categories";
			}
		}

		return (
			<View style={{ alignSelf: "flex-end", width: window.width }}>
				<ThemeProvider
					uiTheme={{
						bottomNavigationAction: {
							iconActive: {
								color: theme.color,
								fontFamily: direction === "ltr" ? "Roboto" : "Cairo",
							},
							labelActive: {
								color: "#000",
								fontWeight: "bold",
								fontFamily: direction === "ltr" ? "Roboto" : "Cairo",
							},
							label: {
								fontFamily: direction === "ltr" ? "Roboto" : "Cairo",
							},
						},
					}}
				>
					<BottomNavigation
						active={active}
						hidden={false}
						style={{
							container: {
								justifyContent: "center",
								...flexDirection.row,
							},
						}}
					>
						<BottomNavigation.Action key="home" icon="home" label={t("Home")} onPress={() => this.changeState("home")} />
						<BottomNavigation.Action key="categories" icon="assignment" label={t("Categories")} onPress={() => this.changeState("categories")} />
						{/*<BottomNavigation.Action key="services-list" icon="list" label={t("Service List")} onPress={() => this.setState({ active: "services-list" })} />*/}
					</BottomNavigation>
				</ThemeProvider>
			</View>
		);
	}
}

const mapState = ({ category, country, direction, showServiceMap, router }, p) => {
	return {
		category,
		country,
		showServiceMap,
		router,
		direction,
	};
};
const mapDispatch = (d, p) => {
	return {
		onGoToCategories: country => {
			d(push(`/${country}/categories`));
		},
		onGoHome: country => {
			d(push(`/${country}`));
		},
		onGoToSearch: country => {
			d(push(`/${country}/search`));
		},
		onGoToServices: country => {
			d(push(`/${country}/services`));
		},
	};
};

export default connect(mapState, mapDispatch)(translate()(BottomNavContainer));
