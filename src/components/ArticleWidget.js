import React, { Component } from "react";
import { translate } from "react-i18next";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import "./ArticleWidget.css";
import PropTypes from 'prop-types';

const Remarkable = require("remarkable");
const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class ArticleWidget extends Component {
	static contextTypes = {
		config: PropTypes.object,
	};
	
	renderVideo(article) {
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
	
	render() {
		const { country, onNavigate, t, article, category, showHero, showFullArticle, language } = this.props;
		if (!article) {
			// Anti pattern, but saves 1 or more ifs.
			return null;
		}
		
		let categorySlug = "article";
		if (category) {
			categorySlug = category.fields.slug;
		}
		
		let content = showFullArticle ? article.fields.content : article.fields.lead;
		let showFullArt = showFullArticle;
		const { contentType } = article.sys;
		if (contentType.sys.id === "video") {
			content = article.fields.lead;
			showFullArt = true;
		}
		let hero = article.fields.hero;
		
		md.renderer.rules.link_open = (tokens, idx /*, options, env */) => { 
			var title = tokens[idx].title;
			return `<a href="${tokens[idx].href}?language=${language}" ${tokens[idx].title}>`; 
		}
		// console.log(content);

		return (
			<div className="Article" key={article.sys.id}>
				{hero &&
					hero.fields &&
					hero.fields.file &&
					showHero && (
						<div className="hero">
							<img src={article.fields.hero.fields.file.url + "?fm=jpg&fl=progressive"} alt="" />
						</div>
					)}
				{showFullArt ? <h3>{article.fields.title}</h3> : <h3 onClick={() => onNavigate(`/${country.fields.slug}/${categorySlug}/${article.fields.slug}`)}>{article.fields.title}</h3>}
				{contentType.sys.id === "video" && this.renderVideo(article)}
				<p dangerouslySetInnerHTML={{ __html: md.render(content) }} />
				{!showFullArt && (
					<s className="Read-More">
						<a
							href="#/"
							onClick={() => {
								onNavigate(`/${country.fields.slug}/${categorySlug}/${article.fields.slug}?language=${language}`);
								return false;
							}}
						>
							{t("Read More")}
						</a>
					</s>
				)}
			</div>
		);
	}
}

export default translate()(ArticleWidget);
