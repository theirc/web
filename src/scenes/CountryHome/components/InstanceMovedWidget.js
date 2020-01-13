// libs
import React, { Component } from "react";
import { translate } from "react-i18next";

// local
import "./InstanceMovedWidget.css";

const NS = { ns: 'CountryHome' };

class InstanceMovedWidget extends Component {

	render() {
		const { t, link } = this.props;

		return (
			<div className="InstanceMovedWidget">
				<span></span>
				<h1>{t("banner.Instance moved Bulgaria banner", NS)}</h1>

				<br /><br />
				<h3>{t("banner.Instance moved Bulgaria small", NS)}</h3>
				<br />

				<a href={link} target="_blank" rel="noopener noreferrer">{t("banner.Instance moved Bulgaria label", NS)}</a>
			</div>
		)
	}
}

export default translate()(InstanceMovedWidget);
