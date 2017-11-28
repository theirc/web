import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Text, Button, StyleSheet, Image } from "react-native";

class ArticleFooter extends Component {
	static propTypes = {};

	render() {
		return (
			<View>
				<Text>I'm an article Footer</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({});

export default translate()(ArticleFooter);
