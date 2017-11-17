import React, { Component } from "react";
import PropTypes from "prop-types";
import { NavigateBefore, NavigateNext, Share, ModeEdit } from "material-ui-icons";
import { translate } from "react-i18next";

import "./ArticleFooter.css";

/**
 * 
 */
class ArticleFooter extends Component {
	static propTypes = {
		onNavigateTo: PropTypes.func,
		country: PropTypes.object,
		direction: PropTypes.string,
		match: PropTypes.shape({
			pathName: PropTypes.string,
		}),
		previous: PropTypes.shape({
			slug: PropTypes.string,
			title: PropTypes.string,
		}),
		next: PropTypes.shape({
			slug: PropTypes.string,
			title: PropTypes.string,
		}),
	};

	share() {
		const { language } = this.props;

		if (global.window) {
			const { FB } = global.window;
			let { href } = window.location;
			href += (href.indexOf("?") > -1 ? "&" : "?") + "language=" + language;

			if (FB) {
				FB.ui(
					{
						method: "share",
						href,
					},
					function(response) {}
				);
			}
		}
	}

	render() {
		const { previous, next, onNavigateTo, direction, other, t } = this.props;
		const rtl = direction === "rtl";

		return (
			<div className="ArticleFooter">
				{next && (
					<div
						className="selector"
						onClick={() => {
							onNavigateTo(next.fields.slug);
						}}
					>
						<h1>
							<small>{t("NEXT PAGE")}:</small>
							{next.fields.title}
						</h1>
						{!rtl ? <NavigateNext className="icon" /> : <NavigateBefore className="icon" />}
					</div>
				)}
				{next && <hr className={!previous ? "divider" : ""} />}
				{previous && (
					<div
						className="selector"
						onClick={() => {
							onNavigateTo(previous.fields.slug);
						}}
					>
						<h1>
							<small>{t("PREVIOUS PAGE")}:</small>
							{previous.fields.title}
						</h1>
						{!rtl ? <NavigateBefore className="icon" /> : <NavigateNext className="icon" />}
					</div>
				)}
				{previous && <hr className="divider" />}
				<div className="selector" onClick={() => this.share()}>
					<h1>{t("Share this page")}</h1>
					<Share className="icon" />
				</div>
				<hr />
				<div className="selector">
					<h1>{t("Suggest changes to this page")}</h1>
					<ModeEdit className="icon" />
				</div>
			</div>
		);
	}
}

export default translate()(ArticleFooter);
