// libs
import React from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { push } from "react-router-redux";
// import { Link } from 'react-router-dom';
import _ from "lodash";
import tinycolor from "tinycolor2";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import instance from '../../../backend/settings';
import routes from '../routes';
import servicesApi from '../../../backend/servicesApi';
import ServiceMapDesktop from "./ServiceMapDesktop";
import "../../../components/ActionsBar/ActionsBar.css";
import "./ServiceHome.css";
import "./ServiceCategoryList.css";
import "./ServiceCategoryListDesktop.css";

const NS = { ns: 'Services' };

const FilterTypes = {
	DEPARTMENT: 1,
	MUNICIPALITY: 2,
	CATEGORY: 3,
};

/**
 * @class
 * @description 
 */
class ServiceCategoryListDesktop extends React.Component {
	state = {
		categories: [],
		category: null,
		department: '',
		filterType: null,
		loaded: false,
		loadingMoreServices: false,
		location: {},
		municipalities: null,
		municipality: 'Municipalidades',
		pageStart: 1,
		services: [],
		showFilter: true,
		showMore: true,
		showMap: !!this.props.mapView,
		showMunicipalities: false,
		showServices: false,
		switchHover: false
	};

	componentDidMount() {
		const { category, country, fetchCategories, fetchServices, location, regions, showFilter } = this.props;
		let c = regions.filter(r => r.slug === country.fields.slug)[0]
		const { categories } = this.state;
		const showDepartments = _.has(country, 'fields.slug') && instance.countries[country.fields.slug].switches.showDepartments;

		let currentLocation = c;

		if (location) {
			let l = regions.filter(r => r.slug === location);
			currentLocation = l.length > 0 ? l[0] : c;
		}

		let municipalities = currentLocation.level === 3 ? regions.filter(r => r.parent === currentLocation.parent) : null;
		let department = currentLocation.level === 3 ? (!showDepartments ? currentLocation.title : currentLocation.parent__name) :
			(currentLocation.level === 2 ? currentLocation : currentLocation.title);

		this.setState({
			loaded: true,
			location: currentLocation,
			department: department,
			municipality: currentLocation.level === 3 ? currentLocation : this.state.municipality,
			municipalities: municipalities,
			showFilter: showFilter,
			showMunicipalities: !!municipalities,
		});

		!municipalities && this.municipalidadesFilter(currentLocation);

		if (fetchCategories && categories.length === 0) {
			fetchCategories().then(categories => {
				this.setState({ categories, loaded: true });
				if (category) {
					let cat = categories.filter(c => c.id === parseInt(category, 10))[0];
					if (cat) {
						this.setState({ category: cat });
					}
				}
			});
		}

		if (!showFilter) {
			fetchServices(currentLocation.slug, category).then(
				services => this.setState({ services: services.results, showServices: true })
			)
		}

	}

	hoverMapSwitch(hover) {
		this.setState({ switchHover: hover });
	}

	fixColor(color) {
		if (!color) {
			color = "#FFF";
		} else if (color.indexOf("#") === -1) {
			color = `#${color}`;
		}
		return color;
	}

	onShowMore = () => {
		const { category, country, language, regions } = this.props;
		let c = regions.filter(r => r.slug === country.fields.slug)[0]

		const pageStart = this.state.pageStart + 1;
		this.setState({loadingMoreServices: true})
		servicesApi.fetchAllServices(c.slug, language, category, null, 10, true, pageStart).then(
			services => {
				this.setState({
					loadingMoreServices: false,
					showMore: services.results.length === 10,
					services: [...this.state.services, ...services.results], 
					pageStart });
			}
		)
	}

	onSelectLocation = element => {
		const { fetchCategoriesByLocation } = this.props;

		this.setState({ location: element, department: element });
		this.municipalidadesFilter(element);

		fetchCategoriesByLocation(element.slug).then(categories => this.setState({ categories: categories, showServices: true }));
	}

	onSelectMunicipality = element => {
		const { fetchCategoriesByLocation } = this.props;

		this.setState({ location: element, municipality: element });

		fetchCategoriesByLocation(element.slug).then(categories => this.setState({ categories: categories, showServices: true }));
	}

	onSelectCategory = element => {
		this.setState({ category: element });
	}

	showServices = (mapState = null) => {
		const { goTo } = this.props;

		let showMap = mapState != null ? mapState : this.state.showMap;
		this.setState({ showMap, showServices: true });
		goTo(this.state.location, this.state.category, showMap);
	}

	closeFilters = () => {
		this.setState({ showFilter: false });
	}

	openFilters = type => {
		this.setState({ showFilter: true, filterType: type });
	};

	toggleMap = () => this.showServices(!this.state.showMap);

	departamentosFilter = () => {
		const { regions } = this.props;

		let currentLocation = this.state.location.level === 3 ? regions.filter(r => r.id === this.state.location.parent)[0] : this.state.location;
		this.setState({ location: currentLocation })
	}

