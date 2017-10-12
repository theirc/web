import React, { Component } from "react";
import moment from "moment";
import _ from "lodash";

import "./HomeWidget.css";

export default class HomeWidget extends Component {
	// Maybe these can be a Separate Component?

	renderWidget(w) {
		if (w.fields.type === "Latest Article of Category") {
			let category = _.first(w.fields.related);
			if (category) {
				let article = _.last(
					_.sortBy(category.fields.articles, a =>
						moment(a.sys.updatedAt).unix()
					)
				);
				return this.renderArticle(article, category);
			}
		} else if (w.fields.type === "First Article of Category") {
			let category = _.first(w.fields.related);
			if (category) {
				let article =
					category.fields.overview ||
					_.first(category.fields.articles);
				return this.renderArticle(article, category);
			}
		} else if (w.fields.type === "Top Categories") {
			let categories = Array.from(w.fields.related || []);
			return null;
		}
		return <div className="Widget">{w.fields.type}</div>;
	}

	renderArticle(article, category, showHero = true) {
		const { country, onNavigate } = this.props;
		if (!article) {
			// Anti pattern, but saves 1 or more ifs.
			return null;
		}

		let categorySlug = "article";
		if (category) {
			categorySlug = category.fields.slug;
		}

		return (
			<div className="Article" key={article.sys.id}>
				{article.fields.hero &&
					showHero && (
						<div className="hero">
							<img
								src={
									article.fields.hero.fields.file.url +
									"?fm=jpg&fl=progressive"
								}
								alt=""
							/>
						</div>
					)}
				<h3>{article.fields.title}</h3>
				<p>{article.fields.lead}</p>
				<s>
					<a
						href="#"
						onClick={() =>
							onNavigate(
								`/${country.fields
									.slug}/${categorySlug}/${article.fields
									.slug}`
							)}
					>
						Read more
					</a>
				</s>
			</div>
		);
	}

	renderCategory(c) {
		return (
			<div>
				<div className="Category">
					<h3>{c.fields.name}</h3>
				</div>
				{c.fields.articles.map(a => this.renderArticle(a, c, false))}
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
		return <div className="HomeWidget">{rendered}</div>;
	}
}
