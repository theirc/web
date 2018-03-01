import React, { Component } from "react";
import moment from "moment";
import _ from "lodash";
import { View, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import { translate } from "react-i18next";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import styles from "./HomeWidgetStyles";
import Icon from "react-native-vector-icons/MaterialIcons";
import Text from "./Text";
import nativeColors from "../../shared/nativeColors";
import PropTypes from "prop-types";
import WebViewAutoHeight from "./WebViewAutoHeight";
import nativeTools from "../../shared/nativeTools";

const Remarkable = require("remarkable");
const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class HomeWidget extends Component {
	static contextTypes = {
		config: PropTypes.object,
		theme: PropTypes.object,
	};
	// Maybe these can be a Separate Component?

	renderWidget(w) {
		if (w.fields.type === "Latest Article of Category") {
			let category = _.first(w.fields.related);
			if (category) {
				let article = _.last(_.sortBy(category.fields.articles, a => moment(a.sys.updatedAt).unix()));
				return this.renderArticle(article, category, true, w.fields.showFullArticle);
			}
		} else if (w.fields.type === "First Article of Category") {
			let category = _.first(w.fields.related);
			if (category) {
				let article = category.fields.overview || _.first(category.fields.articles);
				return this.renderArticle(article, category, true, w.fields.showFullArticle);
			}
		} else if (w.fields.type === "Top Categories") {
			let categories = Array.from(w.fields.related || []).filter(r => r.sys.contentType.sys.id === "category");
			return this.renderTopCategories(categories);
		} else if (w.fields.type === "Local Guide") {
			let guideItems = Array.from(w.fields.related || []).filter(r => r.sys.contentType.sys.id === "localGuideItem");
			return this.renderLocalGuide(guideItems);
		}
		return null;
	}

	renderLocalGuide(guideItems) {
		return null;
		const { country, onNavigate, t } = this.props;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<View style={[styles.LocalGuide]}>
				<View>
					<Text href="javascript:void(0)" onPress={() => onNavigate(`/services`)}>
						{t("See More")}
					</Text>
				</View>
				<Text>{t("Local Guide")}</Text>
				<View Style={[styles.container]}>
					{guideItems.map(c => {
						let image =
							c.fields.backgroundImage && c.fields.backgroundImage.fields.file ? (
								<Image alt={c.fields.title} source={{ uri: `${c.fields.backgroundImage.fields.file.url}?fm=jpg&fl=progressive` }} />
							) : (
								<Image alt={c.fields.title} source={{ uri: "https://upload.wikimedia.org/wikipedia/en/4/48/Blank.JPG" }} />
							);
						let link = c => {
							if (c.fields.url.indexOf("/") === 0) {
								return onNavigate(c.fields.url);
							} else {
								return (global.document.location = c.fields.url);
							}
						};
						return (
							<View key={c.sys.id} style={[style.LocalGuideItem]}>
								{image}
								<View style={[style.Overlay]} onPress={link.bind(null, c)}>
									{c.fields.title}
								</View>
							</View>
						);
					})}
				</View>
			</View>
		);
		/*eslint-enable*/
		/*jshint ignore:end*/
	}

	renderTopCategories(categories) {
		return null;

		let articleFunc = category => category.fields.overview || _.first(category.fields.articles);
		const { country, onNavigate, t } = this.props;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<View style={[styles.TopCategories]}>
				<View>
					<Text href="javascript:void(0)" onPress={() => onNavigate(`/categories`)}>
						{t("See More")}
					</Text>
				</View>
				<Text>{t("Top Categories")}</Text>
				{categories.map(c => {
					let article = articleFunc(c);
					return (
						<View key={c.sys.id} style={[styles.TopCategories]} onPress={() => onNavigate(`/${c.fields.slug}/${article.fields.slug}`)}>
							<View style={[styles.icon]}>
								<i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "add")}</i>
							</View>
							{c.fields.name}
						</View>
					);
				})}
			</View>
		);
		/*eslint-enable*/
		/*jshint ignore:end*/
	}

	renderVideo(article) {
		const { url } = article.fields;
		const APP_ID = this.context.config.appId;

		if (/facebook.com/.test(url)) {
			let videoId = url.replace(/.*facebook.com\/.*\/videos\/(.*)\/.*/, "$1");

			return <FacebookPlayer className={"Facebook"} videoId={videoId} appId={APP_ID} />;
		} else if (/youtube.com/.test(url)) {
			let videoId = url.replace(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/, "$7");
			return <YouTube videoId={videoId} className={"YouTube"} />;
		}
		return null;
	}

	renderArticle(article, category, showHero = true, showFullArticle = false) {
		const { country, onNavigate, t } = this.props;

		const { direction } = this.props;
		const { config, theme } = this.context;

		if (!article) {
			// Anti pattern, but saves 1 or more ifs.
			return null;
		}

		let categorySlug = "article";
		if (category) {
			categorySlug = category.fields.slug;
		}

		let content = showFullArticle ? article.fields.content : article.fields.lead;
		content = nativeTools.wrapHTML(direction, theme.name, config.css, md.render(content));

		const { contentType } = article.sys;
		if (contentType.sys.id === "video") {
			content = article.fields.lead;
			showFullArticle = true;
		}
		let hero = article.fields.hero;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<View style={[styles.Article]} key={article.sys.id}>
				{hero &&
					hero.fields &&
					hero.fields.file &&
					showHero && (
						<View style={[styles.Hero]}>
							<Image
								style={[
									{
										width: "100%",
										height: 200,
										resizeMode: "contain",
									},
								]}
								source={{ uri: "https:" + article.fields.hero.fields.file.url + "?fm=jpg&fl=progressive" }}
								alt=""
							/>
						</View>
					)}
				<Text style={[styles.Title]}>{article.fields.title}</Text>
				{contentType.sys.id === "video" && this.renderVideo(article)}
				<WebViewAutoHeight source={{ html: content }} style={{ backgroundColor: "#ffffff" }} onNavigationStateChange={_.partial(nativeTools.navigationStateChange, onNavigate)} />
				{!showFullArticle && (
					<View style={[styles.ReadMoreIcon]}>
						<Icon name="crop-square" size={13} color="#b30000" />
						<Text style={{ fontWeight: "700", fontSize: 12 }} onPress={() => onNavigate(`/${categorySlug}/${article.fields.slug}`)}>
							{t("Read More").toUpperCase()}
						</Text>
					</View>
				)}
			</View>
		);
		/*eslint-enable*/
		/*jshint ignore:end*/
	}

	renderCategory(c) {
		const { country, onNavigate, t } = this.props;

		let html = md.render(c.fields.description);
		let article = c.fields.overview || _.first(c.fields.articles);

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<View style={[styles.Category]}>
				<Text style={[styles.CategHeader, styles.Title]}>{c.fields.name.toUpperCase()}</Text>
				<View style={[styles.ReadMoreIcon]}>
					<Icon name="crop-square" size={13} color="#b30000" />
					<Text style={{ fontWeight: "700", fontSize: 12 }} href="javascript:void(0)" onPress={() => onNavigate(`/${c.fields.slug}/${article.fields.slug}`)}>
						{t("Read More").toUpperCase()}
					</Text>
				</View>
			</View>
		);
		/*eslint-enable*/
		/*jshint ignore:end*/
	}
	componentDidMount() {
		const { onNavigate } = this.props;

		let hostname = "www.refugee.info";
		if (global.location) {
			hostname = global.location.hostname;
		}
	}

	render() {
		const { content } = this.props;
		if (!content) {
			return null;
		}
		try {
			let rendered = null;
			switch (content.sys.contentType.sys.id) {
				case "article":
					rendered = this.renderArticle(content, content.fields.category, true, true);
					break;
				case "widget":
					rendered = this.renderWidget(content);
					break;
				case "category":
					rendered = this.renderCategory(content);
					break;
				default:
					rendered = null;
			}

			if (!rendered) {
				return null;
			}

			return (
				<View ref={r => (this._ref = r)} style={["HomeWidget", content.fields.highlighted ? "Highlighted" : null, `CT-${content.sys.contentType.sys.id}`].filter(a => a).map(k => styles[k])}>
					{rendered}
				</View>
			);
		} catch (e) {
			console.log("Ignoring", e);
			throw e;
		}
	}
}

export default translate()(HomeWidget);
