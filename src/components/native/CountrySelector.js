import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, TouchableOpacity } from "react-native";
import _ from "lodash";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Selectorstyles from './SelectorsStyles';

class CountrySelector extends Component {
	static propTypes = {};

	componentDidMount() {}

	render() {
		const { onGoTo, t } = this.props;
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
			<View style={Selectorstyles.Selectors}>
				<View style={Selectorstyles.spacer} />
				<Icon style={Selectorstyles.i} name="my-location" size={30} color="#ffda1a" />
				<View>
					<Text style={Selectorstyles.text}>{t("Where are you now?").toUpperCase()}</Text>
				</View>
				<View style={Selectorstyles.spacer} />
				{countryList.map((c, i) => (
					<TouchableOpacity

						key={c.id}
						onPress={() => {
							onGoTo(c.fields.slug);
						}}
						title={c.fields.name}
					>
						<Text style={Selectorstyles.item}>{c.fields.name}</Text>
					</TouchableOpacity>
				))}
				<View style={Selectorstyles.bottom} />
			</View>
		);
	}
}
export default translate()(CountrySelector);
