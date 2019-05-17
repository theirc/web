import React, { Component } from "react";
import "./InstanceMovedWidget.css";
import { translate } from "react-i18next";

class InstanceMovedWidget extends Component {

	render() {
		return (
			<div className="InstanceMovedWidget">
				<span></span>
				<h1>REFUGEE.INFO NO LONGER<br />HOSTS CONTENT ON<br />BULGARIA.</h1>
				<br /><br />
				<h3>Please visit our partner for this information</h3>
				<br />
				<a href="http://refugeelife.bg/">Go to refugeelife.bg</a>
			</div>
		)
	}
}

export default translate()(InstanceMovedWidget);
