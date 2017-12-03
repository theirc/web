import React from "react";
import { View } from "react-native";

let placeholder = props => <View {...props}>{props.children}</View>;

export default placeholder;
