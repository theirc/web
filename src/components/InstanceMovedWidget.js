import React, { Component } from "react";
import { translate } from "react-i18next";
import "./InstanceMovedWidget.css";

class InstanceMovedWidget extends Component {

	render() {
		return (
			<div className="InstanceMovedWidget">
				<span></span>
				<h1>Refugee.info no longer<br />hosts content on<br />{this.props.country}.</h1>
				<br /><br />
				<h3>Please visit our partner for this information</h3>
				<br />
				<a href={this.props.link}>{this.props.label}</a>
			</div>
		)
	}
}

export default translate()(InstanceMovedWidget);
