import React from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import _ from "lodash";
import tinycolor from "tinycolor2";
import HeaderBar from "./HeaderBar";
import ServiceMapDesktop from "./ServiceMapDesktop";

import "./ServiceHome.css";
import "./ServiceCategoryList.css";

class ServiceCategoryListDesktop extends React.Component {

	state = {
		categories: [],
		category:  null,
		departmentFilters: false,
		loaded: false,
		location: {},
		municipalities: null,
		services: [],
		showFilter: true,
		showMap: this.props.mapView,
		showMunicipalities: false,
		showServices: false,
		switchHover: false
	};

	componentDidMount() {
		const { country, regions, showFilter, location, category } = this.props;
		let c = regions.filter(r => r.slug === country.fields.slug)[0]
	
		let currentLocation = c;
		if (location){
			let l = regions.filter(r => r.slug === location);
			currentLocation = l.length > 0 ? l[0] : c;
		}

		let municipalities = currentLocation.level === 3 ? regions.filter(r => r.parent === currentLocation.parent) : null;
		
		this.setState({
			loaded: true,
			location: currentLocation,
			municipalities: municipalities,
			showFilter: showFilter,
			showMunicipalities: !!municipalities,
		});

		const { fetchCategories} = this.props;
		const { categories } = this.state;

		if (fetchCategories && categories.length === 0) {
			fetchCategories().then(categories => {
				this.setState({ categories, loaded: true });
				if (category){
					let cat = categories.filter(c => c.id === parseInt(category))[0];
					if (cat){
						this.setState({category: cat});
					}
				}
			});				
		}
		if (!showFilter){
			const { fetchServices } = this.props;
			fetchServices(currentLocation.slug, category).then(
				services => this.setState({services: services.results, showServices: true})
			)
		}

	}

	hoverMapSwitch(hover) {
		this.setState({switchHover: hover});
	}

	fixColor(color) {
		if (!color) {
			color = "#FFF";
		} else if (color.indexOf("#") === -1) {
			color = `#${color}`;
		}
		return color;
    }
    
    onSelectLocation = (element) => {
		this.setState({ location: element});	
		const { fetchCategoriesByLocation } = this.props;
		fetchCategoriesByLocation(element.slug).then(
			categories => this.setState({categories: categories, showServices: true})
		)
    }
    onSelectCategory = (element) =>{
        this.setState({ category: element});
	}
	
	showServices = (mapState = null) => {
		let showMap = mapState != null ? mapState : this.state.showMap;
		const { goTo } = this.props;
		goTo(this.state.location, this.state.category, showMap);
	}

	closeFilter = () => {
		this.setState({ showFilter : false});
	}

	showFilters = () => {
		this.setState({showFilter: true});
	}

	hideFilters = () => this.setState({departmentFilters: false, categoryFilters: false});

	toggleDepartmentFiltersV2 = () => {
		this.setState({departmentFilters: !this.state.departmentFilters, categoryFilters: false});
	}

	toggleCategoryFiltersV2 = () => {
		this.setState({categoryFilters: !this.state.categoryFilters, departmentFilters: false});
	}

	toggleMap = () => this.showServices(!this.state.showMap);

	renderCategory(c) {	
		let { vector_icon } = c;
		let iconPrefix = vector_icon.split("-")[0];

		let color = this.fixColor(c.color);
		color = tinycolor(color)
			.saturate(30)
			.toHexString();

		let style = {
			color: color === "#ffffff" ? "black" : color,
		};
		return (
			<button key={c.id} className={this.state.category && c.id === this.state.category.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(c)}><i className={`${iconPrefix} ${vector_icon}`} style={style} /><span>{c.name}</span></button>
		);
		
	}
	departamentosFilter = (e) => {
		const { regions } = this.props;	
		let currentLocation = this.state.location.level === 3 ? regions.filter(r => r.id === this.state.location.parent)[0] : this.state.location;
		
		this.setState({ location: currentLocation, showMunicipalities: false, municipalities: null })
	}

	municipalidadesFilter = () => {
		const { regions } = this.props;	
		const department= this.state.location;
		if (department.level === 2){
			const municipalities = regions.filter(r => r.parent === department.id);
			this.setState({ municipalities: municipalities, showMunicipalities: true })
		}
		
	}

