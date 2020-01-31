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
					{guideItems.map(c => {
						let image =
							c.fields.backgroundImage && c.fields.backgroundImage.fields.file ? (
								<img alt={c.fields.title} src={`${c.fields.backgroundImage.fields.file.url}?fm=jpg&fl=progressive`} />
							) : (
									<img alt={c.fields.title} src="https://upload.wikimedia.org/wikipedia/en/4/48/Blank.JPG" />
							);

						return (
							<div key={c.sys.id} className="LocalGuideItem">
								{image}
								<Link className="Overlay" to={`${c.fields.url}?language=${language}`}>
									{c.fields.title}
								</Link>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

export default translate()(LocalGuideWidget);
