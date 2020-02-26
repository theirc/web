// libs
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { translate } from "react-i18next";

// local
import "./LocalGuideWidget.css";

const NS = { ns: 'CountryHome' };

class LocalGuideWidget extends Component {

	render() {
		const { country, language, t, guideItems } = this.props;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<div className="LocalGuide LocalGuideWidget">
				
				<s className='Read-More'>
					<Link to={`/${country.fields.slug}/services`}>{t("global.See More", NS)}</Link>
					<i className="material-icons">arrow_right</i>
				</s>

				<h3>{t("guide.Local Guide", NS)}</h3>

				<div className="Container">
				{guideItems.map(c => (
					<div key={c.sys.id} className="LocalGuideItem">
						<Link className="Overlay" to={`${c.fields.url}?language=${language}`}>
							{c.fields.iconClass && <i className={c.fields.iconClass}></i>}
							{c.fields.title}
						</Link>
					</div>
				))}
				</div>
			</div>
		);
	}
}

export default translate()(LocalGuideWidget);
