import React, { Component } from "react";
import moment from "moment";
import _ from "lodash";

import "./HomeWidget.css";
const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

export default class HomeWidget extends Component {
	// Maybe these can be a Separate Component?

	renderWidget(w) {
		console.log(w);

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
			let categories = Array.from(w.fields.related || []);
			return null;
		}
		return <div className="Widget">{w.fields.type}</div>;
	}

	renderArticle(article, category, showHero = true, showFullArticle = false) {
		const { country, onNavigate } = this.props;
		if (!article) {
			// Anti pattern, but saves 1 or more ifs.
			return null;
		}

		let categorySlug = "article";
		if (category) {
			categorySlug = category.fields.slug;
		}

		let content = showFullArticle ? article.fields.content : article.fields.lead;

		return (
			<div className="Article" key={article.sys.id}>
				{article.fields.hero &&
					showHero && (
						<div className="hero">
							<img src={article.fields.hero.fields.file.url + "?fm=jpg&fl=progressive"} alt="" />
						</div>
					)}
				{showFullArticle ? <h3>{article.fields.title}</h3> : <h3 onClick={() => onNavigate(`/${country.fields.slug}/${categorySlug}/${article.fields.slug}`)}>{article.fields.title}</h3>}
				<p dangerouslySetInnerHTML={{ __html: md.render(content) }} />
				{!showFullArticle && (
					<s className="Read-More">
						<a href="#" onClick={() => onNavigate(`/${country.fields.slug}/${categorySlug}/${article.fields.slug}`)}>
							Read more
						</a>
					</s>
				)}
			</div>
		);
	}

	renderCategory(c) {
		return (
			<div className="Category">
				<h3>{c.fields.name}</h3>
				{(c.fields.articles || []).map(a => this.renderArticle(a, c, false))}
			</div>
		);
	}

	render() {
		const { content } = this.props;
		const year = moment().year();
		if (!content) {
			return null;
		}

		let rendered = null;
		switch (content.sys.contentType.sys.id) {
			case "article":
				rendered = this.renderArticle(content);
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

		return <div className={["HomeWidget", content.fields.highlighted ? "Highlighted" : ""].join(" ")}>{rendered}</div>;
	}
}
