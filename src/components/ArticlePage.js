import React, { Component } from "react";
import PropTypes from "prop-types";
import "./ArticlePage.css";

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

/**
 * 
 */
export default class ArticlePage extends Component {
	static propTypes = {
		article: PropTypes.shape({
			title: PropTypes.string,
			hero: PropTypes.string,
			body: PropTypes.string,
		}),
		category: PropTypes.shape({
			name: PropTypes.string,
			slug: PropTypes.string,
			translations: PropTypes.array,
		}),
		onNavigate: PropTypes.func,
	};

	componentDidMount() {
		const { onNavigate, hostname } = this.props;
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
			anchor.href = "javascript:void(0)";
			anchor.onclick = () => onNavigate(href);
		}
	}

	render() {
		const { article, category, loading } = this.props;
		const { title, content, hero } = article.fields;

		return (
			<div ref={r => (this._ref = r)} className={["ArticlePage", loading ? "loading" : "loaded"].join(" ")}>
				<div className="title">
					<h1>
						<small>{category.fields.name}:</small>
						{title}
					</h1>
				</div>
				{hero && (
					<div className="hero">
						<img src={hero.fields.file.url + "?fm=jpg&fl=progressive"} alt="" />
					</div>
				)}
				<article>
					<div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
				</article>
			</div>
		);
	}
}
