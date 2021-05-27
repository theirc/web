import React, { Component } from "react";
import { translate } from "react-i18next";
import { View,  TouchableOpacity } from "react-native";
import _ from "lodash";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./SelectorsStyles";
import window from "../../shared/nativeDimensions";
import PropTypes from "prop-types";
import Text from "./Text";

const { width, heightWithoutHeader } = window;

class CountrySelector extends Component {
	static propTypes = {};
	static contextTypes = {
		theme: PropTypes.object,
	};

	componentDidMount() {}

	render() {
		const { onGoTo, t } = this.props;
		const { theme } = this.context;

		let countryList = this.props.countryList.map(_.identity);

		if (global.navigator && navigator.geolocation) {
			countryList.push({
				id: "detect-me",
				fields: {
					slug: "detect-me",
					name: t("Detect My Location"),
				},
			});
		}

		return (
			<View style={[styles.Selectors, { height: heightWithoutHeader }]}>
				<View style={styles.spacer} />
				<Icon style={styles.i} name="my-location" size={30} color={theme.color} />
				<View>
					<Text style={styles.text}>{t("Where are you now?").toUpperCase()}</Text>
				</View>
				<View style={styles.spacer} />
				{countryList.map((c, i) => (
					<TouchableOpacity
						key={c.id}
						onPress={() => {
							onGoTo(c.fields.slug);
						}}
						title={c.fields.name}
						style={styles.item}
					>
						<Text style={styles.itemText}>{c.fields.name}</Text>
					</TouchableOpacity>
				))}
				<View style={styles.spacer} />
			</View>
		);
	}
}
export default translate()(CountrySelector);