	renderService(s) {
		const { goToService, measureDistance } = this.props;
		const distance = measureDistance && s.location && measureDistance(s.location);

		let iconWithPrefix = vector_icon => vector_icon.split("-")[0] + " " + vector_icon;
		let categoryStyle = color => {
			if (!color) {
				color = "#000";
			} else if (color.indexOf("#") === -1) {
				color = `#${color}`;
			}

			color = tinycolor(color)
				.saturate(30)
				.darken(10)
				.toHexString();

			return {
				color: color,
				borderColor: tinycolor(color).darken(10),
			};
		};
		let fullAddress = [s.address, s.address_city].filter(val => val).join(", ");
		let mainType = s.type ? s.type : s.types[0];
		let subTypes = s.types.filter(t => t.id > 0 && t.id !== mainType.id);
		return [
			<li key={s.id} className="Item" onClick={() => goToService(s.id)}>
				<div className="Icon" key={`${s.id}-0`}>
					<i className={iconWithPrefix(mainType.vector_icon)} style={categoryStyle(mainType.color)} />
				</div>
				<div className="Info">
					<h1>{s.name}</h1>
					<h2>
						{s.provider.name}{" "}
						<small>
							{fullAddress}
							{distance && ` - ${distance}`}
						</small>
						<div className="Icons">
							{subTypes.map((t, idx) => (
								<div className="Icon" key={`${s.id}-${idx}`}>
									<i className={iconWithPrefix(t.vector_icon)} style={categoryStyle(t.color)} />
								</div>
							))}
						</div>
					</h2>
				</div>
				<i className="material-icons" />
			</li>,
		];
	}
	render() {
		const { loaded, services, showServices } = this.state;
		const { t, regions, goToService, country, showDepartments } = this.props;	
		let countryId = regions.filter(r => r.slug === country.fields.slug)[0].id;
		let l3 = regions.filter(r => r.slug === country.fields.slug || (r.parent === countryId && r.level === 3 && !r.hidden) || (!r.hidden &&regions.filter(r => r.parent === countryId && r.level === 2).map(t => t.id).indexOf(r.parent) >= 0))
		
		const municipalities = this.state.municipalities;
		let departments = regions.filter(r => r.slug === country.fields.slug);
		departments.push(...regions.filter(r => r.parent === countryId));

		const availableServices = services.filter(s => !s.provider.vacancy);
		let sortedAvailableServices =[]
		if (availableServices){
			sortedAvailableServices = _.orderBy(availableServices, ["region.level", "region.name", "name"], ["desc", "asc", "asc"]);
		}
		const unavailableServices = services.filter(s => s.provider.vacancy);

		if (!loaded) {
			return (
				<div>
					<div className="ServiceCategoryList">
						<div className="Title">
							<h1>{"Services"}</h1>
						</div>
						<div className="loader" />
					</div>
				</div>
			);
		}
		let categoryName = this.state.category ? this.state.category.name : t('All_Categories');
        let location = this.state.location ? (this.state.location.title ? this.state.location.title : this.state.location.name)  : t('All Locations');
				
		
		return <div className='desktop'>
				<HeaderBar key={"Header"} title={t("Services").toUpperCase()} />

				<div id="filter-bar" className="filter-bar">
					<div className='filters'>
						{/* <button id="btn-Locations" className="btn-filter" onClick={this.showFilters}><span>{location}</span><i className="material-icons">keyboard_arrow_down</i></button> */}
						<button id="btn-Locations" className="btn-filter" onClick={this.toggleDepartmentFiltersV2}><span>{location}</span><i className="material-icons">keyboard_arrow_down</i></button>
						<button id="btn-Categories" className="btn-filter" onClick={this.toggleCategoryFiltersV2}><span>{categoryName}</span><i className="material-icons">keyboard_arrow_down</i></button>
					</div>
					{!this.state.showFilter &&
						<div id="toggle-map">
							<input type="checkbox" className="switch bigswitch cn" checked={this.state.showMap} onMouseEnter={() => this.hoverMapSwitch(true)} onMouseLeave={() => this.hoverMapSwitch(false)} onChange={this.toggleMap}/>
							<div className={`toggle-btn ${this.state.switchHover ? 'hover' : ''}`}><div></div></div>
							<span>{t('Map view')}</span>
						</div>
					}
				</div>


					{this.state.departmentFilters && //!municipalities	&&						
						<div className='department-filters'>
							<div id="location-title">{t("Departamentos")}</div>
							{departments.map((l) => (
								<button key={l.id} className={l.id === this.state.location.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectLocation(l)}>
									{l.level === 1 && <i className='fa fa-globe'/>}<span>{l.name}</span>
								</button>
							))}

							<div className='filter'><button onClick={() => {this.hideFilters(); this.showServices()}}>Filtrar</button></div>
						</div>
					}

					{this.state.categoryFilters &&
						<div id="categories" className='category-filters'>
							<div id="location-title">{t("Service_Categories")}</div>
							<div id="location-list">
								<button key={0} className={!this.state.category  ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(null)}><span>{t('All_Categories')}</span></button>

								{this.state.categories.map((c) => (
									this.renderCategory(c)
								))}
							</div>

							<div className='filter'><button onClick={() => {this.hideFilters(); this.showServices()}}>Filtrar</button></div>
						</div>
					}

				{ this.state.showFilter && 

				<div className="card">
					{showServices && <a id="btn-close-filter" onClick={this.closeFilter} className="btn-close">X</a>}
					<div id="title" className="filter-title">{t("FILTERS CATEGORIES AND LOCATIONS")}</div>
					
					<div id="locations">
						{showDepartments && (<div className="location-filter" >
							<a id="location-filter"  onClick={this.departamentosFilter} className={this.state.showMunicipalities ? "" : 'location-filter-selected'}>{t('Departamentos')}</a> > 
							<a id="location-filter"  disabled={this.state.location.level === 1} onClick={this.municipalidadesFilter} className={!this.state.showMunicipalities ? "" : 'location-filter-selected'}>{t('Municipalidades')}</a>
							</div>)}
						{!showDepartments && <div id="location-title">{t('Locations')}</div>}
						<div id="location-list">
							{/* {this.state.departmentFilters && //!municipalities	&&						
								departments.map((l) => (
									<button key={l.id} className={l.id === this.state.location.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectLocation(l)}>
										{l.level === 1 && <i className='fa fa-globe' style={{marginRight: -13}}/>}<span>{l.name}</span>
									</button>
								))
							} */}
							{showDepartments && municipalities	&&						
								municipalities.map((l) => (
									<button key={l.id} className={l.id === this.state.location.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectLocation(l)}>
										{l.level === 1 && <i className='fa fa-globe' style={{marginRight: -13}}/>}<span>{l.name}</span>
									</button>
								))
							}
							{!showDepartments && l3.map((l) => (
								<button key={l.id} className={l.id === this.state.location.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectLocation(l)}>
									{l.level === 1 && <i className='fa fa-globe' style={{marginRight: -13}}/>}<span>{l.title}</span>
								</button>
							))}
						</div>
					</div>

					<hr className='separator'/>
					{/* <div id="categories">
						<div id="location-title">{t("Service_Categories")}</div>
						<div id="location-list">
							<button key={0} className={!this.state.category  ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(null)}><span>{t('All_Categories')}</span></button>

							{this.state.categories.map((c) => (
								this.renderCategory(c)
							))}
						</div>
					</div> */}
					{/* <div id="button-search">
						<button className="show-services" onClick={() => this.showServices(null)}>{t('Show Services')}</button>
					</div> */}
				</div>
				}
				{showServices && !this.state.showMap && !this.state.showFilter && 
					<div className="ServiceList">
						<div className="ServiceListContainer">
							{sortedAvailableServices.map(this.renderService.bind(this))}
						</div>
					</div>
				}
				{showServices && !this.state.showMap && !this.state.showFilter && unavailableServices.length > 0 && 
					<div className="ServiceListContainer Unavailable">
					<ul className="Items">
						<li style={{flexBasis: "100%",}}>
						<h1>Currently unavailable:</h1>
						</li>
						{unavailableServices.map(this.renderService.bind(this))}
					</ul>
				</div>
				}

				{!showServices && !this.state.showFilter && 
					<div className="loader" />
				}
				{showServices && this.state.showMap && !this.state.showFilter && 
				<ServiceMapDesktop services={this.state.services} goToService={goToService}/>
				}
			{!this.state.showMap && <div className="show-more"><button>{t('Show More')}</button></div>}
		</div>
	}
}
const mapState = ({ country, language, regions }, p) => {
	return { country, language, regions };
};
export default translate()(connect(mapState)(ServiceCategoryListDesktop));


