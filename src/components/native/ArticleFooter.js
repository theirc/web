import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, Button, StyleSheet, Image } from "react-native";
import PropTypes from "prop-types";
import Text from "./Text";

class ArticleFooter extends Component {
	static propTypes = {};

	static contextTypes = {
		theme: PropTypes.object,
	};
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
