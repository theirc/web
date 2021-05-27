import React, { Component } from "react";
import { translate } from "react-i18next";
import PropTypes from "prop-types";
import { View,  Button, StyleSheet, Image } from "react-native";
import styles from "./HeaderBarStyles";
import Text from "./Text";

const generateKey = pre => {
	return `${pre}_${new Date().getTime()}`;
};

class HeaderBar extends Component {
	static propTypes = {
		subtitle: PropTypes.any,
		title: PropTypes.string,
	};
	static contextTypes = {
		theme: PropTypes.object,
	};

	render() {
		const { subtitle, title, children } = this.props;
		const triggerKey = generateKey("trigger");

		return (
			<View style={styles.HeaderBar}>
				<View style={styles.titleContainer}>
					{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
					<Text style={styles.title}>{title}</Text>
				</View>
				<View>{children}</View>
			</View>
		);
	}
}

export default translate()(HeaderBar);
