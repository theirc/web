import React from "react";
import "./ServiceHome.css";
import "./ServiceCategoryList.css";
import { connect } from "react-redux";
import _ from "lodash";
import tinycolor from "tinycolor2";

class ServiceCategoryListDesktop extends React.Component {
	state = {
        categories: [],
		loaded: false,
        width: window.innerWidth,
		location: {},
		category:  null,
    };
    
    componentWillMount(){
        
    }

	componentDidMount() {
		const { country, regions } = this.props;
        let c = regions.filter(r => r.slug === country.fields.slug)[0]

        this.setState({ location: c});
		const { fetchCategories} = this.props;
        const { categories} = this.state;
        
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
    
    onSelectLocation = (element) => {
		this.setState({ location: element});
    }
    onSelectCategory = (element) =>{
        this.setState({ category: element});
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
	render() {
		const { categories, loaded } = this.state;
		const { t, locationEnabled, toggleLocation, listAllServices, goToLocationList, goToMap, locationName, departmentSelected, regions, country, language } = this.props;	
        const { width } = this.state;
        //locations.push(...locationsl3);
        let l3 = regions.filter(r => r.slug === 'greece' || (r.parent === 1 && r.level ===3 && !r.hidden) || (!r.hidden &&regions.filter(r => r.parent == 1 && r.level ==2).map(t => t.id).indexOf(r.parent) >= 0))
        
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
		
		let categoryName = this.state.category ? this.state.category.name : 'All Categories';
        let location = this.state.location ? this.state.location.title : 'All Locations';
        
		return <div>

				<div id="filter-bar" className="filter-bar">
					<button id="btn-Locations" className="btn-filter">{location}</button>
					<button id="btn-Categories" className="btn-filter">{categoryName}</button>
					<label id="toggle-map">{t('Map view')}<input type="checkbox" className="switch bigswitch cn"  /><div className="toggle-btn"><div></div></div>
					</label>
				</div>
				<div className="card">
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
							<button key={0} className={!this.state.category  ? "location-item-selected" : "location-item"} onClick={() => this.onSelectCategory(null)}>{t('All Categories')}</button>

							{this.state.categories.map((c) => (
								this.renderCategory(c)
							))}
						</div>
					</div>
					<div id="button-search">
						<button className="show-services">Show Services</button>
					</div>
				</div>
			
		</div>
	}
}
const mapState = ({ country, language, regions }, p) => {
	return { country, language, regions };
};
export default connect(mapState)(ServiceCategoryListDesktop);

//#export default translate()(ServiceCategoryListDesktop);
