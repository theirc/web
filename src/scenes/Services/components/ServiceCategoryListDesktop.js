// libs
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { push } from "react-router-redux";
// import { Link } from 'react-router-dom';
import tinycolor from "tinycolor2";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import routes from "../routes";
import ServiceMapDesktop from "./ServiceMapDesktop";
import "../../../components/ActionsBar/ActionsBar.css";
import "./ServiceHome.css";
import "./ServiceCategoryList.css";
import "./ServiceCategoryListDesktop.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NS = { ns: "Services" };

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
    region: "",
    filterType: null,
    loaded: false,
    loadingMoreServices: false,
    location: {},
    cities: null,
    city: "",
    serviceCount: 0,
    services: [],
    servicesRendered: [],
    showFilter: true,
    showMore: true,
    showMap: !!this.props.mapView,
    showMunicipalities: false,
    showServices: false,
    switchHover: false,
  };

  componentDidMount() {
    const {
      category,
      country,
      cities,
      fetchCategories,
      fetchCitiesByRegion,
      fetchCategoriesByRegion,
      location,
      regions,
      showFilter,
      t,
      match,
    } = this.props;
    let c = regions.filter((r) => r.country.slug === country.fields.slug)[0];
    const { categories } = this.state;

    let l = "";
	let ci = "";
	console.log('PROPS ', this.props);

    if (match.params.region) {
      let tempL = regions.filter((r) => r.slug === match.params.region);
      l = tempL.length > 0 ? tempL[0] : "";
      fetchCitiesByRegion(l.id).then((cities) => {
        if (match.params.city) {
          let tempCi = cities.filter((c) => c.slug === match.params.city);
          ci = tempCi.length > 0 ? tempCi[0] : "";
        }
        if (!showFilter) {
			console.log('FFFF ', category);
          this.handleFetchServices(
            c.country.id,
            category,
            l ? l.id : "",
            ci ? ci.id : ""
          );
        }
        if (ci && categories.length === 0) {
          this.handleFetchCategoriesCity(ci.id, category);
        } else if (l && categories.length === 0) {
          fetchCategoriesByRegion(l.id).then((categories) => {
            let cat;
            if (category) {
              cat = categories.filter(
                (c) => c.id === parseInt(category, 10)
              )[0];
            }
            cat
              ? this.setState({ categories, category: cat, loaded: true })
              : this.setState({ categories, loaded: true });
          });
        }
        this.setState({
          cities: cities.filter((city) => city.isActive),
          showMunicipalities: true,
          city: ci ? ci : t("services.Municipalidades", NS),
        });
      });
    } else {
      if (!showFilter) {
		  console.log('TTT ', category);
        this.handleFetchServices(c.country.id, category);
      }
      if (fetchCategories && categories.length === 0) {
        this.handleFetchCategories(c.country.id, category);
      }
    }

    let department = ci ? ci : l ? l : c.country;

    this.setState({
      loaded: true,
      location: department,
      region: !l ? c.country.name : l,
      showFilter: showFilter,
    });
  }

  handleFetchServices(country, category = "", region = "", city = "") {
	const { fetchServices } = this.props;
	console.log('4444 ', category);
    fetchServices(country, category, region, city).then((services) => {
      let servicesFiltered = [];
      for (let x = 0; x < 10 && x < services.length; x++) {
        servicesFiltered.push(services[x]);
      }
      this.setState({
        services,
        showServices: true,
        servicesRendered: servicesFiltered,
        serviceCount: servicesFiltered.length,
      });
    });
  }

  handleFetchCategories(country, category = "") {
    const { fetchCategories } = this.props;
    fetchCategories(country).then((categories) => {
      let cat;
      if (category) {
        cat = categories.filter((c) => c.id === parseInt(category, 10))[0];
      }
      cat
        ? this.setState({ categories, category: cat, loaded: true })
        : this.setState({ categories, loaded: true });
    });
  }

  handleFetchCategoriesCity(city, category = "") {
    const { fetchCategoriesByCity } = this.props;
    fetchCategoriesByCity(city).then((categories) => {
      let cat;
      if (category) {
        cat = categories.filter((c) => c.id === parseInt(category, 10))[0];
      }
      cat
        ? this.setState({ categories, category: cat, loaded: true, showServices: true })
        : this.setState({ categories, loaded: true, showServices: true });
    });
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
    this.setState({ loadingMoreServices: true });
    const { services, serviceCount } = this.state;

    const servicesFiltered = [];
    for (
      let x = serviceCount - 1;
      servicesFiltered.length < 10 && x < services.length;
      x++
    ) {
      servicesFiltered.push(services[x]);
    }

    this.setState({
      loadingMoreServices: false,
      showMore: servicesFiltered.length === 10,
      servicesRendered: [...this.state.servicesRendered, ...servicesFiltered],
      serviceCount: this.state.servicesRendered.length,
    });
  };

  onSelectLocation = (element) => {
    const {
      fetchCategoriesByRegion,
      fetchCitiesByRegion,
      t,
      country,
    } = this.props;

    this.setState({
      location: element,
      region: element,
      city: t("services.Municipalidades", NS),
    });

    if (element.slug !== country.fields.slug) {
      fetchCitiesByRegion(element.id).then((cities) =>
        this.setState({
          cities: cities.filter((city) => city.isActive),
          showMunicipalities: true,
        })
      );

      fetchCategoriesByRegion(element.id).then((categories) =>
        this.setState({ categories, showServices: true })
      );
    } else {
      this.handleFetchCategories(element.id);
      this.setState({
        showServices: true,
        cities: null,
        showMunicipalities: false,
      });
    }
  };

  onSelectMunicipality = (element) => {
    this.setState({ location: element, city: element });

	this.handleFetchCategoriesCity(element.id);
  };

  onSelectCategory = (element) => {
    this.setState({ category: element });
  };

  showServices = (mapState = null) => {
    const { goTo } = this.props;
    const { location, category, cities, city, region } = this.state;

    console.log("111 ", region);
    console.log("222 ", city);
    console.log("333 ", location);

    let showMap = mapState != null ? mapState : this.state.showMap;
    this.setState({ showMap, showServices: true });
    goTo(region, city, location, category, showMap, cities);
  };

  closeFilters = () => {
    this.setState({ showFilter: false });
  };

  openFilters = (type) => {
    this.setState({ showFilter: true, filterType: type });
  };

  toggleMap = () => this.showServices(!this.state.showMap);

  departamentosFilter = () => {
    const { regions } = this.props;

    let currentLocation =
      this.state.location.level === 3
        ? regions.filter((r) => r.id === this.state.location.parent)[0]
        : this.state.location;

    this.setState({ location: currentLocation });
  };

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
    let { icon, name, translatedName } = category;

    const categoryName = translatedName ? translatedName : name;

    if (!icon) {
      return false;
    }

    let color = this.fixColor(category.color);
    color = tinycolor(color).saturate(30).toHexString();

    let style = {
      color: color === "#ffffff" ? "black" : color,
    };

    const buttonClass =
      this.state.category && category.id === this.state.category.id
        ? "location-item-selected"
        : "location-item";
    return (
      <button
        key={category.id}
        className={buttonClass}
        onClick={() => onSelect(category)}
      >
        <FontAwesomeIcon icon={icon} style={style} />
        {/* <i className={icon} style={style} /> */}
        <span>{categoryName}</span>
      </button>
    );
  }

  renderDepartmentButton(department, onSelect) {
    const { country, language } = this.props;
    const departmentT =
      department.data_i18n &&
      department.data_i18n.filter((x) => x.language === language)[0];
    const departmentInfo =
      departmentT && departmentT.name.length > 0 ? departmentT : department;
    return (
      <button
        key={`${department.id}-${department.slug}`}
        className={
          department.slug === this.state.location.slug
            ? "location-item-selected"
            : "location-item"
        }
        onClick={() => onSelect(department)}
      >
        {department.slug === country.fields.slug && (
          <FontAwesomeIcon icon="globe" />
        )}
        <span>{departmentInfo.name}</span>
      </button>
    );
  }

  renderMunicipalityButton(city, onSelect) {
    const { language } = this.props;
    const cityName = city[`name_${language}`]
      ? city[`name_${language}`]
      : city.name;
    return (
      <button
        key={city.id}
        className={
          city.id === this.state.city.id
            ? "location-item-selected"
            : "location-item"
        }
        onClick={() => onSelect(city)}
      >
        {city.level === 1 && <FontAwesomeIcon icon="globe" />}
        <span>{cityName}</span>
      </button>
    );
  }

  renderFilters = () => {
    let { cities } = this.state;
    let { t, language } = this.props;

    let categoryName = this.state.category
      ? this.state.category.name
      : t("services.All Categories", NS);
    let region = this.state.region.name
      ? this.state.region.data_i18n &&
        this.state.region.data_i18n.filter((x) => x.language === language)[0]
        ? this.state.region.data_i18n.filter((x) => x.language === language)[0]
            .name
        : this.state.region.name
      : this.state.region;
    let city = this.state.city.name
      ? this.state.city[`name_${language}`]
        ? this.state.city[`name_${language}`]
        : this.state.city.name
      : this.state.city;

    return (
      <div className="ActionsBar">
        <div className="left">
          <div
            id="btn-Locations"
            className="btn"
            onClick={() => {
              this.openFilters(FilterTypes.DEPARTMENT);
            }}
          >
            <span>{region}</span>
            <i className="material-icons">keyboard_arrow_down</i>
          </div>

          {cities && (
            <div
              className="btn"
              onClick={() => {
                this.openFilters(FilterTypes.MUNICIPALITY);
              }}
            >
              <span>{city}</span>
              <i className="material-icons">keyboard_arrow_down</i>
            </div>
          )}

          <div
            className="btn"
            onClick={() => this.openFilters(FilterTypes.CATEGORY)}
          >
            <span>{categoryName}</span>
            <i className="material-icons">keyboard_arrow_down</i>
          </div>

          <div className="line" />

          <div id="services-list-map-toggle">
            <input
              type="checkbox"
              id="map-view-toggle"
              className="switch bigswitch cn"
              checked={this.state.showMap}
              onMouseEnter={() => this.hoverMapSwitch(true)}
              onMouseLeave={() => this.hoverMapSwitch(false)}
              onChange={this.toggleMap}
            />
            <div
              className={`toggle-btn ${this.state.switchHover ? "hover" : ""}`}
            >
              <div></div>
            </div>
            <label htmlFor="map-view-toggle">
              {t("services.Map view", NS)}
            </label>
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
          {filterType === FilterTypes.CATEGORY && (
            <button
              key={0}
              className={
                !this.state.category
                  ? "location-item-selected"
                  : "location-item"
              }
              onClick={() => onSelect(null)}
            >
              <span>{t("services.All Categories", NS)}</span>
            </button>
          )}

          {list.map((l) => renderer(l, onSelect))}
        </div>

        <div className="filter">
          <button
            onClick={() => {
              this.closeFilters();
              this.showServices();
            }}
          >
            {t("services.Filter", NS)}
          </button>
        </div>
      </div>
    );
  }

  renderServiceItem(service) {
    const { country, goToService, language, measureDistance } = this.props;
    const distance =
      measureDistance && service.location && measureDistance(service.location);
    const serviceT =
      service.data_i18n &&
      service.data_i18n.filter((x) => x.language === language)[0];
    const providerT =
      service.provider &&
      service.provider.data_i18n &&
      service.provider.data_i18n.filter((p) => p.language === language)[0];
    const serviceInfo = serviceT ? serviceT : service;
    const providerInfo =
      providerT && providerT.name ? providerT : service.provider;

    let categoryStyle = (color) => {
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

    let mainType = service.serviceCategories
      ? service.serviceCategories[0]
      : "";
    let subTypes =
      service.serviceCategories.length > 1
        ? service.serviceCategories.filter((c) => c.id !== mainType.id)
        : "";

    return [
      <li
        key={service.id}
        className="Item"
        onClick={() => goToService(country, language, service.id)}
      >
        {mainType && (
          <div className="Icon" key={`${service.id}-0`}>
            <FontAwesomeIcon
              icon={mainType.icon}
              style={categoryStyle(mainType.color)}
            />
            {/* <i className={mainType.icon} style={categoryStyle(mainType.color)} /> */}
          </div>
        )}

        <div className="Info">
          <h1>{serviceInfo.name}</h1>

          <h2>
            {providerInfo && providerInfo.name}{" "}
            <span>
              {serviceInfo.address.length > 0
                ? serviceInfo.address
                : service.location}
              {distance && ` - ${distance}`}
            </span>
            <div className="Icons">
              {subTypes.length > 0 &&
                subTypes.map((t, idx) => (
                  <div className="Icon" key={`${service.id}-${idx}`}>
                    <FontAwesomeIcon
                      icon={t.icon}
                      style={categoryStyle(t.color)}
                    />
                    {/* <i className={t.icon} style={categoryStyle(t.color)} /> */}
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
    const { categories, loaded, showServices, servicesRendered } = this.state;
    const { t, regions, country } = this.props;
    let regionsRender = regions.filter(
      (r) => r.country && r.country.slug === country.fields.slug && r.isActive
    );
    regionsRender[0].country.name = country.fields.name;
    regionsRender.unshift(regionsRender[0].country);

    const cities = this.state.cities;

    !loaded && this.renderLoader();

    return (
      <div className="desktop ServiceCategoryListDesktop">
        <HeaderBar
          key={"Header"}
          title={t("services.Services", NS).toUpperCase()}
        />

        {this.renderFilters()}

        {!showServices && !this.state.showFilter && <div className="loader" />}

        {showServices && this.state.showMap && (
          <ServiceMapDesktop services={this.state.services} />
        )}

        {this.state.showFilter &&
          this.state.filterType === FilterTypes.DEPARTMENT &&
          regionsRender &&
          this.renderFiltersPopover(
            t("services.Locations", NS),
            this.onSelectLocation,
            regionsRender,
            this.renderDepartmentButton.bind(this),
            "departments",
            FilterTypes.DEPARTMENT
          )}

        {this.state.showFilter &&
          this.state.filterType === FilterTypes.MUNICIPALITY &&
          cities &&
          !!this.state.showMunicipalities &&
          this.renderFiltersPopover(
            t("services.Municipalidades", NS),
            this.onSelectMunicipality,
            cities,
            this.renderMunicipalityButton.bind(this),
            "municipalities",
            FilterTypes.MUNICIPALITIES
          )}

        {this.state.showFilter &&
          this.state.filterType === FilterTypes.CATEGORY &&
          categories &&
          this.renderFiltersPopover(
            t("services.Service Categories", NS),
            this.onSelectCategory,
            categories,
            this.renderCategoryButton.bind(this),
            "categories",
            FilterTypes.CATEGORY
          )}

        {showServices && !this.state.showMap && !!servicesRendered.length && (
          <div className="ServiceList">
            <div className="ServiceListContainer">
              {servicesRendered.map(this.renderServiceItem.bind(this))}
            </div>
          </div>
        )}

        {showServices && !this.state.showMap && !servicesRendered.length && (
          <div className="ServiceList">
            <div className="ServiceListContainer">
              {t("services.No services found", NS)}
            </div>
          </div>
        )}

        {!this.state.showMap &&
          this.state.showMore &&
          servicesRendered.length >= 10 &&
          !this.state.loadingMoreServices && (
            <div className="show-more">
              <button onClick={this.onShowMore}>
                {t("services.Show More", NS)}
              </button>
            </div>
          )}

        {!this.state.showMap &&
          this.state.showMore &&
          this.state.loadingMoreServices &&
          servicesRendered.length >= 10 && <div className="loader" />}

        {this.state.showFilter && (
          <div className="overlay" onClick={this.closeFilters}></div>
        )}
      </div>
    );
  }
}

const mapState = ({ country, language, regions }, p) => ({
  country,
  language,
  regions,
});

const mapDispatch = (d, p) => ({
  goToService: (country, language, id) =>
    d(push(routes.goToService(country, language, id))),
});

export default withTranslation()(
  connect(mapState, mapDispatch)(ServiceCategoryListDesktop)
);
