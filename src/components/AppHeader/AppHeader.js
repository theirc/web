// libs
import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faMapMarkerAlt,
  faHome,
  faSearch,
  faTimesCircle,
  faTimes,
} from "@fortawesome/pro-light-svg-icons";
import Headroom from "react-headrooms";
import PropTypes from "prop-types";
import { Interpolate, withTranslation, Trans } from "react-i18next";
import "lazysizes";

// local
// import Alert from "../Alert/Alert";
import selectedMenuItem from "../../helpers/menu-items";
import i18nHelpers from "../../helpers/i18n";
import instance from "../../backend/settings";
import languages from "./languages";
import "./AppHeader.css";

const NS = { ns: "AppHeader" };

/**
 * @class
 * @description
 */
class AppHeader extends Component {
  static propTypes = {
    onChangeCountry: PropTypes.func,
    onGoToSearch: PropTypes.func,
    onGoHome: PropTypes.func,
    country: PropTypes.object,
    language: PropTypes.string,
    onGoToServices: PropTypes.func,
    onGoToCategories: PropTypes.func,
  };

  state = {
    search: false,
    prvalert: localStorage.getItem("privacy-policy"),
    searchText: "",
    active: false,
  };

  constructor() {
    super();
    i18nHelpers.loadResource(languages, NS.ns);
  }

  toggleClass() {
    const { currentState } = this.state.active;
    this.setState({ active: !currentState });
  }

  toggleSearch() {
    const { search } = this.state;
    if (!search) {
      //window.scrollTo(0, 0);
    }
    this.setState({ search: !search });
  }

  closeAlert() {
    this.setState({ prvalert: true });
    localStorage.setItem("privacy-policy", true);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    const { onGoToSearch } = this.props;
    const { searchText } = this.state;

    if (!searchText) return false;

    onGoToSearch(searchText);

    setTimeout(() => {
      this.setState({ search: false, searchText: "" });
    }, 200);

    event.preventDefault();
  }

