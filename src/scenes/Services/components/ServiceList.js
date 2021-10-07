// libs
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { push } from "react-router-redux";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import routes from "../routes";
import "./ServiceHome.css";

const NS = { ns: "Services" };
var tinycolor = require("tinycolor2");

/**
 * @class
 * @description
 */
class ServiceList extends React.Component {
  state = {
    category: {},
    services: [],
    loaded: false,
    errorMessage: null,
    serviceType: [],
    servicesRendered: [],
    showMore: true,
    serviceCount: 0,
    showServices: true,
    showServices: false,
  };

  componentDidMount() {
    const { servicesByType, listAllServices } = this.props;

    if (servicesByType) {
      servicesByType()
        .then(({ services, category }) => {

		  let servicesFiltered = [];
          for (let x = 0; x < 10 && x < services.length; x++) {
            servicesFiltered.push(services[x]);
          }

          this.setState({
            services,
            category,
            loaded: true,
            servicesRendered: servicesFiltered,
            showServices: true,
			serviceCount: servicesFiltered.length,
          });
        })
        .catch((c) =>
          this.setState({
            errorMessage: c.message,
            category: null,
            loaded: true,
          })
        );
    }

    if (listAllServices) {
      listAllServices()
        .then(({ services, category }) => {
          let servicesFiltered = [];
          for (let x = 0; x < 10 && x < services.length; x++) {
            servicesFiltered.push(services[x]);
          }

          this.setState({
            services,
            category,
            loaded: true,
            servicesRendered: servicesFiltered,
            showServices: true,
            serviceCount: servicesFiltered.length,
          });
        })
        .catch((c) =>
          this.setState({
            errorMessage: c.message,
            category: null,
            loaded: true,
          })
        );
    }

    const { fetchCategory } = this.props;
    const { serviceType } = this.state;

    if (fetchCategory && serviceType.length === 0) {
      fetchCategory().then((serviceType) => {
        this.setState({ serviceType });
      });
    }
  }

  onShowMore = () => {
    this.setState({ loadingMoreServices: true });
    const { services, serviceCount } = this.state;

    const servicesFiltered = [];
    for (
      let x = serviceCount;
      servicesFiltered.length < 10 && x < services.length;
      x++
    ) {
      servicesFiltered.push(services[x]);
    }

    this.setState({
      loadingMoreServices: false,
      showMore: servicesFiltered.length === 10,
      servicesRendered: [...this.state.servicesRendered, ...servicesFiltered],
      serviceCount: serviceCount + servicesFiltered.length,
    });
  };

  renderService(s) {
    const { country, goToService, language, measureDistance } = this.props;
    const distance =
      measureDistance && s.location && measureDistance(s.location);
    const serviceT =
      s.data_i18n && s.data_i18n.filter((x) => x.language === language)[0];
    const providerT =
      s.provider &&
      s.provider.data_i18n &&
      s.provider.data_i18n.filter((p) => p.language === language)[0];
    const serviceInfo = serviceT ? serviceT : s;
    const providerInfo = providerT ? providerT : s.provider;

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
    let mainType = s.type ? s.type : s.serviceCategories[0];
    let subTypes = s.serviceCategories.filter(
      (t) => t.id > 0 && t.id !== mainType.id
    );

    return [
      <li
        key={s.id}
        className="Item"
        onClick={() => goToService(country, language, s.id)}
      >
        <div className="Icon" key={`${s.id}-0`}>
          <i className={mainType.icon} style={categoryStyle(mainType.color)} />
        </div>

        <div className="Info">
          <h1>{serviceInfo.name}</h1>

          <h2>
            {providerInfo ? providerInfo.name : ""}{" "}
            <span>
              {serviceInfo.address.length > 0
                ? serviceInfo.address
                : s.location}
              {distance && ` - ${distance}`}
            </span>
            <div className="Icons">
              {subTypes.map((t, idx) => (
                <div className="Icon" key={`${s.id}-${idx}`}>
                  <i className={t.icon} style={categoryStyle(t.color)} />
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
    const { services, category, loaded, errorMessage, serviceType, showServices, servicesRendered } =
      this.state;
    const { t, nearby, showMap } = this.props;
    let categoryName = serviceType.length !== 0 ? serviceType.name : "";
    let titleName = categoryName ? categoryName : t("services.Services", NS);

    if (!loaded) {
      return (
        <div className="ServiceList">
          <HeaderBar
            title={nearby ? t("services.Nearby Services", NS) : titleName}
          />
          <div className="loader" />
        </div>
      );
    }

    return (
      <div className="ServiceList">
        <HeaderBar
          title={
            nearby
              ? t("services.Nearby Services", NS)
              : category
              ? category.name
              : titleName
          }
        />

        {errorMessage && (
          <div className="Error">
            <em>{errorMessage}</em>
          </div>
        )}

        {services.length === 0 && !errorMessage && (
          <div className="Error">
            <em>{t("services.No services found", NS)}</em>
          </div>
        )}

        {services.length > 0 && (
          <div className="ServiceListContainer">
            <ul className="Items">
              <li
                className="Item service-map"
                onClick={showMap}
                style={{ flexBasis: "100%" }}
              >
                <div className="Icon">
                  <i className="fa fa-map" />
                </div>

                <div className="Info" style={{ alignSelf: "center" }}>
                  <h1>{t("services.Service Map", NS)}</h1>
                </div>

                <i className="material-icons" />
              </li>

              {servicesRendered.map(this.renderService.bind(this))}
            </ul>
          </div>
        )}

        {servicesRendered.length >= 10 && !this.state.loadingMoreServices && (
          <div className="show-more">
            <button onClick={this.onShowMore}>
              {t("services.Show More", NS)}
            </button>
          </div>
        )}
      </div>
    );
  }
}

const mapState = ({ country, language }, p) => ({ country, language });

const mapDispatch = (d, p) => ({
  goToService: (country, language, id) =>
    d(push(routes.goToService(country, language, id))),
});

export default withTranslation()(connect(mapState, mapDispatch)(ServiceList));
