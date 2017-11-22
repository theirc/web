import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button } from "react-native";

class LanguageSelector extends Component {
	static propTypes = {};
	render() {
		const { languages, onSelectLanguage, t } = this.props;
		return (
			<View>
				<View className="spacer" style={{ minHeight: 65 }} />
				<View className="text">{languages.map((c, i) => <Text key={`choose-${c[0]}`}>{t("Choose your language", { lng: c[0] })}</Text>)}</View>
				<View className="spacer" />
				{languages.map((c, i) => (
					<Button
						className="item "
						key={i}
						onPress={() => {
                            console.log("selected",c[0])
							onSelectLanguage(c[0]);
                        }}
                        title={c[1]}
					>
						{c[1]}
					</Button>
				))}
				<View className="bottom" />
			</View>
		);

		return (
			<View>
				<Text>TEXT</Text>
			</View>
		);
	}
}

export default translate()(LanguageSelector);
