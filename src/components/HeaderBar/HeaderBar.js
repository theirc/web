// libs
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";

// local
import "./HeaderBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
							<FontAwesomeIcon icon="chevron-up" />
						</div>,
						<div className="down" key={"down"}>
							<FontAwesomeIcon icon="chevron-down" />
						</div>,
					]}
				</label>

				{children && <ul>{children}</ul>}
			</div>
		);
	}
}

export default withTranslation()(HeaderBar);
