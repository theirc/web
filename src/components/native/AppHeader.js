import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import HdrStyles from "./AppHeaderStyles";
class AppHeader extends Component {
	static propTypes = {};

	render() {
		const { logo } = this.props;
		return (
			<View style={HdrStyles.header}>
				<View style={{ flex: 1 }}>
					<Image
						style={HdrStyles.LogoImg}
						source={{ uri: `https://beta.refugee.info${logo}` }}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={{ color: "#fff" }}></Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: "#000000",
		height: 65,
        flexDirection: "row",
        paddingTop: 5,
        paddingHorizontal: 16,
	},
});

export default translate()(AppHeader);
