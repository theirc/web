// libs
import React, { Component } from "react";
import { translate } from "react-i18next";

// local
import "./LocalGuideWidget.css";

const NS = { ns: 'CountryHome' };

class LocalGuideWidget extends Component {

	render() {
		const { country, language, onNavigate, t, guideItems } = this.props;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<div className="LocalGuide LocalGuideWidget">
				<s className='Read-More'>
					<a
						href="#/"
						onClick={() => {
							onNavigate(`/${country.fields.slug}/services`);
							return false;
						}}
					>
						{t("global.See More", NS)}
					</a>
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
						let link = c => {
							if (c.fields.url.indexOf("/") === 0) {
								return onNavigate(`${c.fields.url}?language=${language}`);
							} else {
								return (global.document.location = c.fields.url);
							}
						};

						return (
							<div key={c.sys.id} className="LocalGuideItem">
								{image}
								<div className="Overlay" onClick={link.bind(null, c)}>
									{c.fields.title}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

export default translate()(LocalGuideWidget);
