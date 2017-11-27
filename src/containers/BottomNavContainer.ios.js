import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, Dimensions } from "react-native";
import { BottomNavigation, ThemeProvider } from "react-native-material-ui";
import { connect } from "react-redux";

const window = Dimensions.get("window");

class BottomNavContainer extends Component {
	static propTypes = {};
	state = {
		active: "home",
	};

	render() {
		const { t, match } = this.props;
		const { country, onGoToCategories, onGoHome, onGoToSearch, showServiceMap, onGoToServices, router } = this.props;
		let selectedIndex = 0;
		console.log(router, match);
		let pathParts = ["", ""]; //router.location.pathname.split("/");

		let active = "home";
		if (pathParts.length > 2) {
			if (pathParts[2] === "services") {
				active = "services-list";
			} else {
				active = "categories";
			}
		}

		return (
			<View style={{ position: "absolute", bottom: 0, width: window.width }}>
				<ThemeProvider
					uiTheme={{
						bottomNavigationAction: {
							iconActive: {
								color: "#ffda1a",
							},
							labelActive: {
								color: "#000",
								fontWeight: "bold",
							},
						},
					}}
				>
					<BottomNavigation active={active} hidden={false}>
						<BottomNavigation.Action key="home" icon="home" label={t("Home")} onPress={() => this.setState({ active: "home" })} />
						<BottomNavigation.Action key="categories" icon="assignment" label={t("Categories")} onPress={() => this.setState({ active: "categories" })} />
						<BottomNavigation.Action key="services-list" icon="list" label={t("Service List")} onPress={() => this.setState({ active: "services-list" })} />
					</BottomNavigation>
				</ThemeProvider>
			</View>
		);
	}
}

const mapState = ({ category, country, showServiceMap, router }, p) => {
	return {
		category,
		country,
		showServiceMap,
		router,
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
