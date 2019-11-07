// libs
import React from "react";
import tinycolor from "tinycolor2";
import { translate } from "react-i18next";

// local
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import "./ServiceHome.css";
import "./ServiceCategoryList.css";

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
				<div className="container" onClick={() => { setTimeout(() => onSelectCategory(c), 300) }}>
					<i className={`${iconPrefix} ${vector_icon}`} style={style} />
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
						<h1>{t("Service Categories")}</h1>
					</div>
					<div className="loader" />
				</div>
			);
		}

		if ((categories || []).length === 0 && loaded) {
			return (
				<div className="ServiceCategoryList">
					<div className="Title">
						<h1>{t("Service Categories")}</h1>
					</div>
					<div className="NoServices">
						<h2>{t("No services found")}</h2>
					</div>
				</div>
			);
		}

		return <div>
			<HeaderBar key={"Header"} title={t("Service Categories").toUpperCase()} />

			<div key={"List"} className="ServiceCategoryList">
				<ul>
					{locationName &&
						<div>
							<li key="title1">
								<div className="container disabled">
									<strong>{t("Services in") + " " + t(locationName)}</strong>
								</div>
							</li>
							<hr className="line" />
						</div>
					}

					{!departmentSelected &&
						<li key="locations">
							<div className="container" onClick={goToLocationList}>
								<i className="fa fa-globe" />
								<strong>{t("Locations")}</strong>
								<i className="material-icons">keyboard_arrow_right</i>
							</div>
						</li>
					}

					{departmentSelected &&
						<li key="municipalidades">
							<div className="container" onClick={goToLocationList}>
								<i className="fa fa-globe" />
								<strong>{t("Municipalidades")}</strong>
								<i className="material-icons">keyboard_arrow_right</i>
							</div>
						</li>
					}

					<hr className="line" />

					<li key="map">
						<div className="container" onClick={goToMap}>
							<i className="fa fa-map" />
							<strong>{t("Map")}</strong>
							<i className="material-icons">keyboard_arrow_right</i>
						</div>
					</li>

					<hr className="line" />

					<li key="all-services">
						<div className="container" onClick={listAllServices}>
							<i className="fa fa-list" />
							<strong>{t("All Services")}</strong>
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
