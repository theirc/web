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

	replaceLinks() {
		const { onNavigate } = this.props;

		let hostname = "www.refugee.info";
		if (global.location) {
			hostname = global.location.hostname;
		}

		let anchors = Array.from(this._ref.querySelectorAll("a"));
		anchors = anchors.filter(a => a.href.indexOf("http") || a.hostname === hostname);
		// eslint-disable-next-line
		let isPhoneOrAlreadyProcessed = h => h.indexOf("javascript:void") === -1 && h.indexOf("tel:") === -1;

		for (let anchor of anchors.filter(a => isPhoneOrAlreadyProcessed(a.href))) {
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
	componentDidUpdate() {
		this.replaceLinks();
	}

	componentDidMount() {
		this.replaceLinks();
	}

	render() {
		const { article, category, loading } = this.props;
		const { title, content, hero } = article.fields;
		//\+[1-9]{1}[0-9]{3,14}
		let html = md.render(content);
		html = html.replace(/(\+[1-9]{1}[0-9]{3,14})/g, `<a class="tel" href="tel:$1">$1</a>`);

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
					<div dangerouslySetInnerHTML={{ __html: html }} />
				</article>
			</div>
		);
	}
}
