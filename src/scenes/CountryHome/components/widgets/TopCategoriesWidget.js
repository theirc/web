// libs
import React, { Component } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";
import { translate } from "react-i18next";

// local
import "./TopCategoriesWidget.css";

const NS = { ns: "CountryHome" };

class TopCategoriesWidget extends Component {
  render() {
    let articleFunc = (category) =>
      category.fields.overview || _.first(category.fields.articles);
    const { country, t, categories, language } = this.props;
    /*jshint ignore:start*/
    /*eslint-disable*/

    return (
      <div className="TopCategories TopCategoriesWidget">
        <div className="top-container">
          <div className="title-line"></div>

          <h3>{t("top.Top Categories", NS)}</h3>
        </div>

        <div className="categories-container">
          {categories.map((c) => {
            let article = articleFunc(c);
            return (
              <Link
                key={c.sys.id}
                className="TopCategory"
                to={`/${country.fields.slug}/${c.fields.slug}?language=${language}`}
              >
                <div className="icon">
                  <i className={c.fields.iconClass || "material-icons"}>
                    {c.fields.iconText ||
                      ((!c.fields.iconClass ||
                        c.fields.iconClass === "material-icons") &&
                        "add")}
                  </i>
                </div>
                <span>{c.fields.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="read-more-container">
          <s className="Read-More">
            <Link to={`/${country.fields.slug}/categories`}>
              {t("global.See More", NS)}
            </Link>
          </s>
        </div>
      </div>
    );
  }
}

export default translate()(TopCategoriesWidget);
