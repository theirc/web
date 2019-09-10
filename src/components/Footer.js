import React, { Component } from "react";
import moment from "moment";
import { MyLocation, Translate, Share, Link } from "material-ui-icons";
import { translate } from "react-i18next";
import * as clipboard from "clipboard-polyfill";
import PropTypes from "prop-types";

import "./Footer.css";


class Footer extends Component {
	state = {
		copied: false
	}

	static contextTypes = {
		config: PropTypes.object,
	};

	onCopyLink = () => {
		this.setState({ copied: true });
		
		clipboard.writeText(document.location.href);

		setTimeout(() => this.setState({ copied: false }), 1500);
	}

	onShareOnFacebook = () => {
		const { language } = this.props
		if (global.window) {
			const { FB } = global.window;
			let { href } = window.location;
			console.log(FB, href)
			href += (href.indexOf("?") > -1 ? "&" : "?") + "language=" + language;

			if (FB) {
				FB.ui(
					{
						method: "share",
						href,
					},
					function (response) { }
				);
			}
		}
	}

	onFindOnFacebook = () => {
		
	}

	render() {
		const { onChangeLocation, onChangeLanguage, disableCountrySelector, disableLanguageSelector, questionLink, t, showLinkToAdministration, country, customQuestionLink, hideShareButtons } = this.props;
		// const {deviceType,} = this.props;
		const year = moment().year();
		let link = questionLink;

		const { config } = this.context;
		
		let configfbpage = (config.facebookPage || []).filter(c => c[0] === country.fields.slug);
		const fblink = configfbpage[0] ? configfbpage[0][1] : '';

		let result = (customQuestionLink || []).filter(c  => c[0] === country.fields.slug);
		if(result[0]){
			link = result[0][1];
		}

		const url = window.location.href;
		return (
			<footer className="Footer">
				<div className="light">
					<p>{t("Can't find specific information?")}</p>
					<a href={link}>
						<h3>{t("Ask us a question")}</h3>
					</a>
				</div>
				<div className="dark">
					
						<div className="button-container">
							{!disableCountrySelector && (
								<div className="button " onClick={onChangeLocation}>
									<div className="icon-container">
										<MyLocation />
									</div>
									<span>{t("Change Location")}</span>
								</div>
							)}
							{!disableLanguageSelector && (
								<div className="button " onClick={onChangeLanguage}>
									<div className="icon-container">
										<Translate />
									</div>

									<span>{t("Change Language")}</span>
								</div>
							)}
							{!hideShareButtons && 
							<div className="button button-desktop" onClick={this.onShareOnFacebook}>
								<div className="icon-container">
									<Share />
								</div>

								<span>{t("Share on Facebook")}</span>
							</div>
							}
							{!hideShareButtons && 
							<div className="button button-desktop" onClick={this.onCopyLink}>
								<div className="icon-container">
									<Link />
								</div>
								<span>{this.state.copied ? t("Copied") : t("Copy Link")}</span>
							</div>
							}
							{fblink && 
							<div className="button " onClick={() => window.open(fblink) }>
								<div className="icon-container">
								<i className="fa fa-facebook-f" style={{ fontSize: 24 }}/>
								</div>

								<span>{t("Find us on Facebook")}</span>
							</div>
							}
						</div>
					
					{/*
					<span>Mission statement.</span>
					{deviceType === "Android" && <img src={`/google-play-badge.png`} className="app-store-logo" alt="Get it on Google Play" />}
					{deviceType === "iPhone" && <img src={`/app-store-badge.svg`} className="app-store-logo" alt="Get it on the App Store" />}
				*/}
					<span className="padded Signpost" style={{ direction: "ltr" }}>
						<span>
							{t("Part of the ")}{" "}
							<a href="http://www.signpost.ngo" target="_blank" rel="noopener noreferrer">
								{" "}
								Signpost Project
							</a>{" "}
							&copy; {year} .
						</span>
					</span>
					{showLinkToAdministration && (
						<span>
							<a href="http://admin.cuentanos.org" target="blank" className="administration-button">
								Administración
							</a>
						</span>
					)}
					<div style={{ display: "none" }} onClick={onChangeLanguage}>
						<span>{t("Change Language")}</span>
					</div>
				</div>
			</footer>
		);
	}
}

export default translate()(Footer);
