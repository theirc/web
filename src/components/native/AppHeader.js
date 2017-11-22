import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, StyleSheet, Image } from "react-native";
class AppHeader extends Component {
	static propTypes = {};

	render() {
		const { logo } = this.props;
		return (
			<View style={styles.header}>
				<View style={{ flex: 1 }}>
					<Image
						source={{ uri: `https://beta.refugee.info${logo}` }}
						style={{
							height: 40,
							width: 150,
							backgroundColor: "#000000",
						}}
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={{ color: "#fff" }}>App Header</Text>
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
