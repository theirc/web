// libs
import React, { Component } from "react";
import ReactDOM from "react-dom"
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import * as clipboard from "clipboard-polyfill";
import { LibraryBooks, Link } from "material-ui-icons";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import InstagramEmbed from 'react-instagram-embed';
import { translate } from "react-i18next";
import _ from 'lodash';

// local
import { history } from "../../../shared/redux/store";
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import instance from '../../../backend/settings';
import fbHelper from '../../../helpers/facebook';
import "../../../components/ActionsBar/ActionsBar.css";
import "./ArticleDetailBody.css";

const NS = { ns: 'ArticleDetail' };

const moment = global.moment;
const Remarkable = require("remarkable");
const IG_URL = "https://instagr.am/p/";
const md = new Remarkable("full", {
	html: true,
	linkify: true,
	breaks: true,
});

/**
 * @class
 * @description 
 */
class ArticleDetailBody extends Component {
	state = {
		copied: false
	}

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

	componentDidMount() {
		this.injectVideoPlaceholders();
		this.replaceLinks();
	}

	componentDidUpdate() {
		this.injectVideoPlaceholders();
		this.replaceLinks();
	}

	renderVideo() {
		const { article } = this.props;
		const { url } = article.fields;
		const APP_ID = instance.thirdParty.facebook.appId;

		if (/facebook.com/.test(url)) {
			let videoId = url.replace(/.*facebook.com\/.*\/videos\/(.*)\/.*/, "$1");
			return <FacebookPlayer className={"Facebook"} videoId={videoId} appId={APP_ID} />;
		} else if (/youtube.com/) {
			let videoId = url.replace(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/, "$7");
			return <YouTube videoId={videoId} className={"YouTube"} />;
		}

		return null;
	}

	injectVideoPlaceholders() {
		const APP_ID = instance.thirdParty.facebook.appId;

		Array.from(document.getElementsByClassName('YouTubePlayer') || []).forEach(e => {
			var videoId = e.getAttribute('videoId');
			ReactDOM.render(<YouTube videoId={videoId} className={"YouTube"} />, e);
		});

		Array.from(document.getElementsByClassName('FacebookPlayer') || []).forEach(e => {
			var videoId = e.getAttribute('videoId');
			var width = e.getAttribute('width');
			ReactDOM.render(<FacebookPlayer width={width || undefined} className={"Facebook"} videoId={videoId} appId={APP_ID} />, e);
		});

		Array.from(document.getElementsByClassName('InstagramPlayer') || []).forEach(e => {
			var videoId = e.getAttribute('videoId');
			ReactDOM.render(<InstagramEmbed className={"Instagram"} url={`${IG_URL}${videoId}`} />, e);
		});
	}

	onCopyLink = () => {
		this.setState({ copied: true });
		clipboard.writeText(document.location.href);
		setTimeout(() => this.setState({ copied: false }), 1500);
	}

	render() {
		const { article, category, language, loading, t } = this.props;
		const { title, content, hero, lead } = article.fields;
		const { contentType } = article.sys;

		let html = md.render(content || lead);
		html = html.replace(/(\+[0-9]{9,14}|00[0-9]{9,15})/g, `<a class="tel" href="tel:$1">$1</a>`);

		let country = _.get(article, 'fields.country.fields.slug');

		let categorySlug = document.location.pathname.split('/')[2];
		return (
			<div ref={r => (this._ref = r)} className={["ArticleDetailBody", loading ? "loading" : "loaded"].join(" ")}>
				<Helmet>
					<title>{title}</title>
				</Helmet>

				<HeaderBar subtitle={(category.fields.articles || []).length > 1 && `${category.fields.name}:`} title={title} />

				{_.has(hero, 'fields.file') &&
					<div>
						<div className="hero">
							<img src={hero.fields.file.url} alt="" />
						</div>
						{hero.fields.description && <credit>{hero.fields.description}</credit>}
					</div>
				}

				<div className='ActionsBar'>
					<div className='left'>
						{_.has(article, 'fields.category.fields') &&
							<div className='btn' onClick={() => country ? history.push(`/${country}/${categorySlug}`) : history.goBack()}>
								<i className="material-icons">keyboard_arrow_left</i>
								<i className={article.fields.category.fields.iconClass || "material-icons"}>{article.fields.category.fields.iconText || ((!article.fields.category.fields.iconClass || article.fields.category.fields.iconClass === "material-icons") && "add")}</i>
								<span>{article.fields.category.fields.name}</span>
							</div>
						}
						{!_.has(article, 'fields.category.fields') && <span style={{visibility: 'hidden'}}></span>}
					</div>

					<div className="social">
						<div href='#' className="social-btn" onClick={() => fbHelper.share(language)}><i className="fa fa-facebook-f" /></div>

						<div href='#' className="social-btn" onClick={this.onCopyLink}>
							{!this.state.copied ? <Link /> : <LibraryBooks />}
							{this.state.copied && <span className='copied'>{t('actions.Copied', NS)}</span>}
						</div>
					</div>
				</div>

				{contentType.sys.id === "video" && this.renderVideo()}

				<article>
					<span className='author'><span>{t("actions.LAST_UPDATED", NS)}</span> {moment(article.sys.updatedAt).format('YYYY.MM.DD')}</span>
					<div dangerouslySetInnerHTML={{ __html: html }} />
				</article>
			</div>
		);
	}
}

export default translate()(ArticleDetailBody);
