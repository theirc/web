// libs
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { translate } from "react-i18next";
import FacebookPlayer from "react-facebook-player";
import YouTube from "react-youtube";
import PropTypes from "prop-types";

// local
import instance from "../../../../backend/settings";
import "./ArticleWidget.css";

const NS = { ns: "CountryHome" };

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

    const whatsapp =
      instance.countries[country.fields.slug].thirdParty.whatsapp;
    const facebook =
      instance.countries[country.fields.slug].thirdParty.facebook.messenger;

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

    md.renderer.rules.link_open = (tokens, idx /*, options, env */) => {
      // var title = tokens[idx].title;
      return `<a href="${tokens[idx].href}?language=${language}" ${tokens[idx].title}>`;
    };

    const langLTR = ["ur", "fa", "ar"].indexOf(language) > -1;

    return (
      <div
        className={`Article ArticleWidget Home ${langLTR ? "asd" : "efg"}`}
        key={article.sys.id}
      >
        {hero && hero.fields && hero.fields.file && showHero && (
          <div className="hero">
            <img
              className="heroImage"
              src={article.fields.hero.fields.file.url}
              alt=""
            />
          </div>
        )}

        <div className={`${!showFullArticle ? "text-container" : ""}`}>
          <div
            className={`${!showFullArticle ? "welcome-container" : ""} ${
              langLTR ? "welcome-container-ltr" : ""
            }`}
          >
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

            <p dangerouslySetInnerHTML={{ __html: md.render(content) }} />

            {!showFullArt && (
              <s className="Read-More-lead">
                <Link
                  to={`/${country.fields.slug}/${categorySlug}/${article.fields.slug}?language=${language}`}
                >
                  {t("global.Read More", NS)}
                </Link>
                {/* <i className="material-icons">arrow_right</i> */}
              </s>
            )}
          </div>
          {!showFullArt && (whatsapp || facebook) && (
            <div className="social-media-container">
              {whatsapp && (
                <div className={`whatsapp-container ${!facebook ? 'only' : ''}`}>
                  <div className="icon-container">
                    <i className="fa fa-whatsapp" />
                  </div>
                  <h1>WhatsApp</h1>
                  <span>{t("social.Whatsapp", NS)}</span>
                  <a target="blank" href={whatsapp}>
                    WHATSAPP
                  </a>
                </div>
              )}
              {facebook && (
                <div className={`facebook-container ${!whatsapp ? 'only' : ''}`}>
                  <div className="icon-container">
                    <i className="fa fa-facebook" />
                  </div>
                  <h1>Facebook Messenger</h1>
                  <span>{t("social.Facebook", NS)}</span>
                  <a target="blank" href={facebook}>
                    FACEBOOK
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
                {/* <i className="material-icons">arrow_right</i> */}
              </s>
            )}
        </div>
      </div>
    );
  }
}

export default translate()(ArticleWidget);
