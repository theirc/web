// libs
import React, { Component } from "react";
import { translate } from "react-i18next";

// local
import "./LanguageSelector.css";
import getSessionStorage from "../../../shared/sessionStorage";

const NS = { ns: 'Selectors' };

/**
 * @class
 * @description 
 */
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

				<div className="text">
					<i className="material-icons">translate</i>
					{languages.map((c, i) => <h1 key={`choose-${c[0]}`}>{t("language.Choose your language", { lng: c[0], ns: NS.ns })}</h1>)}
					<div className="p-t-20" />
				</div>

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