	municipalidadesFilter = (location = null) => {

		const { regions } = this.props;
		const department = location ? location : this.state.location;
		if (department.level === 2) {
			const municipalities = regions.filter(r => r.parent === department.id);
			this.setState({ municipalities: municipalities, department: department, showMunicipalities: true })
		} else {
			this.setState({ showMunicipalities: false })
		}
	}

	renderLoader = () => (
		<div>
			<div className="ServiceCategoryList">
				<div className="Title">
					<h1>{"Services"}</h1>
				</div>
				<div className="loader" />
			</div>
		</div>
	);

	renderCategoryButton(category, onSelect) {
		let { vector_icon } = category;
		let iconPrefix = vector_icon.split("-")[0];

		let color = this.fixColor(category.color);
		color = tinycolor(color).saturate(30).toHexString();

		let style = {
			color: color === "#ffffff" ? "black" : color,
		};

		const buttonClass = this.state.category && category.id === this.state.category.id ? "location-item-selected" : "location-item";
		return (
			<button key={category.id} className={buttonClass} onClick={() => onSelect(category)}>
				<i className={`${iconPrefix} ${vector_icon}`} style={style} />
				<span>{category.name}</span>
			</button>
		);
	}

	renderDepartmentButton(department, onSelect) {
		return (
			<button key={department.id} className={department.id === this.state.location.id ? "location-item-selected" : "location-item"} onClick={() => onSelect(department)}>
				{department.level === 1 && <i className='fa fa-globe' />}<span>{department.name}</span>
			</button>
		);
	}

	renderMunicipalityButton(municipality, onSelect) {
		return (
			<button key={municipality.id} className={municipality.id === this.state.municipality.id ? "location-item-selected" : "location-item"} onClick={() => onSelect(municipality)}>
				{municipality.level === 1 && <i className='fa fa-globe' />}<span>{municipality.name}</span>
			</button>
		);
	}

	renderFilters = () => {
		let { municipalities } = this.state;
		let { country, t } = this.props;
		const showDepartments = _.has(country, 'fields.slug') && instance.countries[country.fields.slug].switches.showDepartments;

		let categoryName = this.state.category ? this.state.category.name : t('services.All Categories', NS);
		let department = this.state.department.name ? this.state.department.name : this.state.department;
		let municipality = this.state.municipality.name ? this.state.municipality.name : this.state.municipality;

		return (
			<div className="ActionsBar">
				<div className="left">
					<div id="btn-Locations" className="btn" onClick={() => { this.departamentosFilter(); this.openFilters(FilterTypes.DEPARTMENT) }}>
						<span>{department}</span><i className="material-icons">keyboard_arrow_down</i>
					</div>

					{municipalities && showDepartments && this.state.showMunicipalities &&
						<div className="btn" onClick={() => { this.openFilters(FilterTypes.MUNICIPALITY) }}>
							<span>{municipality}</span><i className="material-icons">keyboard_arrow_down</i>
						</div>
					}

					<div className="btn" onClick={() => this.openFilters(FilterTypes.CATEGORY)}>
						<span>{categoryName}</span><i className="material-icons">keyboard_arrow_down</i>
					</div>

					<div className="line" />

					
					<div id="services-list-map-toggle">
						<input type="checkbox" className="switch bigswitch cn" checked={this.state.showMap} onMouseEnter={() => this.hoverMapSwitch(true)} onMouseLeave={() => this.hoverMapSwitch(false)} onChange={this.toggleMap} />
						<div className={`toggle-btn ${this.state.switchHover ? 'hover' : ''}`}><div></div></div>
						<span>{t('services.Map view', NS)}</span>
					</div>
				</div>
			</div>
		);
	};

	renderFiltersPopover(title, onSelect, list, renderer, className, filterType) {
		const { t } = this.props;

		return (
			<div className={`services-list-popover ${className}`}>
				<div id="location-title">{title}</div>
				<div id="location-list">
					{filterType === FilterTypes.CATEGORY &&
						<button key={0} className={!this.state.category ? "location-item-selected" : "location-item"} onClick={() => onSelect(null)}>
							<span>{t('services.All Categories', NS)}</span>
						</button>
					}

					{list.map(l => renderer(l, onSelect))}
				</div>

				<div className='filter'><button onClick={() => { this.closeFilters(); this.showServices(); filterType === FilterTypes.DEPARTMENT && this.municipalidadesFilter(); }}>{t('services.Filter', NS)}</button></div>
			</div>
		);
	}

