import React from "react";
import "./ServiceHome.css";
import {
    translate
} from "react-i18next";

import HeaderBar from "./HeaderBar";
import _ from "lodash";

import tinycolor from "tinycolor2";

class ServiceCategoryList extends React.Component {
    state = {
        regions: [],
    };
    componentDidMount() {

    }

    renderCategory(c) {
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
				<i className={`fa fa-${level > 1 ? 'building': 'globe'}`} />
					<strong>{name}</strong>
				</div>
			</li>
        );
    }
    render() {
        const {
            allRegions
        } = this.props;
        const {
            t,
            locationEnabled,
            toggleLocation,
            listAllServices,
            goToNearby,
			goToMap,
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
        let sortedRegions = _.sortBy(allRegions || [], c => {
            return c.id;
        });
        return [
            <HeaderBar key={"Header"} title={t("Locations").toUpperCase()}>
			
			</HeaderBar>,
            <div key={"List"} className="ServiceCategoryList">
				<ul>
					<li>
						<div className="container" onClick={() => goToMap()}>
							<i className="fa fa-map" />
							<strong>{t("Service Map")}</strong>
						</div>
					</li>
					{sortedRegions.map(c => this.renderCategory(c))}
				</ul>
			</div>,
        ];
    }
}

export default translate()(ServiceCategoryList);
