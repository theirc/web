import React, { Component } from "react";
import PropTypes from "prop-types";

import { Close } from "material-ui-icons";
import "./WarningDialog.css";

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

export default class WarningDialog extends Component {
	static propTypes = {
		text: PropTypes.string,
		type: PropTypes.string,
		autoDismiss: PropTypes.bool,
		dismissable: PropTypes.bool,
		onHide: PropTypes.func,
	};

	constructor() {
		super();
		this.state = {
			hide: false,
			hiding: false,
		};
	}

	componentDidMount() {
		if (this.props.autoDismiss) {
			setTimeout(() => {
				this.hide();
			}, 30 * 1000);
		}
	}
	hide() {
		this.setState({
			hiding: true,
		});
		setTimeout(() => {
			this.setState({
				hide: true,
			});

			if (this.props.onHide) {
				this.props.onHide();
			}
		}, 1000);
	}

	render() {
		const { text, children, type, dismissable } = this.props;
		const { hide, hiding } = this.state;
		const containerClassName = `warning-dialog-container-${type || "yellow"}`;
		if (hide) {
			return null;
		}
		let html = md.render(children || text);
		//html = html.replace(/\s(\+[1-9]{1}[0-9]{5,14})|00[0-9]{5,15}/g, `<a class="tel" href="tel:$1">$1</a>`);

		return (
			<div className={[containerClassName, (hiding && "warning--hiding") || ""].join(" ")}>
				<div className="warning-dialog-container-inner" dangerouslySetInnerHTML={{ __html: html }} />
				{dismissable && (
					<div className="warning-dialog-close" onClick={() => this.hide()}>
						<Close />
					</div>
				)}
			</div>
		);
	}
}
