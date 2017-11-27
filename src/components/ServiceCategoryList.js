import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";

import HeaderBar from "./HeaderBar";
import _ from "lodash";

import tinycolor from "tinycolor2";

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

	fixColor(color) {
		if (!color) {
			color = "#FFF";
		} else if (color.indexOf("#") === -1) {
			color = `#${color}`;
		}
		return color;
	}

	renderCategory(c) {
		let { onSelectCategory } = this.props;
		onSelectCategory = onSelectCategory || (() => console.log("noop"));

		let { id, name, vector_icon } = c;
		let iconPrefix = vector_icon.split("-")[0];

		let color = this.fixColor(c.color);
		color = tinycolor(color)
			.saturate(30)
			.toHexString();

		let style = {
			color: color === "#ffffff" ? "black" : color,
		};

		return (
			<li key={id}>
				<hr className="line" />
				<div className="container" onClick={() => setTimeout(() => onSelectCategory(c), 300)}>
					<i className={`${iconPrefix} ${vector_icon}`} style={style} />
					<strong>{name}</strong>
				</div>
			</li>
		);
		/*
		return (
			<div key={id} className="CategoryContainer">
				<button className="Category" onClick={() => setTimeout(() => onSelectCategory(c), 300)}>
					<i className={`${iconPrefix} ${vector_icon}`} />
					<span>{name}</span>
				</button>
			</div>
		);
		*/
	}
	render() {
		const { categories } = this.state;
		const { t, locationEnabled, toggleLocation, listAllServices, goToNearby } = this.props;
		if ((categories || []).length === 0) {
			return (
				<div className="ServiceCategoryList">
					<div className="Title">
						<h1>{t("Service Categories")}</h1>
					</div>
					<div className="loader" />
				</div>
			);
		}
		let sortedCategories = _.sortBy(categories || [], c => {
			return c.name_en;
		});
		return [
			<HeaderBar key={"Header"} title={t("Service Categories").toUpperCase()}>
				<li onClick={toggleLocation || _.identity}>
					<h1>{t("Order results by distance to me")}</h1>
					{!locationEnabled && <i className="MenuIcon material-icons">radio_button_unchecked</i>}
					{locationEnabled && <i className="MenuIcon material-icons">radio_button_checked</i>}
				</li>
				<li onClick={listAllServices}>
					<h1>{t("All Services")}</h1>
					<i className="MenuIcon fa fa-list" aria-hidden="true" />
				</li>
			</HeaderBar>,
			<div key={"List"} className="ServiceCategoryList">
				<ul>
					<li>
						<div className="container" onClick={() => goToNearby()}>
							<i className="fa fa-compass" />
							<strong>Near Me</strong>
						</div>
					</li>
					{sortedCategories.map(c => this.renderCategory(c))}
				</ul>
			</div>,
		];
	}
}

export default translate()(ServiceCategoryList);