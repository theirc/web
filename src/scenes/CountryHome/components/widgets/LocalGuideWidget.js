// libs
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { translate } from "react-i18next";
import _ from "lodash";

// local
import "./LocalGuideWidget.css";

const NS = { ns: "CountryHome" };

class LocalGuideWidget extends Component {
  state = {
    guideItemsRendered: [],
    showMore: false,
  };

  componentDidMount() {
    const { guideItems } = this.props;
    let guideItemsRendered = [];

    if (guideItems.length > 3) {
      guideItemsRendered = guideItems.slice(0, 3);
      this.setState({
        guideItemsRendered,
        showMore: true,
      });
    }
  }

  handleRenderMoreItems = () => {
    const { guideItems } = this.props;
    let { guideItemsRendered } = this.state;
    let tmpGuideItems = guideItemsRendered.concat(guideItems.slice(3));
    guideItemsRendered = tmpGuideItems;
    this.setState({ guideItemsRendered, showMore: false });
  };

  render() {
    const { country, language, t } = this.props;
    const { guideItemsRendered, showMore } = this.state;

    /*jshint ignore:start*/
    /*eslint-disable*/
    return (
      <div className="LocalGuide LocalGuideWidget">
        <div className="top-container">
          <div className="title-line"></div>
          <h3>{t("guide.Local Guide", NS)}</h3>
        </div>

        <div className="Container">
          {guideItemsRendered.map((c, i) => (
            <div key={c.sys.id} className={`LocalGuideItem item-${i}`}>
              <Link
                className="Overlay"
                to={`${c.fields.url}?language=${language}`}
              >
                {_.has(c, "fields.backgroundImage.fields.file.url") && (
                  <img src={c.fields.backgroundImage.fields.file.url} />
                )}
                <span style={{ position: "absolute" }}>{c.fields.title}</span>
                {/* {c.fields.iconClass && <i className={c.fields.iconClass}></i>} */}
              </Link>
            </div>
          ))}
        </div>
        <div className="read-more-container">
          <s className="Read-More">
            {showMore && (
              <s className="Read-More">
                <a onClick={() => this.handleRenderMoreItems()}>
                  {t("global.See More", NS)}
                </a>
              </s>
            )}
            {!showMore && (
              <Link to={`/${country.fields.slug}/services`}>
                {t("global.See More", NS)}
              </Link>
            )}
          </s>
        </div>
      </div>
    );
  }
}

export default translate()(LocalGuideWidget);
