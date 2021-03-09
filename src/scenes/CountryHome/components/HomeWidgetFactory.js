// libs
import React, { Component } from "react";
import { translate } from "react-i18next";

// local
import { ArticleWidget, CategoryWidget, LocalGuideWidget, TopCategoriesWidget } from "../../../components";
import "./HomeWidgetFactory.css";

/**
 * @class
 * @description 
 */
class HomeWidget extends Component {

	renderWidget(w) {

		if (w.fields.type === "Latest Article of Category") {
			let category = w.fields.related[0];
			if (category) {
				let article = category.fields.articles.sort(function(a,b){
					return new Date(b.sys.updatedAt).getTime() - new Date(a.sys.updatedAt).getTime();
				  }).pop();
				return this.renderArticle(article, category);
			}
		} else if (w.fields.type === "First Article of Category") {
			let category = w.fields.related[0];
			if (category) {
				let article = category.fields.overview || category.fields.articles[0];
				return this.renderArticle(article, category, true, w.fields.showFullArticle);
			}
		} else if (w.fields.type === "Top Categories" & w.fields.title !== "Lo más nuevo") { //TODO: IMPROVE CONDITION - TITLE SHOULD NOT BE A CONDITION
			let categories = Array.from(w.fields.related || []).filter(r => r.sys.contentType && r.sys.contentType.sys.id === "category");
			return this.renderTopCategories(categories);
		} else if (w.fields.type === "Local Guide") {
			let guideItems = Array.from(w.fields.related || []).filter(r => r.sys.contentType && r.sys.contentType.sys.id === "localGuideItem");
			return guideItems.length ? this.renderLocalGuide(guideItems) : null;
		}
		return null;
	}

	renderLocalGuide(guideItems) {
		const { country, onNavigate, language } = this.props;
		return <LocalGuideWidget country={country} onNavigate={onNavigate} language={language} guideItems={guideItems} />;
	}

	renderTopCategories(categories) {
		const { country, onNavigate, language } = this.props;
		return <TopCategoriesWidget country={country} onNavigate={onNavigate} language={language} categories={categories} />;
	}

	renderArticle(article, category, showHero = true, showFullArticle = false) {
		const { isHome, index, country, onNavigate, language } = this.props;
		return <ArticleWidget isHome={isHome} index={index} country={country} onNavigate={onNavigate} article={article} language={language} category={category} showHero={showHero} showFullArticle={showFullArticle} />;
	}

	renderCategory(c) {
		const { country, onNavigate, language } = this.props;
		return <CategoryWidget country={country} onNavigate={onNavigate} language={language} c={c} />;
	}

	render() {
		const { content } = this.props;
		if (!content) {
			return null;
		}

		try {
			let rendered = null;

			if (!content.sys.contentType) return null;

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
				rendered ?
					<div className={["HomeWidget", content.fields.highlighted ? "Highlighted" : "", `CT-${content.sys.contentType.sys.id}`].join(" ")}>
						{rendered}
					</div> : null
			);
		} catch (e) {
			console.log("Ignoring", e);
			return null;
		}
	}
}

export default translate()(HomeWidget);
