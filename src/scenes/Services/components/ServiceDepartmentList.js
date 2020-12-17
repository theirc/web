// libs
import React from "react";
import _ from "lodash";
import { translate } from "react-i18next";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import "./ServiceHome.css";

const NS = { ns: 'Services' };

/**
 * @class
 * @description 
 */
class ServiceDepartmentList extends React.Component {
	state = {
		regions: [],
	};

	renderRegion(c) {
		let {
			onOpenDepartment,
			language
		} = this.props;
		
		const departmentT = c.data_i18n && c.data_i18n.filter(x => x.language === language)[0];
		const departmentInfo = departmentT ? departmentT : c;
		
		const {
			id,
			slug
		} = c;

		return (
			<li key={`${id}-${slug}`}>
				<hr className="line" />
				<div className="container" onClick={() => setTimeout(() => onOpenDepartment(c.id, c.slug, departmentInfo.name), 300)}>
					{departmentInfo.name}
					<div className="right">
						<i className="material-icons">keyboard_arrow_right</i>
					</div>
				</div>
			</li>
		);
	}

	render() {
		const { allRegions, t } = this.props;

		if ((allRegions || []).length === 0) {
			return (
				<div className="ServiceCategoryList departments">
					<div className="Title">
						<h1>{t("services.Service Categories", NS)}</h1>
					</div>
					<div className="loader" />
				</div>
			);
		}

		let sortedRegions = _.sortBy(allRegions || [], c => {
			return c.name;
		});

		return [
			<HeaderBar key={"Header"} title={t("services.Locations", NS).toUpperCase()} />,
			<div key={"List"} className="ServiceCategoryList departments">
				<ul>
					{sortedRegions.map(c => this.renderRegion(c))}
				</ul>
			</div>,
		];
	}
}

export default translate()(ServiceDepartmentList);
