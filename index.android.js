/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View } from "react-native";
import cms from "./src/content/cms";

export default class Signpost extends Component {
	state = {
		countries: null,
	};

	componentWillMount() {
		cms.client
			.getEntries({ content_type: "country" })
			.then(c => this.setState({ countries: c }));
	}

	render() {
		if (this.state.countries) {
			return (
				<View style={styles.container}>
					<Text style={styles.welcome}>IT WORKS!</Text>
					{this.state.countries.items.map(c => (
						<Text key={c.sys.id} style={styles.instructions}>
							{c.fields.name}
						</Text>
					))}
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>Welcome to React Native!</Text>
				<Text style={styles.instructions}>
					To get started, edit index.android.js
				</Text>
				<Text style={styles.instructions}>
					Double tap R on your keyboard to reload,{"\n"}
					Shake or press menu button for dev menu
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F5FCFF",
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
