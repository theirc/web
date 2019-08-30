import React, { Component } from "react";
import PropTypes from "prop-types";
import { NavigateBefore, NavigateNext } from "material-ui-icons";
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

	constructor(props) {
		super(props);
		const { language } = this.props;
		//let { href } = window.location;		
		let copySlug = "";
		if (window.location.toString().indexOf("language=") > -1){
			copySlug = window.location;
		}else{
			copySlug = (window.location += (window.location.toString().indexOf("?") > -1 ? "&" : "?") + "language=" + language);
		}
		//let copySlug = (href += (window.location.toString().indexOf("?") > -1 ? "&" : "?") + "language=" + language);
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
	subscribe(article) {
		const { onNavigateTo, country, category } = this.props;
		onNavigateTo(`../subscribe/${category.fields.slug}`);
	}

	render() {
		const { country, previous, next, onNavigateTo, direction, t, article } = this.props;
		const rtl = direction === "rtl";

		return (
			<div className="ArticleFooter">
				{/* <div className="selector" onClick={() => {this.subscribe(article)}}>
					<h1>
						<small>{t("Get an SMS with updates")}:</small>
						{t("Subscribe for Notifications")}
					</h1>
					{!rtl ? <NavigateNext className="icon" /> : <NavigateBefore className="icon" />}
				</div> */}
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
