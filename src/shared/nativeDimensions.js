import ExtraDimensions from "react-native-extra-dimensions-android";
import { Dimensions, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

const androidNonTranslucentStatusBar = Platform.OS === "android" && DeviceInfo.getAPILevel() < 19;
const dim = Dimensions.get("window");
const HEADER = 64;
const TOOLBAR = 56;

const STATUS_BAR_HEIGHT = 0; // ExtraDimensions.get("STATUS_BAR_HEIGHT") || 0;
const SOFT_MENU_BAR_HEIGHT = ExtraDimensions.get("SOFT_MENU_BAR_HEIGHT") || 0;

export default {
	width: dim.width,
	statusBar: Platform.OS === "android" ? 0 : 16,
	baseHeight: dim.height - (STATUS_BAR_HEIGHT || 0),
	height: dim.height - (SOFT_MENU_BAR_HEIGHT || 0) - (STATUS_BAR_HEIGHT || 0),
	heightWithoutHeader: dim.height - (SOFT_MENU_BAR_HEIGHT || 0) - HEADER,
	usableHeight: dim.height - (SOFT_MENU_BAR_HEIGHT || 0) - HEADER - TOOLBAR,
	header: HEADER,
	toolbar: TOOLBAR,
	softMenuBar: SOFT_MENU_BAR_HEIGHT || 0,
};
