import React, { Component } from "react";
import PropTypes from "prop-types";
import "./ArticlePage.css";
import { Helmet } from "react-helmet";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import HeaderBar from "./HeaderBar";
import ReactDOMServer from "react-dom/server"
import ReactDOM from "react-dom"

import JsxParser from 'react-jsx-parser'
const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
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

	static contextTypes = {
		config: PropTypes.object,
	};

	replaceLinks() {
		const { onNavigate } = this.props;

		let hostname = "www.refugee.info";
		if (global.location) {
			hostname = global.location.hostname;
		}

		let anchors = Array.from(this._ref.querySelectorAll("a"));
		anchors = anchors.filter(a => a.href.indexOf("http") || a.hostname === hostname || a.hostname === "www.refugee.info");
		// eslint-disable-next-line
		let isPhoneOrAlreadyProcessed = h => h.indexOf("#") === -1 && h.indexOf("tel:") === -1 && h.indexOf("mailto:") === -1;

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
			anchor.href = "#";
			anchor.onclick = () => {
				onNavigate(href);
				return false;
			};
		}
	}
	componentDidUpdate() {
		this.replaceLinks();
	}

	componentDidMount() {
		this.replaceLinks();
	}
	renderVideo() {
		const { article } = this.props;
		const { url } = article.fields;
		const APP_ID = this.context.config.appId;

		if (/facebook.com/.test(url)) {
			let videoId = url.replace(/.*facebook.com\/.*\/videos\/(.*)\/.*/, "$1");

			return <FacebookPlayer className={"Facebook"} videoId={videoId} appId={APP_ID} />;
		} else if (/youtube.com/) {
			let videoId = url.replace(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/, "$7");
			return <YouTube videoId={videoId} className={"YouTube"} />;
		}
		return null;
	}
	componentDidMount() {
		/* */
		const APP_ID = this.context.config.appId;
		
		Array.from(document.querySelectorAll('.yt') || []).forEach(e=> {
			var videoId = e.innerHTML.replace(/<YouTube.*videoId=["']{(.*)}["'].*><\/YouTube>/gmi, '$1');
			e.removeChild(e.firstChild);
			ReactDOM.render(<YouTube videoId={videoId} className={"YouTube"} />, e);
		});		
		Array.from(document.querySelectorAll('.fb') || []).forEach(e=> {
			var videoId = e.innerHTML.replace(/<FacebookPlayer.*videoId=["']{(.*)}["'].*><\/FacebookPlayer>/gmi, '$1');
			e.removeChild(e.firstChild);
			ReactDOM.render( <FacebookPlayer className={"Facebook"} videoId={videoId} appId={APP_ID} />, e);
		});
	}

	render() {
		const { article, category, loading } = this.props;
		const { title, content, hero, lead } = article.fields;
		const { contentType } = article.sys;

		let html = md.render(content || lead);
		html = html.replace(/(\+[0-9]{9,14}|00[0-9]{9,15})/g, `<a class="tel" href="tel:$1">$1</a>`);
		html = html.replace(/(<YouTube.*\/>)/gmi, (a)=> {
			return `<div class="yt">${a}</div>`;
		});
		html = html.replace(/(<FacebookPlayer.*\/>)/gmi, (a)=> {
			return `<div class="fb">${a}</div>`;
		});

		return (
			<div ref={r => (this._ref = r)} className={["ArticlePage", loading ? "loading" : "loaded"].join(" ")}>
				<Helmet>
					<title>{title}</title>
				</Helmet>
				<HeaderBar subtitle={(category.fields.articles || []).length > 1 && `${category.fields.name}:`} title={title} />
				{hero &&
					hero.fields &&
					hero.fields.file && (
						<div>
							<div className="hero">
								<img src={hero.fields.file.url + "?fm=jpg&fl=progressive"} alt="" />
							</div>
							{hero.fields.description && <credit>{hero.fields.description}</credit>}
						</div>
					)}
				{contentType.sys.id === "video" && this.renderVideo()}
				<article>
					<div dangerouslySetInnerHTML={{ __html: html }} />
				</article>
			</div>
		);
	}
}
