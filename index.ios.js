// libs
import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View, Dimensions } from "react-native";
import { store } from "./src/shared/store";
import App from "./src/App";
import { Provider } from "react-redux";
import PropTypes from "prop-types";

// local
import nativeColors from "./src/shared/nativeColors";
import nativeDimensions from "./src/shared/nativeDimensions";

const window = Dimensions.get("window");
const conf = require("./src/content/config");
const cms = require("./src/content/cms").default;
const servicesApi = require("./src/content/servicesApi");
const cmsApi = require("./src/content/cmsApi").default;
const appConfig = require("./config.app.json");

export default class Signpost extends Component {
	state = {
		countries: [],
	};

	static childContextTypes = {
		config: PropTypes.object,
		api: PropTypes.object,
		theme: PropTypes.object,
	};

	getChildContext() {
		let config = conf[appConfig.app.url];
		config = Object.assign(config, appConfig);
		let api = cmsApi(config, {});
		const theme = nativeColors.themes[config.theme];

		return {
			config,
			api,
			theme,
		};
	}

	componentDidMount() {}
	render() {
		return (
			<View style={styles.container}>
				<Provider store={store}>
					<App />
				</Provider>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#000",
		paddingTop: nativeDimensions.statusBar,
		width: window.width,
		height: nativeDimensions.baseHeight,
	},
	welcome: {
		fontSize: 20,
		textAlign: "center",
		margin: 10,
	},
	instructions: {
		textAlign: "center",
		color: "#333333",
		marginBottom: 5,
	},
});

AppRegistry.registerComponent("Signpost", () => Signpost);
