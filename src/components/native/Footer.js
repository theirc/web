import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import moment from "moment";

class Footer extends Component {
	static propTypes = {};

	render() {
		const { onChangeLocation, onChangeLanguage, disableCountrySelector, questionLink, deviceType, t } = this.props;
		const year = moment().year();

		return (
			<View>
				<Button title={t("Change language")} onPress={() => onChangeLanguage()} />
				<Button title={t("Change location")} onPress={() => onChangeLocation()} />
			</View>
		);
	}
}

const styles = StyleSheet.create({});

export default translate()(Footer);
