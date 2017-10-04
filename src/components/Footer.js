import React, { Component } from "react";
import moment from "moment";
import "./Footer.css";
import { EditLocation, Language } from "material-ui-icons";

export default class Footer extends Component {
	render() {
		const {
			onChangeLocation,
			onChangeLanguage,
			disableCountrySelector,
			questionLink,
		} = this.props;
		const year = moment().year();

		return (
			<footer className="Footer">
				<div className="light">
					<p>Can't find specific information?</p>
					<a href={questionLink}>
						<h3>Ask us a question</h3>
					</a>
				</div>
				<div className="dark">
					<div className="button-container">
						{!disableCountrySelector && (
							<div
								className="button left"
								onClick={onChangeLocation}
							>
								<div className="icon-container">
									<EditLocation />
								</div>
								<span>Change Location</span>
							</div>
						)}
						<div className="button" onClick={onChangeLanguage}>
							<div className="icon-container">
								<Language />
							</div>
							<span>Change Language</span>
						</div>
					</div>
					<span>Mission statement.</span>
					<img
						src="/google-play-badge.png"
						className="app-store-logo"
						alt="Get it on Google Play"
					/>
					<span className="padded">
						Part of the{" "}
						<a href="http://signpost.ngo">Signpost Project</a>.
						&copy; {year}.
					</span>
				</div>
			</footer>
		);
	}
}
