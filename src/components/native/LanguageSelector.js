import React, { Component } from "react";
import { translate } from "react-i18next";
import { View,  TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./SelectorsStyles";
import PropTypes from "prop-types";
import window from "../../shared/nativeDimensions";

const { width, heightWithoutHeader } = window;
import Text from "./Text";

class LanguageSelector extends Component {
	static propTypes = {};
	static contextTypes = {
		config: PropTypes.object,
		theme: PropTypes.object,
	};
	render() {
		const { languages, onSelectLanguage, t } = this.props;
		const { config, theme } = this.context;

		console.log(languages);
		return (
			<View style={[styles.Selectors, { height: heightWithoutHeader }]}>
				<View style={styles.spacer} />

				<Icon style={styles.i} name="translate" size={30} color={theme.color} />
				<View>
					{languages.map((c, i) => (
						<Text style={styles.text} key={`choose-${c[0]}`}>
							{t("Choose your language", { lng: c[0] }).toUpperCase()}
						</Text>
					))}
				</View>
				<View style={styles.spacer} />
				{languages.map((c, i) => (
					<TouchableOpacity
						key={i}
						onPress={() => {
							onSelectLanguage(c[0]);
						}}
						title={c[1]}
						style={styles.item}
					>
						<Text style={styles.itemText}>{c[1]}</Text>
					</TouchableOpacity>
				))}
				<View style={styles.spacer} />
			</View>
		);

		return <View />;
	}
}

export default translate()(LanguageSelector);
