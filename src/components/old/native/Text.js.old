import { Text } from "react-native";
import React, { Component } from "react";
import PropTypes from "prop-types";

export default class FontText extends Component {
	static contextTypes = {
		direction: PropTypes.string,
		textAlign: PropTypes.string,
	};

	render() {
		const { style, ...otherProps } = this.props;
		const { direction, flexDirection, textAlign } = this.context;

		return (
			<Text
				style={[
					{
						fontFamily: direction === "ltr" ? "Roboto" : "Cairo",
						textAlign,
					},
					style,
				]}
				{...otherProps}
			>
				{this.props.children}
			</Text>
		);
	}
}
