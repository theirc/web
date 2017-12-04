import React, { Component } from "react";
import { translate } from "react-i18next";
import { View, WebView, Button, StyleSheet, Dimensions, Image } from "react-native";
import HeaderBar from "./HeaderBar";
import WebViewAutoHeight from "./WebViewAutoHeight";
import PropTypes from "prop-types";
import Text from "./Text";

const window = Dimensions.get("window");

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class ArticlePage extends Component {
	static propTypes = {};
	static contextTypes = {
		config: PropTypes.object,
		theme: PropTypes.object,
	};

	state = {
		article: null,
		timeout: null,
	};

	componentWillMount() {
		this.loadArticle(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.article && this.props.article && nextProps.article.sys.id !== this.props.article.sys.id) {
			this.loadArticle(nextProps);
		}
	}

	loadArticle(props) {
		const { article } = props;
		this.setState({
			article: null,
		});
		setTimeout(() => {
			this.setState({
				article,
			});
		}, 200);
	}

	render() {
		const { category, loading, direction } = this.props;
		const { config, theme } = this.context;

		const { article } = this.state;

		if (!article) {
			return (
				<View>
					<HeaderBar subtitle={(category.fields.articles || []).length > 1 && `${category.fields.name}:`} title={title} />
				</View>
			);
		}

		const { contentType } = article.sys;
		const { title, content, hero, lead } = article.fields;

		let html = md.render(content || lead);
		html = html.replace(/(\+[0-9]{9,14})|00[0-9]{9,15}/g, `<a class="tel" href="tel:$1">$1</a>`).replace(/"\/\//gi, '"https://');

		html = `<html dir="${direction}"><head><meta name="viewport" content="width=device-width, initial-scale=1"/>
		<link rel="stylesheet" href="https://www.refugee.info/css/app.css" /> </head>
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
		<link href="https://afeld.github.io/emoji-css/emoji.css" rel="stylesheet" />
		<style>
		${config.css}
		</style>
		</head>
		<body dir="${direction}">
			<div id="root">
				<span class="${direction} ${theme.name}"><div class="Skeleton"><div class="ArticlePage"><article >${html}</article></div></div></span>
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
