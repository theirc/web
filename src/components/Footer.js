import React, { Component } from "react";
import moment from "moment";
import "./Footer.css";
import { MyLocation } from "material-ui-icons";
import { translate } from "react-i18next";

class Footer extends Component {
	render() {
		const { onChangeLocation, onChangeLanguage, disableCountrySelector, disableLanguageSelector, questionLink, t } = this.props;
		// const {deviceType,} = this.props;
		const year = moment().year();

		return (
			<footer className="Footer">
				<div className="light">
					<p>{t("Can't find specific information?")}</p>
					<a href={questionLink}>
						<h3>{t("Ask us a question")}</h3>
					</a>
				</div>
				<div className="dark">
					{(!disableCountrySelector || !disableLanguageSelector) && (
						<div className="button-container">
							{!disableCountrySelector && (
								<div className="button left" onClick={onChangeLocation}>
									<div className="icon-container">
										<MyLocation />
									</div>
									<span>{t("Change Location")}</span>
								</div>
							)}
							{!disableLanguageSelector && (
								<div className="button" onClick={onChangeLanguage}>
									<div className="icon-container">
										<i className="material-icons">translate</i>
									</div>
									<span>{t("Change Language")}</span>
								</div>
							)}
						</div>
					)}
					{/*
					<span>Mission statement.</span>
					{deviceType === "Android" && <img src={`/google-play-badge.png`} className="app-store-logo" alt="Get it on Google Play" />}
					{deviceType === "iPhone" && <img src={`/app-store-badge.svg`} className="app-store-logo" alt="Get it on the App Store" />}
				*/}
					<span className="padded Signpost" style={{ direction: "ltr" }}>
						<span>{t("Part of the ")}</span>
						<a href="http://signpost.ngo">Signpost Project</a> &copy; <span>{year}</span>.
					</span>
					<div style={{ display: "none" }} onClick={onChangeLanguage}>
						<div className="icon-container">
							<svg id="lang-icn" viewBox="0 0 53 54">
								<defs>
									<clipPath id="clip-path">
										<path
											className="cls-1"
											d="M17.91,18.68,13.27,8.28,9,18.68Zm4,9.27-1.62-3.7H6.34l-1.66,3.7c-1.36,3.28-5.91.67-4.37-2.61L10.94,1.7c.94-2.31,3.65-2.23,4.67,0L26.43,25.34a3.13,3.13,0,0,1-1.21,4A2.72,2.72,0,0,1,21.87,27.95Z"
										/>
									</clipPath>
									<clipPath id="clip-path-2">
										<rect className="cls-1" x="-1288.43" y="-2272.44" width="1752" height="2667" />
									</clipPath>
									<clipPath id="clip-path-3">
										<path
											className="cls-1"
											d="M43.24,25.53A8.78,8.78,0,0,0,39,24.43c-3.11,0-6.19,1.86-6.19,2.43,0,.88,1,1.83,2.31,2.79A6.66,6.66,0,0,0,38.19,31c.83,0,4.19-1.56,9.95-3.47l.31.22a47.69,47.69,0,0,1-1.6,5c-9.7,2.92-15,6.34-15,9.16,0,3.44,5.23,6.45,14.29,6.45A43,43,0,0,0,53,47.78l.46.63a43.33,43.33,0,0,1-7.36,4.84,13.5,13.5,0,0,1-3.7.38c-7.61,0-13.61-3.12-13.61-10,0-2.93,1.33-5.93,4.37-9.08-2.31-1.48-3.94-3.23-3.94-5.52a8.78,8.78,0,0,1,1.6-4.73,8.14,8.14,0,0,1,6.59-3.88c2.62,0,4.84,1.48,6.71,4.21Z"
										/>
									</clipPath>
								</defs>

								<g className="cls-2">
									<g className="cls-3">
										<rect className="fill-clr" x="-5" y="-5" width="36.73" height="39.47" />
									</g>
								</g>
								<g className="cls-5">
									<g className="cls-3">
										<rect className="fill-clr" x="23.8" y="15.41" width="34.66" height="43.21" />
									</g>
								</g>
							</svg>
						</div>
						<span>{t("Change Language")}</span>
					</div>
				</div>
			</footer>
		);
	}
}

export default translate()(Footer);
