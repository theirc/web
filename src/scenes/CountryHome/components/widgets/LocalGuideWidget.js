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
    lastItem: false,
    showMore: false,
  };

  componentDidMount() {
    const { guideItems } = this.props;
    let guideItemsRendered = [];

    if (guideItems.length > 3) {
      let lastItem = guideItems.length % 2 === 0;
      guideItemsRendered = guideItems.slice(0, 3);
      this.setState({
        guideItemsRendered,
        lastItem,
        showMore: true,
      });
    } else {
      this.setState({
        guideItemsRendered: guideItems
      })
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
    const { country, language, t, guideItems } = this.props;
    const { guideItemsRendered, lastItem, showMore } = this.state;

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
            <div
              key={c.sys.id}
              className={`LocalGuideItem item-${i} ${
                lastItem && i === guideItems.length - 1 ? "last-item" : ""
              } ${guideItems.length !== 2 && i === 0 ? "first-item" : ""}`}
            >
              <div className="Overlay">
                {_.has(c, "fields.backgroundImage.fields.file.url") && (
                  <img src={c.fields.backgroundImage.fields.file.url} />
                )}
                <div className="text-container">
                  <h1 className="title">{c.fields.title}</h1>
                  <span className="description">{typeof c.fields.description === 'string' ? c.fields.description : c.fields.description.content[0].content[0].value}</span>
                  <Link
                    className="see-more-article"
                    to={`${c.fields.url}?language=${language}`}
                  >
                    {t("global.See More", NS)}
                  </Link>
                </div>
                {/* {c.fields.iconClass && <i className={c.fields.iconClass}></i>} */}
              </div>
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
