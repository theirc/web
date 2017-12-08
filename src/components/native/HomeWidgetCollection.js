import React, { Component } from "react";
 import { View, Button, StyleSheet, Image, TouchableOpacity } from "react-native";

 export default class HomeWidgetCollection extends Component {
 	render() {
 		return <View style={styles.widgetCollection}>{this.props.children}</View>;
 	}
 }

 const styles = StyleSheet.create({
 	widgetCollection: {
 		minHeight: 100,
 		backgroundColor: 'white',
 	},
 });
