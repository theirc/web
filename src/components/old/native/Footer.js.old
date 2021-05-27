import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, TouchableOpacity, StyleSheet, Image, Linking } from "react-native";
import moment from "moment";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./FooterStyles";
import Text from "./Text";
import nativeColors from "../../shared/nativeColors";

class Footer extends Component {
	static propTypes = {};
	static contextTypes = {
		theme: PropTypes.object,
	};

	render() {
		const { onChangeLocation, onChangeLanguage, disableCountrySelector, disableLanguageSelector, questionLink, deviceType, t } = this.props;
		const year = moment().year();
		const { theme } = this.context;
		const openAskUs = () => {
			Linking.openURL(questionLink);
		};

		return (
			<View>
				<View style={[styles.light, { backgroundColor: theme.color }]}>
					<Text style={[styles.lightText, { color: theme.inverse }]}>{t("Can't find specific information?")}</Text>
					<TouchableOpacity onPress={() => openAskUs()}>
						<Text style={[styles.lightLink, { color: theme.inverse }]}>{t("Ask us a question")}</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.footerButtonContainer}>
					{!disableLanguageSelector && (
						<TouchableOpacity style={styles.footerButtons} onPress={() => onChangeLanguage()}>
							<Icon style={{}} name="translate" size={26} color={theme.color} />
							<Text
								style={{
									color: "#ffffff",
								}}
							>
								{t("Change Language")}
							</Text>
						</TouchableOpacity>
					)}
					{!disableCountrySelector && (
						<View
							style={{
								borderColor: nativeColors.dividerColor,
								borderWidth: 1,
							}}
						/>
					)}
					{!disableCountrySelector && (
						<TouchableOpacity style={styles.footerButtons} onPress={() => onChangeLocation()}>
							<Icon style={{}} name="my-location" size={26} color={theme.color} />
							<Text
								style={{
									color: "#ffffff",
								}}
							>
								{t("Change Location")}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	}
}

export default translate()(Footer);
