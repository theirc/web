// libs
import React, { Component } from "react";
import ReactDOM from "react-dom"
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import * as clipboard from "clipboard-polyfill";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import InstagramEmbed from 'react-instagram-embed';
import { translate } from "react-i18next";
import 'lazysizes'

// local
import { history } from "../../../shared/redux/store";
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import instance from '../../../backend/settings';
import fbHelper from '../../../helpers/facebook';
import "../../../components/ActionsBar/ActionsBar.css";
import "./ArticleDetailBody.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/pro-regular-svg-icons";
import { faFacebookF } from "@fortawesome/free-brands-svg-icons";

const NS = { ns: 'ArticleDetail' };

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
			} else {
				// eslint-disable-next-line
				anchor.href = "#";
			}

			anchor.onclick = (e) => {
				e.preventDefault();
				onNavigate(href);
				return false;
			};
		}
	}

	componentDidMount() {
		this.injectVideoPlaceholders();
		this.replaceLinks();
		const ReadSpeaker = window.ReadSpeaker;
		const rspkr = window.rspkr;
		ReadSpeaker.init();
		ReadSpeaker.q(function () { rspkr.ui.addClickEvents(); });
	}


	componentDidUpdate() {
		this.injectVideoPlaceholders();
		this.replaceLinks();
	}

	componentWillUnmount() {
		const ReadSpeaker = window.ReadSpeaker;
		const rspkr = window.rspkr;
		ReadSpeaker.q(function () { if (rspkr.ui.getActivePlayer()) { rspkr.ui.getActivePlayer().close(); } });
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
		const url = encodeURIComponent(window.location.href);
		let lang = ''

		const updatedDate = new Date(article.sys.updatedAt)

		let appendLeadingZeroes = (n) => {
			if(n <= 9) {
				return "0" + n;
			}
			return n
		}

		const updatedAtDate = `${updatedDate.getFullYear()}.${appendLeadingZeroes(updatedDate.getMonth() + 1)}.${appendLeadingZeroes(updatedDate.getDate())}`

		switch (language) {
			case 'en':
				lang = 'en_uk';
				break;
			case 'ar':
				lang = 'ar_ar';
				break;
			case 'fr':
				lang = 'fr_be';
				break;
			case 'fa':
				lang = 'fa_ir';
				break;
			default:
				lang = '';
				break;
		}

		let html = md.render(content || lead);
		html = html.replace(/(\+[0-9]{9,14}|00[0-9]{9,15})/g, `<a class="tel" href="tel:$1">$1</a>`);

		let country = article.fields.country.fields.slug;

		let categorySlug = document.location.pathname.split('/')[2];
		let categoryIcon = article.fields.category.fields.iconClass.replace('fa fa-','');
		return (
			<div ref={r => (this._ref = r)} id="articleDetailBody" className={["ArticleDetailBody", loading ? "loading" : "loaded"].join(" ")}>
				<Helmet>
					<title>{title}</title>
				</Helmet>

				<HeaderBar subtitle={(category.fields.articles || []).length > 1 && `${category.fields.name}:`} title={title} />

				{hero && hero.fields && hero.fields.file &&
					<div>
						<div className="hero">
							<img data-src={hero.fields.file.url} alt="hero-image" className="lazyload" />
						</div>
						{hero.fields.description && <credit>{hero.fields.description}</credit>}
					</div>
				}

				<div className='ActionsBar'>
					<div className='left'>
						{article && article.fields && article.fields.category && article.fields.category.fields && 
							<div className='btn' onClick={() => country ? history.push(`/${country}/${categorySlug}`) : history.goBack()}>
								<FontAwesomeIcon icon="chevron-left" className="arrow-left" />
								<FontAwesomeIcon icon={categoryIcon} />
								<span>{article.fields.category.fields.name}</span>
							</div>
						}
						{!(article && article.fields && article.fields.category && article.fields.category.fields) && <span style={{ visibility: 'hidden' }}></span>}
					</div>

					<div className="social">
						<div href='#' className="social-btn" onClick={() => fbHelper.share(language)}><FontAwesomeIcon icon={faFacebookF} /></div>

						<div href='#' className="social-btn" onClick={this.onCopyLink}>
							{!this.state.copied ? <FontAwesomeIcon icon="link" /> : <FontAwesomeIcon icon={faCopy} />}
							{this.state.copied && <span className='copied'>{t('actions.Copied', NS)}</span>}
						</div>
					</div>
				</div>

				{contentType.sys.id === "video" && this.renderVideo()}

				<article>
					{instance.brand.url === "refugee.info" && lang.length > 0 &&
						<div id="readspeaker_button1" className="rs_skip rsbtn rs_preserve">
							<a rel="nofollow" className="rsbtn_play" accessKey="L" title="ReadSpeaker webReader إستمع إلى هذه الصفحةِ مستخدماً" href={`//app-eu.readspeaker.com/cgi-bin/rsent?customerid=11950&amp;lang=${lang}&amp;readid=articleDetailBody&amp;url=${url}`}>
								<span className="rsbtn_left rsimg rspart"><span className="rsbtn_text"><span>Listen</span></span></span>
								<span className="rsbtn_right rsimg rsplay rspart"></span>
							</a>
						</div>
					}
					<div id="maincontent">
						<span className='author'><span>{t("actions.LAST_UPDATED", NS)}</span> {updatedAtDate}</span>
						<div dangerouslySetInnerHTML={{ __html: html }} />
					</div>
				</article>
			</div>
		);
	}
}

export default translate()(ArticleDetailBody);
