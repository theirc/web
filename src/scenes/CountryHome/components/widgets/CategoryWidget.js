// libs
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import _ from "lodash";
import { translate } from "react-i18next";

// local
import "./CategoryWidget.css";

const NS = { ns: 'CountryHome' };

const Remarkable = require("remarkable");
const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class CategoryWidget extends Component {
	render() {
		const { country, t, c } = this.props;
		let html = md.render(c.fields.description);
		let article = c.fields.overview || _.first(c.fields.articles);

		return (
			<div className="Category CategoryWidget">
				<h3>{c.fields.name}</h3>
				<p dangerouslySetInnerHTML={{ __html: html }} />
				<s className='Read-More'>
					<Link to={`/${country.fields.slug}/${c.fields.slug}/${article.fields.slug}?language=en`}>{t("global.Read More", NS)}</Link>
					<i className="material-icons">arrow_right</i>
				</s>
			</div>
		)
	}
}

export default translate()(CategoryWidget);
