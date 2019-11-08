// libs
import React, { Component } from "react";

// local
import "./HomeWidgetCollection.css";

export default class HomeWidgetCollection extends Component {
	render() {
		return (
			<div className="HomeWidgetCollection">{this.props.children}</div>
		);
	}
}
