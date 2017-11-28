import React, { Component } from "react";
import { translate } from "react-i18next";
import PropTypes from "prop-types";
import { View, Text, Button, StyleSheet, Image } from "react-native";

const generateKey = pre => {
	return `${pre}_${new Date().getTime()}`;
};

class HeaderBar extends Component {
	static propTypes = {
		subtitle: PropTypes.any,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { subtitle, title, children } = this.props;
		const triggerKey = generateKey("trigger");
		return (
			<View>
				<View>
					{subtitle && <Text>{subtitle}</Text>}
					<Text>{title}</Text>
				</View>
				<View>{children}</View>
			</View>
		);
	}
}

export default translate()(HeaderBar);
