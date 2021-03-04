// libs
import React, { Component } from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faMapMarkerAlt,
  faHome,
} from "@fortawesome/pro-light-svg-icons";

// local
import i18nHelpers from "../../helpers/i18n";
import instance from "../../backend/settings";
import languages from "./languages";
import "./BottomNav.css";

const NS = { ns: "BottomNav" };

/**
 * @class
 * @description
 */
class BottomNav extends Component {
  static propTypes = {
    classes: PropTypes.object,
    onButtonClicked: PropTypes.func,
    onGoToCategories: PropTypes.func,
  };

  constructor(props) {
    super();
    this.state = { selectedIndex: props.index };

    i18nHelpers.loadResource(languages, NS.ns);
  }

  render() {
    const {
      country,
      t,
      onGoHome,
      onGoToCategories,
      onGoToServices,
    } = this.props;

    let paperStyle = {
      position: "fixed",
      bottom: 0,
      width: "100%",
      background: "white"
    };

    return (
      <div style={paperStyle} className="BottomNav">
        <div className="general-container">
          <span
            className={`button-container ${this.props.index === 0 ? "Selected" : ""}`}
            color="contrast"
            onClick={onGoHome}
          >
            <FontAwesomeIcon icon={faHome} />
            <span className="BottomButton">{t("menu.Home", NS)}</span>
          </span>

          {instance.countries[country].switches.showArticles && (
            <span
              className={`button-container ${this.props.index === 1 ? "Selected" : ""}`}
              color="contrast"
              onClick={onGoToCategories}
            >
              <FontAwesomeIcon icon={faFileAlt} />
              <span className="BottomButton">{t("menu.Articles", NS)}</span>
            </span>
          )}

          {instance.countries[country].switches.showServices && (
            <span
              className={`button-container ${this.props.index === 2 ? "Selected" : ""}`}
              color="contrast"
              onClick={onGoToServices}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span className="BottomButton">{t("menu.Services", NS)}</span>
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default translate()(BottomNav);
