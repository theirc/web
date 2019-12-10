// libs
import React from "react";
import _ from "lodash";
import { translate } from "react-i18next";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import "./ServiceHome.css";

class ServiceCategoryList extends React.Component {
	state = {
		regions: [],
	};

	renderRegion(c) {
		let {
			openLocation
		} = this.props;
		openLocation = openLocation || (() => console.log("noop"));

		const {
			id,
			name,
			level,
			title
		} = c;
		let locationName = title ? title : name;

		return (
			<li key={id}>
				<hr className="line" />

				<div className="container" onClick={() => setTimeout(() => openLocation(c, name), 300)}>
					<i className={`fa fa-${level > 1 ? 'building' : 'globe'}`} />
					<strong>{locationName}</strong>
				</div>
			</li>
		);
	}

	render() {
		const {
			allRegions, t, departmentId, department, departmentName
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
			sortedRegions = _.filter(allRegions, ['parent', departmentId]);
		} else {
			sortedRegions = _.sortBy(allRegions || [], c => {
				if (c.level === 1) {
					return c.name;
				}
			});
		}
		let title = department ? t("Locations in") + " " + departmentName : t("Locations");

		return [
			<HeaderBar key={"Header"} title={title.toUpperCase()} />,
			<div key={"List"} className="ServiceCategoryList">
				<ul>
					{sortedRegions.map(c => this.renderRegion(c))}
				</ul>
			</div>
		];
	}
}

export default translate()(ServiceCategoryList);
