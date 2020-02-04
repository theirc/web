import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Text from "./Text";
import MDIcon from "react-native-vector-icons/MaterialIcons";
import nativeColors from "../../shared/nativeColors";

class ArticleFooter extends Component {
	static propTypes = {};

	static contextTypes = {
		theme: PropTypes.object,
		direction: PropTypes.string,
		flexDirection: PropTypes.object,
	};
	render() {
		const { previous, next, onNavigateTo, t } = this.props;
		const { direction,flexDirection } = this.context;
		const rtl = direction === "rtl";

		const createIcon = name => <MDIcon size={30} color="#000" name={name} style={styles.icon} />;

		const nextIcon = !rtl ? createIcon("navigate-next") : createIcon("navigate-before");
		const prevIcon = !rtl ? createIcon("navigate-before") : createIcon("navigate-next");

		return (
			<View style={styles.Selectors}>
				{next && (
					<TouchableOpacity
						style={[styles.selector, flexDirection.row]}
						onPress={() => {
							onNavigateTo(next.fields.slug);
						}}
					>
						<View style={styles.textContainer}>
							<Text style={styles.small}>{t("NEXT PAGE")}</Text>
							<Text style={styles.text}>{next.fields.title}</Text>
						</View>
						{nextIcon}
					</TouchableOpacity>
				)}
				{previous && next && <View style={[styles.line]} />}
				{previous && (
					<TouchableOpacity
						style={[styles.selector, flexDirection.row]}
						onPress={() => {
							onNavigateTo(previous.fields.slug);
						}}
					>
						<View style={styles.textContainer}>
							<Text style={styles.small}>{t("PREVIOUS PAGE")}</Text>
							<Text style={styles.text}>{previous.fields.title}</Text>
						</View>
						{prevIcon}
					</TouchableOpacity>
				)}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	Selectors: {
		backgroundColor: nativeColors.titleBackground,
		flex: 1,
	},
	textContainer: {
		flex: 1,
		flexGrow: 1,
	},
	small: {
		fontSize: 12,
		color: nativeColors.lighten("#000000", 50),
		fontWeight: "bold",
	},
	text: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000",
	},
	selector: {
		marginHorizontal: 10,
		minHeight: 60,
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	line: {
		width: "95%",
		backgroundColor: nativeColors.dividerColor,
		alignSelf: "center",
		height: 1,
	},
	icon: {
		width: 40,
	},
});

export default translate()(ArticleFooter);
