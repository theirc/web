import React, { Component } from "react";
import moment from "moment";
import _ from "lodash";

import "./HomeWidgetCollection.css";

export default class HomeWidgetCollection extends Component {
	render() {
		return (
			<div className="HomeWidgetCollection">{this.props.children}</div>
		);
	}
}
