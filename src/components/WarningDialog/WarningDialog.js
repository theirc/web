// libs
import React, { Component } from "react";
import PropTypes from "prop-types";
import Markdown from "markdown-to-jsx";

// local
import "./WarningDialog.css";

/**
 * @class
 * @description 
 */
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

		return (
			<div className={[containerClassName, (hiding && "warning--hiding") || ""].join(" ")}>
				<div className="warning-wrapper">
				<div className="warning-dialog-container-inner">
					{children && <Markdown>{children}</Markdown>}
					{text && <Markdown>{text}</Markdown>}
				</div>
				{dismissable && (
					<div className="warning-dialog-close" onClick={() => this.hide()}>
						{/* <Close /> */}
					</div>
				)}
				</div>
			</div>
		);
	}
}
