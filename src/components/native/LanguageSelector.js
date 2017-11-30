import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './SelectorsStyles';

class LanguageSelector extends Component {
	static propTypes = {};
	render() {
		const { languages, onSelectLanguage, t } = this.props;
		return (
			<View style={styles.Selectors}>
				<View style={styles.spacer} style={{ minHeight: 105}} />
				<Icon style={styles.i} name="translate" size={30} color="#ffda1a" />
				<View>
					{languages.map((c, i) => <Text style={styles.text} key={`choose-${c[0]}`}>{t("Choose your language", { lng: c[0] }).toUpperCase()}</Text>)}
				</View>
				<View style={styles.spacer} />
				{languages.map((c, i) => (
					<TouchableOpacity

						key={i}
						onPress={() => {
              console.log("selected",c[0])
							onSelectLanguage(c[0]);
            }}
            title={c[1]}
					>
						<Text style={styles.item}>{c[1]}</Text>
					</TouchableOpacity>
				))}
				<View style={styles.bottom} />
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
