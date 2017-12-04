import ExtraDimensions from "react-native-extra-dimensions-android";
import { Dimensions, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

const androidNonTranslucentStatusBar = Platform.OS === "android" && DeviceInfo.getAPILevel() < 19;
const dim = Dimensions.get("window");
const HEADER = 64;
const TOOLBAR = 56;

export default {
	width: dim.width,
	statusBar: androidNonTranslucentStatusBar ? 0 : ExtraDimensions.get("STATUS_BAR_HEIGHT") || 16,
	baseHeight: dim.height - (ExtraDimensions.get("STATUS_BAR_HEIGHT") || 0),
	height: dim.height - (ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0) - (ExtraDimensions.get("STATUS_BAR_HEIGHT") || 0),
	heightWithoutHeader: dim.height - (ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0) - HEADER,
	usableHeight: dim.height - (ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0) - HEADER - TOOLBAR,
	header: HEADER,
	toolbar: TOOLBAR,
	softMenuBar: ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0,
};
