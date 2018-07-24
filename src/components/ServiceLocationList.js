import React from "react";
import "./ServiceHome.css";
import {
	translate
} from "react-i18next";
import HeaderBar from "./HeaderBar";
import _ from "lodash";


class ServiceCategoryList extends React.Component {
	state = {
		regions: [],
	};
	componentDidMount() {

	}

	renderRegion(c) {
		let {
			openLocation
		} = this.props;
		openLocation = openLocation || (() => console.log("noop"));

		const {
			id,
			name,
			level
		} = c;

		return (
			<li key={id}>
				<hr className="line" />
				<div className="container" onClick={() => setTimeout(() => openLocation(c.slug, name), 300)}>
					<i className={`fa fa-${level > 1 ? 'building' : 'globe'}`} />
					<strong>{name}</strong>
				</div>
			</li>
		);
	}
	render() {
		const {
			allRegions, t, department, departmentName
		} = this.props;

		if ((allRegions || []).length === 0) {
			return (
				<div className="ServiceCategoryList">
					<div className="Title">
						<h1>{t("Service Categories")}</h1>
					</div>
					<div className="loader" />
				</div>
			);
		}
		let sortedRegions = [];
		if (department) {
			sortedRegions = _.filter(allRegions, ['parent', department]);
		} else {
			sortedRegions = _.sortBy(allRegions || [], c => {
                if(c.level === 1){
					return c.name;
				}
			});
		}
		let title = department ? t("Locations in") + " " + departmentName : t("Locations");

		return [
			<HeaderBar key={"Header"} title={title.toUpperCase()}>
			</HeaderBar>,
			<div key={"List"} className="ServiceCategoryList">
				<ul>
					{sortedRegions.map(c => this.renderRegion(c))}
				</ul>
			</div>
		];
	}
}

export default translate()(ServiceCategoryList);

