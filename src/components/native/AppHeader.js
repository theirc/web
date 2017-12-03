import React, { Component } from "react";
import { View, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import Text from "./Text";
import { translate } from "react-i18next";
import HdrStyles from "./AppHeaderStyles";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/MaterialIcons";

class AppHeader extends Component {
	static propTypes = {};
	static contextTypes = {
		theme: PropTypes.object,
	};

	render() {
		const { logo, country } = this.props;
		const { theme } = this.context;
		return (
			<View style={HdrStyles.header}>
				<View style={[{ flex: 1, alignItems: "center" }, !country && { flexBasis: "100%" }]}>
					<Image style={HdrStyles.LogoImg} source={{ uri: `https://beta.refugee.info${logo}` }} />
				</View>
				{country && (
					<View style={HdrStyles.countrySwitcherContainer}>
						<TouchableOpacity
							style={{
								flex: 1,
								flexGrow: 1,
							}}
						>
							<Text
								style={{
									color: "#fff",
									textAlign: "center",
									fontWeight: "500",
								}}
							>
								{(country.fields.name || "").toUpperCase()}
							</Text>
						</TouchableOpacity>
						<View
							style={{
								borderColor: theme.color,
								borderLeftWidth: 1,
								height: 30,
								paddingHorizontal: 5,
							}}
						/>
						<TouchableOpacity
							style={{
								width: 45,
								alignItems: "center",
							}}
						>
							<Icon style={{}} name="search" size={26} color="#ffffff" />
						</TouchableOpacity>
					</View>
				)}
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
