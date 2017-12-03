/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View, Dimensions } from "react-native";
import { Skeleton } from "./src/scenes";
import { store } from "./src/store";
import App from "./src/App";
import { Provider } from "react-redux";
import PropTypes from "prop-types";
import nativeColors from "./src/shared/nativeColors";

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
		paddingTop: 16,
		width: window.width,
		height: window.height,
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
