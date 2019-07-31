import React from "react";
import "./ServiceHome.css";
import "./ServiceCategoryList.css";
import { connect } from "react-redux";
import _ from "lodash";
import tinycolor from "tinycolor2";
import HeaderBar from "./HeaderBar";

class ServiceCategoryListDesktop extends React.Component {
	state = {
        categories: [],
		loaded: false,
        width: window.innerWidth,
		location: {},
		category:  null,
		showFilter: true,
		showMap: null,
		services: [],
		showServices: false
    };
    
    componentWillMount(){
        
    }

	componentDidMount() {
		const { country, regions, showFilter, mapView, location, category } = this.props;
		
		let c = regions.filter(r => r.slug === country.fields.slug)[0]
		let currentLocation = c;
		if (location){
			let l = regions.filter(r => r.slug === location);
			currentLocation = l.length > 0 ? l[0] : c;
		}
		this.setState({location: currentLocation, showFilter: showFilter, showMap: mapView, loaded: true})
		const { fetchCategories} = this.props;
        const { categories } = this.state;
		if (fetchCategories && categories.length === 0) {
			fetchCategories().then(categories => {
				this.setState({ categories, loaded: true });
				if (category){
					let cat = categories.filter(c => c.id == category)[0];
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
    }
    onSelectCategory = (element) =>{
        this.setState({ category: element});
	}
	
	showServices = () => {
		const { onGoToListAll, onGoToAllinLocation, onGoToAllinCategory, onGoToLocationByCategory } = this.props;
		const { onGoToMap, onGoToAllinLocatioMap, onGoToCategoryMap, onGoToLocationCategoryMap } = this.props

		if ((!this.state.location || this.state.location.level === 1)  && !this.state.category){
			onGoToListAll();
		}else if(this.state.location && this.state.location.level !== 1 && !this.state.category){
			onGoToAllinLocation(this.state.location.slug);			
		}else if((!this.state.location || this.state.location.level === 1) && this.state.category){			
			onGoToAllinCategory(this.state.category);
		}else if(this.state.location && this.state.location.level !== 1 && this.state.category){			
			onGoToLocationByCategory(this.state.category.id, this.state.location.slug);
		}

	}

	closeFilter = () => {
		this.setState({ showFilter : false});
	}

	showFilters = () => {
		this.setState({showFilter: true});
	}

	toggleMap = () => {
		let status = this.state.showMap;
		this.setState({showMap: !status})
		
	}

	renderCategory(c) {	
		let { id, name, vector_icon } = c;
		let iconPrefix = vector_icon.split("-")[0];

		let color = this.fixColor(c.color);
		color = tinycolor(color)
			.saturate(30)
			.toHexString();

		let style = {
            color: "black",
            float: "left"
		};
		return (
			<button key={c.id} className={this.state.category && c.id === this.state.category.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(c)}><i className={`${iconPrefix} ${vector_icon}`} style={style} />{c.name}</button>
		);
		
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
		const { categories, loaded, services, showServices } = this.state;
		const { width } = this.state;
		const { t, locationEnabled, toggleLocation, regions, country, language } = this.props;	
        
        let l3 = regions.filter(r => r.slug === 'greece' || (r.parent === 1 && r.level === 3 && !r.hidden) || (!r.hidden &&regions.filter(r => r.parent === 1 && r.level === 2).map(t => t.id).indexOf(r.parent) >= 0))
        console.log("Services:",this.state.services);
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
		let categoryName = this.state.category ? this.state.category.name : 'All Categories';
        let location = this.state.location ? this.state.location.title : 'All Locations';
        
		return <div>
					<HeaderBar key={"Header"} title={"Services".toUpperCase()}>
					<li onClick={toggleLocation || _.identity}>
						<h1>{"Order results by distance to me"}</h1>
						{!locationEnabled && <i className="MenuIcon material-icons">radio_button_unchecked</i>}
						{locationEnabled && <i className="MenuIcon material-icons">radio_button_checked</i>}
					</li>
					</HeaderBar>
				<div id="filter-bar" className="filter-bar">					
					<button id="btn-Locations" className="btn-filter" onClick={this.showFilters}>{location}</button>
					<button id="btn-Categories" className="btn-filter" onClick={this.showFilters}>{categoryName}</button>
					<label id="toggle-map">{'Map view'}<input type="checkbox" className="switch bigswitch cn" checked={this.state.showMap} onChange={this.toggleMap}/><div className="toggle-btn"><div></div></div>
					</label>
				</div>
				{ this.state.showFilter && 
				<div className="card">
					<a id="btn-close-filter" onClick={this.closeFilter} className="btn-close">X</a>
					<div id="title" className="filter-title">FILTERS CATEGORIES AND LOCATIONS</div>
					<div id="locations">
						<div id="location-title">LOCATIONS</div>
						<div id="location-list">
							{l3.map((l) => (
								<button key={l.id} className={l.id === this.state.location.id ? "location-item-selected" : "location-item"} onClick={() => this.onSelectLocation(l)}>{l.title}</button>
							))}
						</div>
					</div>
					<div id="categories">
						<div id="location-title">CATEGORIES</div>
						<div id="location-list">
							<button key={0} className={!this.state.category  ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(null)}>{'All Categories'}</button>

							{this.state.categories.map((c) => (
								this.renderCategory(c)
							))}
						</div>
					</div>
					<div id="button-search">
						<button className="show-services" onClick={this.showServices}>Show Services</button>
					</div>
				</div>
				}
				{showServices && 
				<div className="ServiceList">
					<div className="ServiceListContainer">
						{services.map(this.renderService.bind(this))}
					</div>
				</div>
				}
			
		</div>
	}
}
const mapState = ({ country, language, regions }, p) => {
	return { country, language, regions };
};
export default connect(mapState)(ServiceCategoryListDesktop);

//#export default translate()(ServiceCategoryListDesktop);
