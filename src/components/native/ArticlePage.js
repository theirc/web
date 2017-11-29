import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, WebView, Text, Button, StyleSheet, Dimensions, Image } from "react-native";
import HeaderBar from "./HeaderBar";
import WebViewAutoHeight from "./WebViewAutoHeight";
const window = Dimensions.get("window");

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

		html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"/>
		<link rel="stylesheet" href="https://www.refugee.info/static/css/main.17032a2e.css" />
		<link rel="stylesheet" href="https://www.refugee.info/css/app.css" /> </head>
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
		<link href="https://afeld.github.io/emoji-css/emoji.css" rel="stylesheet" />
		</head>
		<body>
			<div id="root">
				<span class="ltr irc"><div class="Skeleton"><div class="ArticlePage"><article >${html}</article></div></div></span>
			</div>
		</body>
		</html>`;
		return (
			<View>
				<HeaderBar subtitle={(category.fields.articles || []).length > 1 && `${category.fields.name}:`} title={title} />
				<WebViewAutoHeight source={{ html }} style={[styles.webView]} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	webView: {
		backgroundColor: "#000000",
		width: window.width,
	},
});

export default translate()(ArticlePage);