	renderServiceItem(service) {
		const { country, goToService, language, measureDistance } = this.props;
		const distance = measureDistance && service.location && measureDistance(service.location);

		let iconWithPrefix = vector_icon => vector_icon.split("-")[0] + " " + vector_icon;
		let categoryStyle = color => {
			if (!color) {
				color = "#000";
			} else if (color.indexOf("#") === -1) {
				color = `#${color}`;
			}

			color = tinycolor(color).saturate(30).darken(10).toHexString();

			return {
				color: color,
				borderColor: tinycolor(color).darken(10),
			};
		};

		let fullAddress = [service.address, service.address_city].filter(val => val).join(", ");
		let mainType = service.type ? service.type : service.types[0];
		let subTypes = service.types.filter(t => t.id > 0 && t.id !== mainType.id);

		return [
			<li key={service.id} className="Item" onClick={() => goToService(country, language, service.id)}>
				{/* TODO: move Item to separate component with styles and stuff */}
				{/* <Link className='Item--wrapper' to={`/${country.fields.slug}/services/${service.id}?language=${language}`}> */}
					<div className="Icon" key={`${service.id}-0`}>
						<i className={iconWithPrefix(mainType.vector_icon)} style={categoryStyle(mainType.color)} />
					</div>

					<div className="Info">
						<h1>{service.name}</h1>

						<h2>
							{service.provider.name}{" "}
							<span>
								{fullAddress}
								{distance && ` - ${distance}`}
							</span>

							<div className="Icons">
								{subTypes.map((t, idx) => (
									<div className="Icon" key={`${service.id}-${idx}`}>
										<i className={iconWithPrefix(t.vector_icon)} style={categoryStyle(t.color)} />
									</div>
								))}
							</div>
						</h2>
					</div>

					<i className="material-icons" />
				{/* </Link> */}
			</li>,
		];
	}

	render() {
		const { categories, loaded, services, showServices } = this.state;
		const { t, regions, country } = this.props;
		let countryId = regions.filter(r => r.slug === country.fields.slug)[0].id;
		let l3 = regions.filter(r => r.slug === country.fields.slug || (r.parent === countryId && r.level === 3 && !r.hidden) || (!r.hidden && regions.filter(r => r.parent === countryId && r.level === 2).map(t => t.id).indexOf(r.parent) >= 0))
		const showDepartments = _.has(country, 'fields.slug') && instance.countries[country.fields.slug].switches.showDepartments;

		const municipalities = this.state.municipalities;
		let departments = regions.filter(r => r.slug === country.fields.slug);
		departments.push(...regions.filter(r => r.parent === countryId));

		const availableServices = services.filter(s => !s.provider.vacancy);
		let sortedAvailableServices = [];

		if (availableServices) {
			sortedAvailableServices = _.orderBy(availableServices, ["region.level", "region.name", "name"], ["desc", "asc", "asc"]);
		}

		!loaded && this.renderLoader();

		return (
			<div className='desktop ServiceCategoryListDesktop'>
				<HeaderBar key={"Header"} title={t("services.Services", NS).toUpperCase()} />

				{this.renderFilters()}

				{!showServices && !this.state.showFilter && <div className="loader" />}

				{showServices && this.state.showMap &&
					<ServiceMapDesktop services={this.state.services} />
				}

				{/* RENDER POPOVERS */}
				{this.state.showFilter && this.state.filterType === FilterTypes.DEPARTMENT && departments && showDepartments &&
					this.renderFiltersPopover(t('services.Locations', NS), this.onSelectLocation, departments, this.renderDepartmentButton.bind(this), 'departments', FilterTypes.DEPARTMENT)
				}
				{this.state.showFilter && this.state.filterType === FilterTypes.DEPARTMENT && l3 && !showDepartments &&
					this.renderFiltersPopover(t('services.Locations', NS), this.onSelectLocation, l3, this.renderDepartmentButton.bind(this), 'departments', FilterTypes.DEPARTMENT)
				}

				{this.state.showFilter && this.state.filterType === FilterTypes.MUNICIPALITY && municipalities &&
					this.renderFiltersPopover(t('services.Municipalidades', NS), this.onSelectMunicipality, municipalities, this.renderMunicipalityButton.bind(this), 'municipalities', FilterTypes.MUNICIPALITIES)
				}

				{this.state.showFilter && this.state.filterType === FilterTypes.CATEGORY && categories &&
					this.renderFiltersPopover(t('services.Service Categories', NS), this.onSelectCategory, categories, this.renderCategoryButton.bind(this), 'categories', FilterTypes.CATEGORY)
				}

				{showServices && !this.state.showMap &&
					<div className="ServiceList">
						<div className="ServiceListContainer">
							{availableServices.map(this.renderServiceItem.bind(this))}
						</div>
					</div>
				}

				{!this.state.showMap && this.state.showMore && availableServices.length >= 10 &&
				!this.state.loadingMoreServices && window.location.href.includes('/services/all') &&
				<div className='show-more'><button onClick={this.onShowMore}>{t('services.Show More', NS)}</button></div>
			}

				{!this.state.showMap && this.state.showMore && this.state.loadingMoreServices && availableServices.length >= 10 &&
					<div className="loader" />
				}

				{this.state.showFilter && <div className="overlay" onClick={this.closeFilters}></div>}
			</div>
		);
	}
}

const mapState = ({ country, language, regions }, p) => ({ country, language, regions });

const mapDispatch = (d, p) => ({ goToService: (country, language, id) => d(push(routes.goToService(country, language, id))) });

export default translate()(connect(mapState, mapDispatch)(ServiceCategoryListDesktop));
