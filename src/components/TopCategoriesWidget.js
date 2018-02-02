import React, { Component } from "react";
import _ from "lodash";
import { translate } from "react-i18next";
import "./TopCategoriesWidget.css";

class TopCategoriesWidget extends Component {
    render(){
        let articleFunc = category => category.fields.overview || _.first(category.fields.articles);
        const { country, onNavigate, t, categories} = this.props;

        /*jshint ignore:start*/
        /*eslint-disable*/
        return (
            <div className="TopCategories">
                <s>
                    <a
                        href="#"
                        onClick={() => {
                            onNavigate(`/categories`);
                            return false;
                        }}
                    >
                        {t("See More")}
                    </a>
                </s>
                <h3>{t("Top Categories")}</h3>
                {categories.map(c => {
                    let article = articleFunc(c);
                    return (
                        <div key={c.sys.id} className="TopCategory" onClick={() => onNavigate(`/${c.fields.slug}/${article.fields.slug}`)}>
                            <div className="icon">
                                <i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "add")}</i>
                            </div>
                            {c.fields.name}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default translate()(TopCategoriesWidget);