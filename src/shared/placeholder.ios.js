import React from "react";
import { View } from "react-native";

module.exports = props => <View {...props}>{props.children}</View>;
