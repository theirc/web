import ExtraDimensions from "react-native-extra-dimensions-android";
import { Dimensions, Platform } from "react-native";

const dim = Dimensions.get("window");
const HEADER = 64;
const TOOLBAR = 56;


export default {
	width: dim.width,
	height: dim.height - (ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0),
	heightWithoutHeader: dim.height - (ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0) - HEADER,
	usableHeight: dim.height - (ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0) - HEADER - TOOLBAR,
	header: HEADER,
	toolbar: TOOLBAR,
	softMenuBar: (ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0),
};
