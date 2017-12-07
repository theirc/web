"use strict";
import { StyleSheet } from "react-native";
import { width, height } from "../../shared/nativeDimensions";
import nativeColors from "../../shared/nativeColors";

const { titleBackground, dividerBackground, lighten } = nativeColors;

export default StyleSheet.create({

    LocalGuide: {
      flex: 1,
      BackgroundColor: "white",
    },
    Container: {
      justifyContent: "center",
  		minHeight: 60,
      BackgroundColor: "green",
    },
    LocalGuideItem: {
      display: "block",
      flexBasis: 5,
      marginBottom: 5,
      marginRight: 10,
    },
    Image: {
      height: 72,
      width: "100%",
      objectFit: "cover",
    }
});
