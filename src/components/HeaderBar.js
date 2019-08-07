import React, { Component } from "react";
import { translate } from "react-i18next";
import { Share, Link } from "material-ui-icons";
import PropTypes from "prop-types";
import "./HeaderBar.css";

const generateKey = pre => {
	return `${pre}_${new Date().getTime()}`;
};

class HeaderBar extends Component {
	static propTypes = {
		subtitle: PropTypes.any,
		title: PropTypes.string.isRequired,
	};

	onCopyLink = () => {
		navigator.clipboard.writeText(document.location.href);
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

	render() {
		const { subtitle, title, children } = this.props;
		const triggerKey = generateKey("trigger");
		return (
			<div className="HeaderBar">
				<input type="checkbox" name={triggerKey} id={triggerKey} />
				<div className="social">
					<div href='#' className="share" onClick={this.onShareOnFacebook}>Share this page<Share /></div>
					<div href='#' className="copy" onClick={this.onCopyLink}>Copy link<Link /></div>
				</div>
				<label htmlFor={triggerKey}>
					<h1>
						{title}
					</h1>
					{children && [
						<div className="up" key={"up"}>
							<i className="material-icons">keyboard_arrow_up</i>
						</div>,
						<div className="down" key={"down"}>
							<i className="material-icons">keyboard_arrow_down</i>
						</div>,
					]}
				</label>
				{children && <ul>{children}</ul>}
			</div>
		);
	}
}

export default translate()(HeaderBar);
