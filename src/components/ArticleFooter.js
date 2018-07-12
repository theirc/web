import React, { Component } from "react";
import PropTypes from "prop-types";
import { NavigateBefore, NavigateNext, Share, Link } from "material-ui-icons";
import { translate } from "react-i18next";
import { CopyToClipboard } from "react-copy-to-clipboard";
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

	constructor(props) {
		super(props);
		const { language } = this.props;
		let { href } = window.location;
		let copySlug = (href += (window.location.toString().indexOf("?") > -1 ? "&" : "?") + "language=" + language);
		this.state = { value: copySlug, copied: true, shareIN: true };
		this.sharePage = this.sharePage.bind(this);
		this.Copiedlnk = this.Copiedlnk.bind(this);
	}

	sharePage() {
		this.setState(prevState => ({ shareIN: false }));
	}

	Copiedlnk() {
		this.setState(prevState => ({ copied: !prevState.copied }));
		setTimeout(() => {
			this.setState({ shareIN: true });
			setTimeout(() => {
				this.setState(prevState => ({ copied: !prevState.copied }));
			}, 2);
		}, 3000);
	}

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
		const { previous, next, onNavigateTo, direction, t } = this.props;
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
				{this.state.shareIN ? (
					<div className="selector" onClick={() => this.sharePage()}>
						<h1>{t("Share this page")}</h1>
						<Share className="icon" />
					</div>
				) : (
					<div className="selector sharePage">
						<h1
							onClick={() => {
								this.Copiedlnk();
								this.share();
							}}
						>
							{t("Share on Facebook")}
						</h1>
						<Share className="icon" />

						<div className="verticalHR" />
						<CopyToClipboard sharePage={this.sharePage} text={this.state.value}>
							{this.state.copied ? <h1 onClick={() => this.Copiedlnk()}>{t("Copy Link")}</h1> : <h1>{t("Copied")}</h1>}
						</CopyToClipboard>
						<Link className="icon" />
					</div>
				)}

				{/*
				<hr />
				<div className="selector">
					<h1>{t("Suggest changes to this page")}</h1>
					<ModeEdit className="icon" />
				</div>
				*/}
			</div>
		);
	}
}

export default translate()(ArticleFooter);
