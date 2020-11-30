// libs
import React from "react";
import tinycolor from "tinycolor2";
import { translate } from "react-i18next";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import "./ServiceHome.css";
import "./ServiceCategoryList.css";

const NS = { ns: 'Services' };

/**
 * @class
 * @description 
 */
class ServiceCategoryList extends React.Component {
	state = {
		categories: [],
		loaded: false,
	};

	componentDidMount() {
		const { fetchCategories } = this.props;
		const { categories } = this.state;
		if (fetchCategories && categories.length === 0) {
			fetchCategories().then(categories => {
				this.setState({ categories, loaded: true });
			});
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

		let { id, name, icon } = c;
		let iconWithPrefix = vector_icon => (vector_icon && vector_icon.indexOf('icon') > -1) ?
								`${vector_icon.split('-')[0]} ${vector_icon}` : 
								`fa fa-${vector_icon}`;

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
				<div className="container" onClick={() => { setTimeout(() => onSelectCategory(c), 300) }}>
					<i className={iconWithPrefix(icon)} style={style} />
					<span>{name}</span>
				</div>
			</li>
		);
	}

	render() {
		const { categories, loaded } = this.state;
		const { t, listAllServices, goToLocationList, goToMap, locationName, departmentSelected } = this.props;

		if (!loaded) {
			return (
				<div className="ServiceCategoryList">
					<div className="Title">
						<h1>{t("services.Service Categories", NS)}</h1>
					</div>
					<div className="loader" />
				</div>
			);
		}

		if ((categories || []).length === 0 && loaded) {
			return (
				<div className="ServiceCategoryList">
					<div className="Title">
						<h1>{t("services.Service Categories", NS)}</h1>
					</div>
					<div className="NoServices">
						<h2>{t("services.No services found", NS)}</h2>
					</div>
				</div>
			);
		}

		return <div>
			<HeaderBar key={"Header"} title={t("services.Service Categories", NS).toUpperCase()} />

			<div key={"List"} className="ServiceCategoryList">
				<ul>
					{locationName &&
						<div>
							<li key="title1">
								<div className="container disabled">
									<strong>{`${t("services.Services in", NS)} ${t(locationName)}`}</strong>
								</div>
							</li>
							<hr className="line" />
						</div>
					}

					{!departmentSelected &&
						<li key="locations">
							<div className="container" onClick={goToLocationList}>
								<i className="fa fa-globe" />
								<strong>{t("services.Locations", NS)}</strong>
								<i className="material-icons">keyboard_arrow_right</i>
							</div>
						</li>
					}

					{departmentSelected &&
						<li key="municipalidades">
							<div className="container" onClick={goToLocationList}>
								<i className="fa fa-globe" />
								<strong>{t("services.Municipalidades", NS)}</strong>
								<i className="material-icons">keyboard_arrow_right</i>
							</div>
						</li>
					}

					<hr className="line" />

					<li key="map">
						<div className="container" onClick={goToMap}>
							<i className="fa fa-map" />
							<strong>{t("services.Map", NS)}</strong>
							<i className="material-icons">keyboard_arrow_right</i>
						</div>
					</li>

					<hr className="line" />

					<li key="all-services">
						<div className="container" onClick={listAllServices}>
							<i className="fa fa-list" />
							<strong>{t("services.All Services", NS)}</strong>
							<i className="material-icons">keyboard_arrow_right</i>
						</div>
					</li>
					
					{categories.map(c => this.renderCategory(c))}
				</ul>
			</div>
		</div>
	}
}

export default translate()(ServiceCategoryList);
