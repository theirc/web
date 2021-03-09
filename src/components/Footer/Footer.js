// libs
import React, { Component } from "react";
import { translate } from "react-i18next";

// local
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
import languages from './languages';
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/pro-solid-svg-icons";

const NS = { ns: 'Footer' };

/**
 * @class
 * @description 
 */
class Footer extends Component {
	state = {
		copied: false
	}

	constructor() {
		super();
		i18nHelpers.loadResource(languages, NS.ns);
	}	
	
	// onCopyLink = () => {
	// 	this.setState({ copied: true });
	// 	clipboard.writeText(document.location.href);
	// 	setTimeout(() => this.setState({ copied: false }), 1500);
	// }

	render() {
		const { country, t } = this.props;
		const questionLink = !!(country.fields && country.fields.slug) && instance.countries[country.fields.slug].questionLink;
		const showLinkToAdministration = !!(country.fields && country.fields.slug)  && instance.countries[country.fields.slug].switches.showLinkToAdministration;
		const year = new Date().getFullYear();

		return (
			<footer className="Footer">
				<div className="dark">
					<span className="padded Signpost" style={{ direction: "ltr" }}>
						<span>
							{t("dark.Part of the ", NS)}{" "}
							<a href="http://www.signpost.ngo" target="_blank" rel="noopener noreferrer">
								{" "}
								Signpost Project
							</a>
							&nbsp;&copy; {year}.
						</span>
					</span>

					{showLinkToAdministration &&
						<span>
							<a href="http://admin.cuentanos.org" target="blank" className="administration-button">
								Administración
							</a>
						</span>
					}
				</div>
				<div className="light">
					<p>{t("light.Can't find specific information?", NS)}</p>
					<div className="link-container">
					<a href={questionLink}>
						<FontAwesomeIcon icon={faQuestionCircle} />
						<h3>{questionLink.includes('mailto: ') ? questionLink.replace('mailto: ', '') : t("light.Ask us a question", NS)}</h3>
					</a>
					</div>
				</div>
			</footer>
		);
	}
}

export default translate()(Footer);
