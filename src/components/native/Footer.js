import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import moment from "moment";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./FooterStyles";

class Footer extends Component {
	static propTypes = {};
	static contextTypes = {
		theme: PropTypes.object,
	};

	render() {
		const { onChangeLocation, onChangeLanguage, disableCountrySelector, questionLink, deviceType, t } = this.props;
		const year = moment().year();
		const { theme } = this.context;

		return (
			<View>
				<View style={[styles.light, { backgroundColor: theme.color }]}>
					<Text style={[styles.lightText, { color: theme.inverse }]}>Can't find specific information?</Text>
					<Text style={[styles.lightLink, { color: theme.inverse }]}>Ask us a question</Text>
				</View>
				<View style={{}}>
					<Button title={t("Change language")} onPress={() => onChangeLanguage()} />
					<Button title={t("Change location")} onPress={() => onChangeLocation()} />
				</View>
			</View>
		);
	}
}

export default translate()(Footer);
