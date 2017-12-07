import React, { Component } from "react";
import moment from "moment";
import _ from "lodash";
import { View, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import { translate } from "react-i18next";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import cms from "../../content/cms";
import styles from "./HomeWidgetStyles";
import Icon from "react-native-vector-icons/MaterialIcons";
import Text from "./Text";
import nativeColors from "../../shared/nativeColors";
import PropTypes from "prop-types";
const APP_ID = cms.siteConfig.appId;
const Remarkable = require("remarkable");
const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class HomeWidget extends Component {
	// Maybe these can be a Separate Component?

	renderWidget(w) {
		if (w.fields.type === "Latest Article of Category") {
			let category = _.first(w.fields.related);
			if (category) {
				let article = _.last(_.sortBy(category.fields.articles, a => moment(a.sys.updatedAt).unix()));
				return this.renderArticle(article, category);
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
		const { country, onNavigate, t } = this.props;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<View style={[styles.LocalGuide]}>
				<View>
					<Text href="javascript:void(0)" onClick={() => onNavigate(`/${country.fields.slug}/services`)}>
						{t("See More")}
					</Text>
				</View>
				<Text>{t("Local Guide")}</Text>
				<View Style={[styles.Container]}>
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
								<View style={[style.Overlay]} onClick={link.bind(null, c)}>
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
		let articleFunc = category => category.fields.overview || _.first(category.fields.articles);
		const { country, onNavigate, t } = this.props;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<View style={[styles.TopCategories]}>
				<View>
					<Text href="javascript:void(0)" onClick={() => onNavigate(`/${country.fields.slug}/categories`)}>
						{t("See More")}
					</Text>
				</View>
				<Text>{t("Top Categories")}</Text>
				{categories.map(c => {
					let article = articleFunc(c);
					return (
						<View key={c.sys.id} style={[styles.TopCategories]} onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${article.fields.slug}`)}>
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

		if (/facebook.com/.test(url)) {
			let videoId = url.replace(/.*facebook.com\/.*\/videos\/(.*)\/.*/, "$1");

			return <FacebookPlayer className={"Facebook"} videoId={videoId} appId={APP_ID} />;
		} else if (/youtube.com/) {
			let videoId = url.replace(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/, "$7");
			return <YouTube videoId={videoId} className={"YouTube"} />;
		}
		return null;
	}

	renderArticle(article, category, showHero = true, showFullArticle = false) {
		const { country, onNavigate, t } = this.props;
		if (!article) {
			// Anti pattern, but saves 1 or more ifs.
			return null;
		}

		let categorySlug = "article";
		if (category) {
			categorySlug = category.fields.slug;
		}

		let content = showFullArticle ? article.fields.content : article.fields.lead;
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
							<Image source={{ uri: article.fields.hero.fields.file.url + "?fm=jpg&fl=progressive" }} alt="" />
						</View>
					)}
				{
					/* 
				showFullArticle ? <h3>{article.fields.title}</h3> : <h3 onClick={() => onNavigate(`/${country.fields.slug}/${categorySlug}/${article.fields.slug}`)}>{article.fields.title}</h3>
				*/
				}
				{contentType.sys.id === "video" && this.renderVideo(article)}
				<Text dangerouslySetInnerHTML={{ __html: md.render(content) }} />
				{!showFullArticle && (
					<View style={[styles.ReadMore]}>
						<Text href="javascript:void(0)" onClick={() => onNavigate(`/${country.fields.slug}/${categorySlug}/${article.fields.slug}`)}>
							{t("Read More")}
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
				<Text>{c.fields.name}</Text>
				<Text dangerouslySetInnerHTML={{ __html: html }} />
				<View>
					<Text href="javascript:void(0)" onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${article.fields.slug}`)}>
						{t("Read More")}
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
		/**
 * 
 if (this._ref) {
	 let anchors = Array.from(this._ref.querySelectorAll("a"));
	 anchors = anchors.filter(a => a.href.indexOf("http") || a.hostname === hostname);
	 
	 for (let anchor of anchors) {
		 let href = anchor.href + "";
		 if (href.indexOf("http") >= 0) {
			 href =
			 "/" +
			 href
			 .split("/")
			 .slice(3)
			 .join("/");
			}
			// eslint-disable-next-line
			anchor.href = "javascript:void(0)";
			anchor.onclick = () => onNavigate(href);
		}
	}
	*/
	}

	render() {
		console.log("Home Widget", this.props);
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

			return (
				<View ref={r => (this._ref = r)} className={["HomeWidget", content.fields.highlighted ? "Highlighted" : "", `CT-${content.sys.contentType.sys.id}`].join(" ")}>
					{rendered}
				</View>
			);
		} catch (e) {
			console.log("Ignoring", e);
			return null;
		}
	}
}

export default translate()(HomeWidget);
