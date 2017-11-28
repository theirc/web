import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, WebView, Text, Button, StyleSheet, Image } from "react-native";
import HeaderBar from "./HeaderBar";

import cms from "../../content/cms";
const APP_ID = cms.siteConfig.appId;

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class ArticlePage extends Component {
	static propTypes = {};

	render() {
		const { article, category, loading } = this.props;
		const { title, content, hero, lead } = article.fields;
		const { contentType } = article.sys;

		let html = md.render(content || lead);
		html = html.replace(/(\+[0-9]{9,14})|00[0-9]{9,15}/g, `<a class="tel" href="tel:$1">$1</a>`);

		console.log(this.props);
		html = `<html><head><link rel="stylesheet" href="https://www.refugee.info/static/css/main.17032a2e.css"/> </head><body class="ltr irc"><div class="ArticlePage"><article >${html}</article></div></body></html>`;
		console.log(html);
		return (
			<View>
				<HeaderBar subtitle={(category.fields.articles || []).length > 1 && `${category.fields.name}:`} title={title} />
				<WebView source={{ html }} style={[styles.webView]} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	webView: {
		height: 300,
		width: 300,
	},
});

export default translate()(ArticlePage);
