"use strict";
import { StyleSheet } from "react-native";
import { width, height } from "../../shared/nativeDimensions";
import nativeColors from "../../shared/nativeColors";

const { titleBackground, dividerBackground, lighten } = nativeColors;

export default StyleSheet.create({
	HomeWidget: {
		padding: 20,
		flex: 1,
	},
	Highlighted: {
		flexBasis: "100%",
	},
	container: {
		justifyContent: "center",
		minHeight: 60,
		flexWrap: "wrap",
	},
	LocalGuideItem: {
		flexBasis: 5,
		marginBottom: 5,
		marginRight: 10,
	},
	Image: {
		height: 72,
		width: "100%",
	},
	Article: { flex: 1, flexDirection: "column" },
	Hero: {
		marginRight: -20,
		marginLeft: -20,
		marginTop: -20,
		height: 200,
		backgroundColor: "#000",
	},
	ReadMore: {
		flexDirection: "row",
	},
	ReadMoreIcon: {
		flexDirection: "row",
		alignItems: "center",
	},

	TopCategories: {
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 16,
	},
	Category: {
		flex: 1,
	},
	CategHeader: {},
	Title: {
		marginTop: 10,
		marginBottom: 3,
		fontWeight: "700",
		fontSize: 18,
	},
	CategParag: {
		fontSize: 24,
		marginTop: 0,
		fontWeight: "700",
	},
	Overlay: {
		position: "relative",
		top: -76,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		height: 72,
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center",
		marginBottom: -76,
		color: "white",
		fontSize: 18,
		letterSpacing: 0,
		lineHeight: 16,
	},
	LocalGuide: {
		flex: 1,
		backgroundColor: "white",
	},
	Container: {
		justifyContent: "center",
		minHeight: 60,
		backgroundColor: "green",
	},
	LocalGuideItem: {
		flexBasis: 5,
		marginBottom: 5,
		marginRight: 10,
	},
	Image: {
		height: 72,
		width: "100%",
	},
});
