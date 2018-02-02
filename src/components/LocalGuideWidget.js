import React, { Component } from "react";
import { translate } from "react-i18next";
import "./LocalGuideWidget.css";

class LocalGuideWidget extends Component {
	render() {
		const { onNavigate, t, guideItems } = this.props;

		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<div className="LocalGuide">
				<s>
					<a
						href="#"
						onClick={() => {
							onNavigate(`/services`);
							return false;
						}}
					>
						{t("See More")}
					</a>
				</s>
				<h3>{t("Local Guide")}</h3>
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
								return onNavigate(c.fields.url);
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