  render() {
    const {
      country,
      headerColor,
      homePage,
      language,
      onChangeCountry,
      onChangeLanguage,
      onGoHome,
      onGoToCategories,
      onGoToServices,
      t,
    } = this.props;

    const { search, searchText } = this.state;
    const backgroundDark = headerColor === "light" ? false : true;
    const logo = instance.brand.images.logo || "/logo.svg";
    const logoBlack = instance.brand.images.logoBlack || logo;
    const noop = () => console.log("noop");
    const cookiePolicyLinkGreece = (
      <a
        href="/greece/about-us/cookies"
        target="_blank"
        rel="noopener noreferrer"
      >
        Cookie Policy
      </a>
    );
    const privacyPolicyLinkGreece = (
      <a
        href="/greece/about-us/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy Policy
      </a>
    );
    const cookiePolicyLinkIraq = (
      <a href="/iraq/privacy/cookies" target="_blank" rel="noopener noreferrer">
        Cookie Policy
      </a>
    );
    const privacyPolicyLinkIraq = (
      <a
        href="/iraq/privacy/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy Policy
      </a>
    );

    // let isOnServices = window.location.href.includes("/services");
    // let isOnArticlesGreece =
    //   window.location.href.includes("/categories") ||
    //   /(\/greece\/.*(\/.)*)/.test(window.location.href);

    // let disclaimersLink = `/greece/refugee-info-greece-closed/refugee-info-stops-operating-in-greece?language=${language}`;
    // disclaimersLink = window.location.href.includes(disclaimersLink)
    //   ? "#"
    //   : disclaimersLink;
    // let covidLinkCnEs = "/el-salvador/emergencia-por-coronavirus";
    // let covidLinkCnHn = "/honduras/alertas";
    // let covidLinkRiIt = "/italy/coronavirus-emergency";
    // let covidLinkRiGr = "/greece/coronavirus-emergency-in-greece";

    let selectedIndex = selectedMenuItem();
    let path = window.location.pathname;
    const langRTL = ["ur", "fa", "ar"].indexOf(language) > -1;

    return (
      <div className={backgroundDark ? "AppHeader" : "AppHeaderLight"}>
        <Headroom tolerance={5} offset={200}>
          <div
            className={[
              homePage ? "header-opacity" : "",
              backgroundDark ? "app-bar" : "app-bar-light",
              !(country && language) ? "app-bar-black" : "",
            ].join(" ")}
          >
            <div
              className={[
                "app-bar-container logo",
                !(country && language) ? "logo-centered" : "",
              ].join(" ")}
              onClick={path.includes("selectors") ? noop : onGoHome || noop}
            >
              <img
                onClick={onGoHome}
                data-src={!(country && language) ? logo : logoBlack}
                className="app-bar-logo lazyload"
                alt="bar-logo"
                width="111.13"
                height="42"
              />
            </div>

            {country && language && (
              <div className="app-bar-container buttons">
                <div className="app-bar-buttons">
                  <span
                    className={`app-bar-selectors top-menu ${
                      langRTL ? "rtl" : "ltr"
                    } ${selectedIndex === 0 ? "Selected" : ""}`}
                    color="contrast"
                    onClick={onGoHome || noop}
                  >
                    <FontAwesomeIcon icon={faHome} />
                    <span className="menu-item">{t("menu.Home", NS)}</span>
                  </span>

                  {instance.countries[country.fields.slug].switches
                    .showArticles && (
                    <span
                      className={`app-bar-selectors top-menu ${
                        langRTL ? "rtl" : "ltr"
                      } ${selectedIndex === 1 ? "Selected" : ""}`}
                      color="contrast"
                      onClick={onGoToCategories || noop}
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                      <span className="menu-item">
                        {t("menu.Articles", NS)}
                      </span>
                    </span>
                  )}

                  {instance.countries[country.fields.slug].switches
                    .showServices && (
                    <span
                      className={`app-bar-selectors top-menu ${
                        langRTL ? "rtl" : "ltr"
                      } ${selectedIndex === 2 ? "Selected" : ""}`}
                      color="contrast"
                      onClick={onGoToServices || noop}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span className="menu-item">
                        {t("menu.Services", NS)}
                      </span>
                    </span>
                  )}

                  <span className="selectors">
                    {!instance.switches.disableCountrySelector && (
                      <span
                        className="country"
                        color="contrast"
                        onClick={onChangeCountry || noop}
                      >
                        <img
                          data-src={`/images/flags/${country.fields.slug}.jpg`}
                          alt="country-flag"
                          className="lazyload"
                          width="30"
                          height="20.38"
                        />
                      </span>
                    )}

                    {!instance.switches.disableLanguageSelector && (
                      <span
                        className="lang"
                        color="contrast"
                        onClick={onChangeLanguage}
                      >
                        {language || " "}
                      </span>
                    )}
                  </span>

                  {!search && (
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="search-btn"
                      onClick={this.toggleSearch.bind(this)}
                    />
                  )}

                  {search && (
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="search-btn"
                      onClick={this.toggleSearch.bind(this)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </Headroom>

        {search && (
          <div className="search-bar-container">
            <form onSubmit={this.handleSubmit.bind(this)} className="SearchBar">
              <input
                autoComplete="off"
                autoFocus
                name="searchText"
                placeholder={t("menu.Search", NS)}
                type="text"
                value={searchText}
                onChange={this.handleInputChange.bind(this)}
              />
              {searchText && (
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="search-bar-inner-icon"
                  onClick={() => this.setState({ searchText: "" })}
                />
              )}
              <FontAwesomeIcon
                icon={faSearch}
                className="search-bar-inner-icon"
                onClick={this.handleSubmit.bind(this)}
              />
            </form>
          </div>
        )}

        {!this.state.prvalert && instance.switches.cookieBanner && (
          <div className={this.state.prvalert ? "hidden" : "privacy-banner"}>
            <div className="content">
              <span className="privacy-banner-separator"></span>
              <Trans
                i18nKey="COOKIES_BANNER"
                values={{
                  cookiePolicy: "Cookie Policy",
                  privacyPolicy: "Privacy Policy",
                }}
                cookiePolicy={cookiePolicyLinkGreece}
                components={{
                  generalContainer: <span>placeholder</span>,
                  cookieLink:
                    instance.brand.code === "ri"
                      ? cookiePolicyLinkGreece
                      : cookiePolicyLinkIraq,
                  privacyPolicy:
                    instance.brand.code === "ri"
                      ? privacyPolicyLinkGreece
                      : privacyPolicyLinkIraq,
                }}
              />
            </div>
            <FontAwesomeIcon
              icon={faTimes}
              className="close-alert"
              onClick={this.closeAlert.bind(this)}
            />
          </div>
        )}

        {/* {(isOnServices || isOnArticlesGreece) && window.location.href.includes('/greece/') &&
					<Alert
						link={covidLinkRiGr}
						header={isOnServices ? t('banner.Greece.ServicesHeader', NS) : t('banner.Greece.ArticlesHeader', NS)}
						message={isOnServices ? t("banner.Greece.Services", NS) : t('banner.Greece.Articles', NS)}
					/>
				}

				{!(isOnServices || isOnArticlesGreece) && window.location.href.includes('/greece') &&
					<Alert link={covidLinkRiGr} message={t('banner.Greece.Home', NS)} />
				} */}

        {/* {window.location.href.includes('/jordan') &&
					<Alert message={t('banner.Jordan', NS)} fontColor='white'/>
				}
				
				{window.location.href.endsWith('/el-salvador') &&
					<Alert link={covidLinkCnEs} message={t('banner.ElSalvador', NS)} bgColor='#ffda1a' fontColor='black'/>
				}

				{window.location.href.endsWith('/honduras') &&
					<Alert link={covidLinkCnHn} message={t('banner.ElSalvador', NS)} bgColor='#ffda1a' fontColor='black'/>
				}

				{window.location.href.endsWith('/italy') &&
					<Alert link={covidLinkRiIt} message={t('banner.Italy', NS)} fontColor='black'/>
				}

				{(window.location.href.endsWith('/greece') || window.location.href.includes('/greece/services'))  &&
					<Alert link='' message={t('banner.Greece.Covid', NS)} fontColor='black'/>
				} */}
      </div>
    );
  }
}

export default withTranslation()(AppHeader);
