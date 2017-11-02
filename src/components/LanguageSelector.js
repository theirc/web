import React, { Component } from "react";
//import PropTypes from 'prop-types';

import "./LanguageSelector.css";

export default class LanguageSelector extends Component {
	static propTypes = {};

	componentDidMount() {
		if (global.window) {
			delete global.window.sessionStorage.country;
			delete global.window.sessionStorage.dismissedNotifications;
			
		}
	}

	render() {
		const { languages, onSelectLanguage } = this.props;

		return (
			<div className="LanguageSelector">
				<div className="spacer" />
				{languages.map((c, i) => (
					<button
						className="item "
						key={i}
						onClick={() => {
							onSelectLanguage(c[0]);
						}}
					>
						{c[1]}
					</button>
				))}
				<div className="spacer" />
				<div className="bottom" />
			</div>
		);
	}
}
