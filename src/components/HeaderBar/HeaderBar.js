// libs
import React, { Component } from "react";
import { translate } from "react-i18next";
import PropTypes from "prop-types";

// local
import "./HeaderBar.css";

const generateKey = pre => {
	return `${pre}_${new Date().getTime()}`;
};

/**
 * @class
 * @description 
 */
class HeaderBar extends Component {
	static propTypes = {
		subtitle: PropTypes.any,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { title, children } = this.props;
		const triggerKey = generateKey("trigger");
		
		return (
			<div className="HeaderBar">
				<input type="checkbox" name={triggerKey} id={triggerKey} />
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
