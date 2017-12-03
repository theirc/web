"use strict";
import { StyleSheet } from "react-native";
import { width, height } from "../../shared/nativeDimensions";
import nativeColors from "../../shared/nativeColors";

const { titleBackground, dividerBackground, lighten } = nativeColors;

export default StyleSheet.create({
	light: {
		minHeight: 100,
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	lightText: {
		fontSize: 16,
	},
	lightLink: {
		fontSize: 20,
		marginTop: 10,
		textDecorationLine: 'underline',
		textDecorationStyle: 'solid',
	},
});
