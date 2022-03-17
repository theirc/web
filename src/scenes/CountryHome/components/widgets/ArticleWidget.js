// libs
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import 'lazysizes'

// local
import instance from "../../../../backend/settings";
import "./ArticleWidget.css";
import Markdown from "markdown-to-jsx";

const NS = { ns: "CountryHome" };

class ArticleWidget extends Component {
  static contextTypes = {
    config: PropTypes.object,
  };

  renderVideo(article) {
    const { url } = article.fields;
    const APP_ID = instance.thirdParty.facebook.appId;

    if (/facebook.com/.test(url)) {
      let videoId = url.replace(/.*facebook.com\/.*\/videos\/(.*)\/.*/, "$1");
      return (
        <FacebookPlayer
          className={"Facebook"}
          videoId={videoId}
          appId={APP_ID}
        />
      );
    } else if (/youtube.com/) {
      let videoId = url.replace(
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
        "$7"
      );
      return <YouTube videoId={videoId} className={"YouTube"} />;
    }

    return null;
  }

  render() {
    const {
      country,
      onNavigate,
      t,
      article,
      category,
      showHero,
      showFullArticle,
      language,
    } = this.props;

    const whatsapp = instance.countries[country.fields.slug].thirdParty.whatsapp && (instance.countries[country.fields.slug].thirdParty.whatsapp[language] || instance.countries[country.fields.slug].thirdParty.whatsapp['en']);
    const facebook = instance.countries[country.fields.slug].thirdParty.facebook.messenger;

    if (!article) {
      // Anti pattern, but saves 1 or more ifs.
      return null;
    }

    let categorySlug = "article";
    if (category) {
      categorySlug = category.fields.slug;
    }

    let content = showFullArticle
      ? article.fields.content
      : article.fields.lead;
    let showFullArt = showFullArticle;
    const { contentType } = article.sys;

    if (contentType.sys.id === "video") {
      content = article.fields.lead;
      showFullArt = true;
    }
    let hero = article.fields.hero;

    const langRTL = ["ur", "fa", "ar", "ps", "fa-AF"].indexOf(language) > -1;

    return (
      <div className={`Article ArticleWidget Home`} key={article.sys.id}>
        {hero?.fields?.file && showHero && (
          <div className="hero">
            <img
              className="heroImage lazyload"
              data-src={article.fields.hero.fields.file.url}
              alt="hero"
            />
          </div>
        )}

        <div
          className={`${!showFullArticle ? "text-container" : "faq-container"}`}
        >
          <div className={`${!showFullArticle ? "welcome-container" : ""} ${(!facebook || !whatsapp) ? "only" : ""}`}>
            {showFullArt ? (
              <h1>{article.fields.title}</h1>
            ) : (
              <h1
                onClick={() =>
                  onNavigate(
                    `/${country.fields.slug}/${categorySlug}/${article.fields.slug}`
                  )
                }
              >
                {article.fields.title}
              </h1>
            )}

            {contentType.sys.id === "video" && this.renderVideo(article)}

            <Markdown className={`${showFullArt ? "faq" : "header"}`}>{content}</Markdown>

            {!showFullArt && (
              <s className="Read-More-lead">
                <Link
                  to={`/${country.fields.slug}/${categorySlug}/${article.fields.slug}?language=${language}`}
                >
                  {t("global.Read More", NS)}
                </Link>
              </s>
            )}
          </div>
          {!showFullArt && (whatsapp || facebook) && (
            <div className="social-media-container">
              {whatsapp && (
                <div
                  className={`whatsapp-container ${!facebook ? "only" : ""} ${
                    langRTL ? "rtl" : "ltr"
                  }`}
                >
                  <div className="icon-container">
                    <div className="icon-background">
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </div>
                  </div>
                  <h1 className="social-title">{t("social.Whatsapp Title", NS)}</h1>
                  <span className="social-text">
                    {t("social.Whatsapp", NS)}
                  </span>
                  <a target="blank" href={whatsapp}>
                    {t("social.Whatsapp Button", NS)}
                  </a>
                </div>
              )}
              {facebook && (
                <div
                  className={`facebook-container ${!whatsapp ? "only" : ""} ${
                    langRTL ? "rtl" : "ltr"
                  }`}
                >
                  <div className="icon-container">
                    <div className="icon-background">
                      <FontAwesomeIcon icon={faFacebookF} />
                    </div>
                  </div>
                  <h1 className="social-title">{t("social.Facebook Title", NS)}</h1>
                  <span className="social-text">
                    {t("social.Facebook", NS)}
                  </span>
                  <a target="blank" href={facebook}>
                    {t("social.Facebook Button", NS)}
                  </a>
                </div>
              )}
            </div>
          )}
          {!showFullArt && (
            <s className="Read-More-secondary">
              <Link
                to={`/${country.fields.slug}/${categorySlug}/${article.fields.slug}?language=${language}`}
              >
                {t("global.Read More", NS)}
              </Link>
            </s>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation()(ArticleWidget);
