import React, { Component } from "react";
import PropTypes from 'prop-types';
import { translate } from "react-i18next";

import getSessionStorage from "../../shared/sessionStorage";
import { View,  Button, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./SelectorsStyles";
import Text from "./Text";

import _ from "lodash";
import window from "../../shared/nativeDimensions";
const { width, heightWithoutHeader } = window;

class DetectLocationSelector extends Component {
	static propTypes = {};
	static contextTypes = {
		theme: PropTypes.object,
	};


	state = {
		active: false,
	};
	loadLocation() {
		const { onBackToList, onLocationFound, onLocationError, t } = this.props;

		this.setState({ active: true });
		const self = this;
		let time = null;

		let locationFound = l => {
			if (time) clearTimeout(time);

			self.setState({ active: false });
			if (onLocationFound) onLocationFound(l);
		};

		let errorOut = () => {
			alert(t("We cannot determine your location. Please select a location from the list"));
			if (onBackToList) onBackToList();
		};

		let locationError = l => {
			if (time) clearTimeout(time);

			self.setState({ active: false });
			if (onLocationError) onLocationError(l);

			errorOut();
		};
		const noop = () => console.log("noop");

		navigator.geolocation.getCurrentPosition(l => locationFound(l), () => locationError());

		time = setTimeout(() => {
			locationFound = noop;
			locationError = noop;

			self.setState({ active: false });

			if (onLocationError) onLocationError();
			errorOut();
		}, 30 * 1e3);
	}

	render() {
		const { t } = this.props;
		const { theme } = this.context;
		const { active } = this.state;

		return (
			<View style={[styles.Selectors, { height: heightWithoutHeader }]}>
				<View style={styles.spacer} />
				<Icon style={styles.i} name="my-location" size={30} color={theme.color} />
				<View>
					<Text style={[styles.text, { height: 150 }]}>{t("LOCATION_DISCLAIMER")}</Text>
				</View>
				<View style={styles.spacer} />
				<TouchableOpacity onPress={this.loadLocation.bind(this)} style={styles.item}>
					<Text style={styles.itemText}>{t("OK")}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => onBackToList && onBackToList()} style={styles.item}>
					<Text style={styles.itemText}>{t("Back to List")}</Text>
				</TouchableOpacity>
				<View style={styles.spacer} />
			</View>
		);
	}
}
export default translate()(DetectLocationSelector);
