// libs
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { withTranslation } from "react-i18next";

// local
import "./CategoryWidget.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Markdown from "markdown-to-jsx";

const NS = { ns: 'CountryHome' };
class CategoryWidget extends Component {
	render() {
		const { country, t, c } = this.props;
		let article = c.fields.overview || c.fields.articles[0];

		return (
			<div className="Category CategoryWidget">
				<h3>{c.fields.name}</h3>
				<Markdown>{c.fields.description}</Markdown>
				<s className='Read-More'>
					<Link to={`/${country.fields.slug}/${c.fields.slug}/${article.fields.slug}?language=en`}>{t("global.Read More", NS)}</Link>
					<FontAwesomeIcon icon="arrow-right" />
				</s>
			</div>
		)
	}
}

export default withTranslation()(CategoryWidget);
