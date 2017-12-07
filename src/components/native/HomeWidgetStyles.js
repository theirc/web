"use strict";
import { StyleSheet } from "react-native";
import { width, height } from "../../shared/nativeDimensions";
import nativeColors from "../../shared/nativeColors";

const { titleBackground, dividerBackground, lighten } = nativeColors;

export default StyleSheet.create({

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
    }
});
