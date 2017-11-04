import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import { CircularProgress } from "material-ui/Progress";
import _ from "lodash";

var tinycolor = require("tinycolor2");

class ServiceCategoryList extends React.Component {
	state = {
		categories: [],
	};
	componentDidMount() {
		const { fetchCategories } = this.props;
		if (fetchCategories) {
			fetchCategories().then(categories => this.setState({ categories }));
		}
	}

	renderCategory(c) {
		let { onSelectCategory } = this.props;
		onSelectCategory = onSelectCategory || (() => console.log("noop"));

		let { id, color, name, vector_icon } = c;

		if (!color) {
			color = "#FFF";
		} else if (color.indexOf("#") === -1) {
			color = `#${color}`;
		}

		color = tinycolor(color)
			.saturate(30)
			.toHexString();

		let iconPrefix = vector_icon.split("-")[0];
		let style = {
			backgroundColor: color,
			borderColor: tinycolor(color).darken(10),
			color: tinycolor.mostReadable(color, ["#000", "#444", "#888", "#FFF"]).toHexString(),
		};

		return (
			<div key={id} className="CategoryContainer">
				<button className="Category" style={style} onClick={() => setTimeout(() => onSelectCategory(c), 300)}>
					<i className={`${iconPrefix} ${vector_icon}`} />
					<span>{name}</span>
				</button>
			</div>
		);
	}
	render() {
		const { categories } = this.state;
		const { t, locationEnabled, toggleLocation } = this.props;
		if ((categories || []).length === 0) {
			return (
				<div className="ServiceCategoryList">
					<div className="Title">
						<h1>{t("Service Categories")}</h1>
					</div>
					<div className="Spacer">
						<CircularProgress />
					</div>
				</div>
			);
		}

		return (
			<div className="ServiceCategoryList">
				<div className="Title">
					<h1>{t("Service Categories")}</h1>
				</div>
				{(categories || []).map(this.renderCategory.bind(this))}

				{navigator.geolocation && (
					<div className="Selector" onClick={toggleLocation || _.identity}>
						<h1>{t("Order results by distance to me")}</h1>
						{!locationEnabled && <i className="Icon material-icons">radio_button_unchecked</i>}
						{locationEnabled && <i className="Icon material-icons">radio_button_checked</i>}
					</div>
				)}
				{/*
				<hr />
				<div className="Selector">
					<h1>{t("Suggest changes to this page")}</h1>
				</div>
                */}
			</div>
		);
	}
}

export default translate()(ServiceCategoryList);
