// libs
import React, { Component } from "react";
import { Link } from "react-router-dom";
import _ from "lodash";
import { translate } from "react-i18next";

// local
import "./TopCategoriesWidget.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NS = { ns: "CountryHome" };

class TopCategoriesWidget extends Component {
  render() {
    let articleFunc = (category) =>
      category.fields.overview || _.first(category.fields.articles);
    const { country, t, categories, language } = this.props;
    const langRTL = ["ur", "fa", "ar"].indexOf(language) > -1;

    
    /*jshint ignore:start*/
    /*eslint-disable*/
    
    return (
      <div className="TopCategories TopCategoriesWidget">
        <div className="top-container">
          <div className={`title-line ${langRTL ? "rtl" : "ltr"}`}></div>

          <h3>{t("top.Top Categories", NS)}</h3>
        </div>

        <div className="categories-container">
          {categories.map((c) => {
            let categoryIcon = c.fields.iconClass.replace('fa fa-','');
            let article = articleFunc(c);
            return (
              <Link
                key={c.sys.id}
                className="TopCategory"
                to={`/${country.fields.slug}/${c.fields.slug}?language=${language}`}
              >
                <div className="icon">
                  <FontAwesomeIcon icon={categoryIcon} />
                </div>
                <div className="text-container">
                  <h1 className="TopCategory-title">{c.fields.name}</h1>
                  <span className="TopCategory-description">
                    {c.fields.description}
                  </span>
                </div>
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
