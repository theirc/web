// libs
import React, { Component } from "react";
import _ from "lodash";
import { translate } from "react-i18next";

// local
import "./TopCategoriesWidget.css";

const NS = { ns: 'CountryHome' };

class TopCategoriesWidget extends Component {

	render() {
		let articleFunc = category => category.fields.overview || _.first(category.fields.articles);
		const { country, onNavigate, t, categories, language } = this.props;
		/*jshint ignore:start*/
		/*eslint-disable*/

		return (
			<div className="TopCategories TopCategoriesWidget">
				<s className='Read-More'>
					<a
						href="#/"
						onClick={() => {
							onNavigate(`/${country.fields.slug}/categories`);
							return false;
						}}
					>
						{t("global.See More", NS)}
					</a>
					<i className="material-icons">arrow_right</i>
				</s>

				<h3>{t("top.Top Categories", NS)}</h3>

				<div className="title-line"></div>

				{categories.map(c => {
					let article = articleFunc(c);
					return (
						<div key={c.sys.id} className="TopCategory" onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${article.fields.slug}?language=${language}`)}>
							<div className="icon">
								<i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "add")}</i>
							</div>
							<span>{c.fields.name}</span>
						</div>
					);
				})}
			</div>
		);
	}
}

export default translate()(TopCategoriesWidget);
