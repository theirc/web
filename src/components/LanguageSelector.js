import React, { Component } from "react";
import { translate } from "react-i18next";

import "./LanguageSelector.css";

class LanguageSelector extends Component {
	static propTypes = {};

	componentDidMount() {
		if (global.window) {
			delete global.window.sessionStorage.country;
			delete global.window.sessionStorage.dismissedNotifications;
		}
	}

	render() {
		const { languages, onSelectLanguage, t } = this.props;
		return (
			<div className="LanguageSelector">
				<div className="spacer" />
				<div className="text">
					<i className="material-icons">translate</i>
					{languages.map((c, i) => <h1>{t("Choose your language", { lng: c[0] })}</h1>)}
				</div>
				<div className="spacer" />
				{languages.map((c, i) => (
					<button
						className="item "
						key={i}
						onClick={() => {
							onSelectLanguage(c[0]);
						}}
					>
						{c[1]}
					</button>
				))}
				<div className="bottom" />
			</div>
		);
	}
}

export default translate()(LanguageSelector);
