// libs
import React, { Component } from "react";
import { translate } from "react-i18next";

// local
import "./InstanceMovedWidget.css";

class InstanceMovedWidget extends Component {

	render() {
		const { t, link } = this.props;

		return (
			<div className="InstanceMovedWidget">
				<span></span>
				<h1>{t("Instance moved Bulgaria banner")}</h1>

				<br /><br />
				<h3>{t("Instance moved Bulgaria small")}</h3>
				<br />

				<a href={link} target="_blank" rel="noopener noreferrer">{t("Instance moved Bulgaria label")}</a>
			</div>
		)
	}
}

export default translate()(InstanceMovedWidget);
