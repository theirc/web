import React from "react";
import "./ServiceHome.css";
import "./ServiceCategoryList.css";
import ServiceMapDesktop from "./ServiceMapDesktop";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import _ from "lodash";
import tinycolor from "tinycolor2";
import HeaderBar from "./HeaderBar";
import { compose } from "redux";

class ServiceCategoryListDesktop extends React.Component {
	state = {
        categories: [],
		loaded: false,
        width: window.innerWidth,
		location: {},
		category:  null,
		showFilter: true,
		showMap: this.props.mapView,
		services: [],
		showServices: false,
		departments: [],
		municipalities: null,
		showMunicipalidades: false
    };
    
    componentWillMount(){
        
    }

	componentDidMount() {
		const { country, regions, showFilter, location, category } = this.props;
		let c = regions.filter(r => r.slug === country.fields.slug)[0]
		let departments = [];
	
		let currentLocation = c;
		if (location){
			let l = regions.filter(r => r.slug === location);
			currentLocation = l.length > 0 ? l[0] : c;
			
		}
		let municipalities = currentLocation.level === 3 ? regions.filter(r => r.parent === currentLocation.parent) : null
		
		this.setState({location: currentLocation, showFilter: showFilter, loaded: true, departments: departments, municipalities: municipalities, showMunicipalidades: !!municipalities})

		const { fetchCategories} = this.props;
        const { categories } = this.state;
		if (fetchCategories && categories.length === 0) {
			fetchCategories().then(categories => {
				this.setState({ categories, loaded: true });
				window.categories = categories;
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

	toggleMap = () => {
		this.showServices(!this.state.showMap);
	}

	renderCategory(c) {	
		let { vector_icon } = c;
		let iconPrefix = vector_icon.split("-")[0];

		let style = {
			color: "black"
		};
		return (
			<button key={c.id} className={this.state.category && c.id === this.state.category.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(c)}><i className={`${iconPrefix} ${vector_icon}`} style={style} /><span>{c.name}</span></button>
		);
		
	}
	departamentosFilter = (e) => {
		const { regions } = this.props;	
		let currentLocation = this.state.location.level === 3 ? regions.filter(r => r.id === this.state.location.parent)[0] : this.state.location;
		
		this.setState({ location: currentLocation, showMunicipalidades: false, municipalities: null })
	}

	municipalidadesFilter = () => {
		const { regions } = this.props;	
		const department= this.state.location;
		if (department.level === 2){
			const municipalities = regions.filter(r => r.parent === department.id);
			this.setState({ municipalities: municipalities, showMunicipalidades: true })
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
		const { t, locationEnabled, toggleLocation, regions, goToService, country, showDepartments } = this.props;	
        let countryId = regions.filter(r => r.slug === country.fields.slug)[0].id;
		window.regions = regions;
		window.country = country;
		let l3 = regions.filter(r => r.slug === country.fields.slug || (r.parent === countryId && r.level === 3 && !r.hidden) || (!r.hidden &&regions.filter(r => r.parent === countryId && r.level === 2).map(t => t.id).indexOf(r.parent) >= 0))
		
		const municipalities = this.state.municipalities;
		let departments = regions.filter(r => r.slug === country.fields.slug);
		departments.push(...regions.filter(r => r.parent === countryId));


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
        
		return <div>
					<HeaderBar key={"Header"} title={t("Services").toUpperCase()}>
					</HeaderBar>

				<div id="filter-bar" className="filter-bar">					
					<button id="btn-Locations" className="btn-filter" onClick={this.showFilters}>{location}</button>
					<button id="btn-Categories" className="btn-filter" onClick={this.showFilters}>{categoryName}</button>
					{!this.state.showFilter && <label id="toggle-map">{t('Map view')}<input type="checkbox" className="switch  bigswitch cn" checked={this.state.showMap} onChange={this.toggleMap}/><div className="toggle-btn"><div></div></div>
					</label>}
				</div>
				{ this.state.showFilter && 
				<div className="card">
					{showServices && <a id="btn-close-filter" onClick={this.closeFilter} className="btn-close">X</a>}
					<div id="title" className="filter-title">{t("FILTERS CATEGORIES AND LOCATIONS")}</div>
					<div id="locations">
						{showDepartments && (<div className="location-filter" >
							<a id="location-filter"  onClick={this.departamentosFilter} className={this.state.showMunicipalidades ? "" : 'location-filter-selected'}>{t('Departamentos')}</a> > 
							<a id="location-filter"  disabled={this.state.location.level === 1} onClick={this.municipalidadesFilter} className={!this.state.showMunicipalidades ? "" : 'location-filter-selected'}>{t('Municipalidades')}</a>
							</div>)}
						{!showDepartments && <div id="location-title">{t('Locations')}</div>}
						<div id="location-list">
							{showDepartments && !municipalities	&&						
								departments.map((l) => (
									<button key={l.id} className={l.id === this.state.location.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectLocation(l)}>
										{l.level === 1 && <i className='fa fa-globe' style={{marginRight: -13}}/>}<span>{l.name}</span>
									</button>
								))
							}
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
					<div id="categories">
						<div id="location-title">{t("Service_Categories")}</div>
						<div id="location-list">
							<button key={0} className={!this.state.category  ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(null)}><span>{'All_Categories'}</span></button>

							{this.state.categories.map((c) => (
								this.renderCategory(c)
							))}
						</div>
					</div>
					<div id="button-search">
						<button className="show-services" onClick={() => this.showServices(null)}>{t('Show Services')}</button>
					</div>
				</div>
				}
				{showServices && !this.state.showMap && !this.state.showFilter && 
				<div className="ServiceList">
					<div className="ServiceListContainer">
						{services.map(this.renderService.bind(this))}
					</div>
				</div>
				}
				{!showServices && !this.state.showFilter && 
					<div className="loader" />
				}
				{showServices && this.state.showMap && !this.state.showFilter && 
				<ServiceMapDesktop services={this.state.services} goToService={goToService}/>
				}
			
		</div>
	}
}
const mapState = ({ country, language, regions }, p) => {
	return { country, language, regions };
};
export default translate()(connect(mapState)(ServiceCategoryListDesktop));


