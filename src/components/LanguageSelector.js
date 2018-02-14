import React, { Component } from "react";
import { translate } from "react-i18next";

import "./LanguageSelector.css";
import getSessionStorage from "../shared/sessionStorage";

class LanguageSelector extends Component {
	static propTypes = {};

	componentDidMount() {
		if (global.window) {
			const sessionStorage = getSessionStorage();

			delete sessionStorage.country;
			delete sessionStorage.dismissedNotifications;
		}
	}

	render() {
		const { languages, onSelectLanguage, t } = this.props;
		return (
			<div className="LanguageSelector">
				<div className="spacer"/>
				<div className="text">
					<i className="material-icons">translate</i>
					{languages.map((c, i) => <h1 key={`choose-${c[0]}`}>{t("Choose your language", { lng: c[0] })}</h1>)}
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
				<div className="spacer" />

			</div>
		);
	}
}

export default translate()(LanguageSelector);
