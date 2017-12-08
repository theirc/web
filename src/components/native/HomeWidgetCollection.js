import React, { Component } from "react";
<<<<<<< HEAD
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
=======
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
>>>>>>> 480dabc284a711c3a5c20ad5c262070b8c97a663
