import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button } from "react-native";

class CountrySelector extends Component {
	static propTypes = {};

	componentDidMount() {}

	render() {
		const { countryList, onGoTo, t } = this.props;

		return (
			<View className="CountrySelector">
				<View className="spacer" />

				<View className="text">
					<Text>{t("Where are you now?")}</Text>
				</View>
				<View className="spacer" />
				{countryList.map((c, i) => (
					<Button
						className="item "
						key={c.id}
						onPress={() => {
							onGoTo(c.fields.slug);
						}}
						title={c.fields.name}
					>
						{c.fields.name}
					</Button>
				))}
				<View className="bottom" />
			</View>
		);
	}
}
export default translate()(CountrySelector);
