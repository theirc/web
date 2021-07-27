// libs
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";
import "lazysizes";
import { MetaTags } from "react-meta-tags";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import routes from "../routes";
import fbHelpers from "../../../helpers/facebook";
import "../../../components/ActionsBar/ActionsBar.css";
import "./ServiceDetail.css";
import "./ServiceHome.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/pro-regular-svg-icons";
import {
  faFacebookF,
  faViber,
  faWhatsapp,
  faSkype,
  faTelegramPlane,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

const NS = { ns: "Services" };

//temp API Key from Andres Aguilar
const GMAPS_API_KEY = "AIzaSyAK54Ir69gNM--M_5dRa0fwVH8jxWnJREQ";
const hotlinkTels = (input) => input;

/**
 * @class
 * @description
 */
class ServiceDetail extends React.Component {
  state = {
    service: null,
    relatedServices: [],
  };

  static propTypes = {
    slug: PropTypes.string,
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);
    const { language } = this.props;
    let copySlug = "";

    if (window.location.toString().indexOf("language=") > -1) {
      copySlug = window.location;
    } else {
      copySlug =
        window.location +
        (window.location.toString().indexOf("?") > -1 ? "&" : "?") +
        "language=" +
        language;
    }

    this.state = {
      value: copySlug,
      copied: false,
      shareIN: true,
      showOtherServices: true,
    };
    this.sharePage = this.sharePage.bind(this);
    this.showServices = this.showServices.bind(this);
    this.Copiedlnk = this.Copiedlnk.bind(this);
  }

  showServices() {
    this.setState({ showOtherServices: !this.state.showOtherServices });
  }

  sharePage() {
    this.setState((prevState) => ({ shareIN: false }));
  }

  Copiedlnk() {
    navigator.clipboard.writeText(document.location.href);

    this.setState((prevState) => ({ copied: !prevState.copied }));
    setTimeout(() => {
      this.setState({ shareIN: true });
      setTimeout(() => {
        this.setState((prevState) => ({ copied: !prevState.copied }));
      }, 2);
    }, 3000);
  }

  onCopyLink = () => {
    this.setState({ copied: true });

    navigator.clipboard.writeText(document.location.href);

    setTimeout(() => this.setState({ copied: false }), 1500);
  };

  componentDidMount() {
    const { fetchService, fetchServicesInSameLocation, history } = this.props;
    if (fetchService) {
      fetchService().then((service) => {
        !service && history.push("/404");
        this.setState({ service });
      });
    }

    if (fetchServicesInSameLocation) {
      fetchServicesInSameLocation().then((relatedServices) =>
        this.setState({ relatedServices })
      );
    }
  }

  componentWillUnmount() {
    const ReadSpeaker = window.ReadSpeaker;
    const rspkr = window.rspkr;
    ReadSpeaker.q(function () {
      if (rspkr.ui.getActivePlayer()) {
        rspkr.ui.getActivePlayer().close();
      }
    });
  }

  renderContactInformation(ci, callAux) {
    let { value, type, id } = ci;
    let typography;
    let action;
    let typeText;
    let textClass = "noPhoneFormat";
    const toUrl = (u) => (u.indexOf("http") === -1 ? `http://${u}` : u);

    switch (type) {
      case "whatsapp":
        typography = faWhatsapp;
        action = `whatsapp://send?phone=${value}`;
        typeText = "Whatsapp: ";
        break;

      case "skype":
        typography = faSkype;
        action = `skype:${value}?chat`;
        typeText = "Skype: ";
        break;

      case "facebook_messenger":
        typography = faFacebookF;
        action = `${toUrl(value)}`;
        typeText = "Facebook: ";
        break;

      case "viber":
        typography = faViber;
        action = `viber://add?number=${value}`;
        typeText = "Viber: ";
        break;

      case "phone":
        typography = "phone";
        action = `tel:${value}`;
        typeText = callAux + ":";
        textClass = "phoneFormat";
        break;

      case "telegram":
        typography = faTelegramPlane;
        action = `tel:${value}`;
        typeText = "Telegram: ";
        textClass = "phoneFormat";
        break;

      case "email":
        typography = "envelope";
        action = `mailto:${value}`;
        typeText = "Email: ";
        break;

      case "instagram":
        typography = faInstagram;
        action = `${toUrl(value)}`;
        typeText = "Instagram: ";
        break;

      case "twitter":
        typography = faTwitter;
        action = `${toUrl(value)}`;
        typeText = "Twitter: ";
        break;

      case "signal":
        typography = "phone";
        action = `tel:${value}`;
        typeText = "Signal: ";
        textClass = "phoneFormat";
        break;

      case "website":
        typography = "external-link-alt";
        action = `${toUrl(value)}`;
        typeText = "Website: ";
        break;

      default:
        break;
    }
    return (
      <div className="Selector" onClick={() => window.open(action)} key={id}>
        <span className="icon-placeholder">
          <FontAwesomeIcon className="MenuIcon" icon={typography} />
        </span>

        <h1>
          <span style={{ display: "inline-block", overflow: "hidden" }}>
            {typeText}
          </span>
          <div
            className="field"
            style={{
              display: "inline-block",
              direction: "ltr",
              marginLeft: "5px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </div>
        </h1>
      </div>
    );
  }

  render() {
    const { service, relatedServices } = this.state;
    const { country, goToService, language, instance, t } = this.props;
    const weekDays = [
      { id: 1, name: "Monday" },
      { id: 2, name: "Tuesday" },
      { id: 3, name: "Wednesday" },
      { id: 4, name: "Thursday" },
      { id: 5, name: "Friday" },
      { id: 6, name: "Saturday" },
      { id: 7, name: "Sunday" },
    ];

    if (!service) {
      return (
        <div className="ServiceList">
          <div className="loader" />
        </div>
      );
    }

    const hasHours = (o) => {
      return (
        o.isAlwaysOpen ||
        !!o.serviceOpeningHours.filter(
          (x) => !!x.open.trim().length || !!x.close.trim().length
        ).length
      );
    };

    const callAux = t("services.Call", NS);
    const serviceProviderElement = (s) => (
      <span className="providerName">{s.name}</span>
    );

    const showTimeTable = (ampmEnabled, openingHours) => {
      return weekDays.map((w, i) => {
        let hours = openingHours.filter((h) => h.day === w.id);
        // function to convert time format from 24 to 12 hs
        if (!!ampmEnabled) {
          hours.map((x) => {
            x.open = x.open.toLowerCase();
            x.close = x.close.toLowerCase();
            if (!!x.open.trim() && !x.open.includes("am")) {
              let open = x.open?.split(":").map(Number);
              let ampmOpen = open[0] >= 12 ? "pm" : "am";
              open[0] = open[0] % 12;
              open[0] = open[0] < 10 ? "0" + open[0] : open[0];
              open[0] = open[0] ? open[0] : 12;
              open[1] = open[1] < 10 ? "0" + open[1] : open[1];
              x.open = open[0] + ":" + open[1] + " " + ampmOpen;
            }
            if (!!x.close.trim() && !x.close.includes("pm")) {
              let close = x.close?.split(":").map(Number);
              let ampmClose = close[0] >= 12 ? "pm" : "am";
              close[0] = close[0] % 12;
              close[0] = close[0] < 10 ? "0" + close[0] : close[0];
              close[0] = close[0] ? close[0] : 12;
              close[1] = close[1] < 10 ? "0" + close[1] : close[1];
              x.close = close[0] + ":" + close[1] + " " + ampmClose;
            }
            return x;
          });
        }

        return hours.map((h) => (
          <tr key={`tr-${h.id}`}>
            <td rowSpan="1" className="week">
              {t(w.name)}
            </td>
            <td
              className={`${
                !h.open.trim() && !h.close.trim() && "not-visible"
              }`}
            >
              {h.open}
            </td>
            <td
              className={`${
                !h.open.trim() && !h.close.trim() && "not-visible"
              }`}
            >
              -
            </td>
            <td
              className={`${
                !h.open.trim() && !h.close.trim() && "not-visible"
              }`}
            >
              {h.close}
            </td>
            <td
              className={`${
                !!h.open.trim() && !!h.close.trim() && "not-visible"
              }`}
              colSpan="3"
            >
              {t("services.Closed", NS)}
            </td>
          </tr>
        ));
      });
    };

    const serviceT = service.data_i18n.filter(
      (x) => x.language === language
    )[0];
    const providerT = service.provider.data_i18n.filter(
      (x) => x.language === language
    )[0];
    const providerInfo =
      providerT && providerT.name ? providerT : service.provider;

    let sortedContactInformation = service.serviceContactInformations;

    let subtitle =
      service.serviceCategories && service.serviceCategories.length > 0
        ? service.serviceCategories[0].name
        : "";
    // let phoneNumberWithCode = countryCode + service.phone_number;

    let appendLeadingZeroes = (n) => {
      if (n <= 9) {
        return "0" + n;
      }
      return n;
    };

    const updatedDate = (param) => new Date(param);
    const updatedAtDate = (param) =>
      `${updatedDate(param).getFullYear()}.${appendLeadingZeroes(
        updatedDate(param).getMonth() + 1
      )}.${appendLeadingZeroes(updatedDate(param).getDate())}`;
    const url = encodeURIComponent(window.location.href);

    let lang = "";
    switch (language) {
      case "en":
        lang = "en_uk";
        break;
      case "ar":
        lang = "ar_ar";
        break;
      case "fr":
        lang = "fr_be";
        break;
      case "fa":
        lang = "fa_ir";
        break;
      default:
        lang = "";
        break;
    }

    return (
      <div>
        <div className="ServiceDetail" id="ServiceDetail">
          <Helmet>
            <title>{serviceT.name}</title>
          </Helmet>

          <MetaTags>
            <meta property="og:title" content={serviceT.name} />
            <meta property="og:image" content={service.image} />
            <meta property="og:description" content={serviceT.description} />
          </MetaTags>

          <HeaderBar subtitle={`${subtitle}:`} title={serviceT.name} />

          {service.image && (
            <div className="hero">
              <div className="HeroImageContainer">
                <img
                  data-src={service.image}
                  alt={service.name}
                  className="lazyload"
                />
              </div>
            </div>
          )}

          <div className="ActionsBar">
            <div className="left"></div>
            <div className="social">
              <div
                href="#"
                className="social-btn"
                onClick={() => fbHelpers.share(language)}
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </div>

              <div href="#" className="social-btn" onClick={this.onCopyLink}>
                {!this.state.copied ? (
                  <FontAwesomeIcon icon="link" />
                ) : (
                  <FontAwesomeIcon icon={faCopy} />
                )}
                {this.state.copied && (
                  <span className="copied">{t("services.Copied", NS)}</span>
                )}
              </div>
            </div>
          </div>

          {instance.brand.url === "refugee.info" && lang.length > 0 && (
            <div id="readspeaker_button1" className="rs_skip rsbtn rs_preserve">
              <a
                rel="nofollow"
                className="rsbtn_play"
                accessKey="L"
                title="ReadSpeaker webReader إستمع إلى هذه الصفحةِ مستخدماً"
                href={`//app-eu.readspeaker.com/cgi-bin/rsent?customerid=11950&amp;lang=${lang}&amp;readid=ServiceDetail&amp;url=${url}`}
              >
                <span className="rsbtn_left rsimg rspart">
                  <span className="rsbtn_text">
                    <span>Listen</span>
                  </span>
                </span>
                <span className="rsbtn_right rsimg rsplay rspart"></span>
              </a>
            </div>
          )}

          <article>
            <span className="author">
              <span>{t("services.LAST_UPDATED", NS)}</span>{" "}
              {updatedAtDate(service.updatedAt)}
            </span>

            {providerInfo && (
              <h2 className="provider">
                {t("services.Service Provider", NS)}:&nbsp;
                {serviceProviderElement(providerInfo)}
              </h2>
            )}

            <h2>{serviceT.name}</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: hotlinkTels(serviceT.description),
              }}
            />
            {service.localAddress && (
              <>
                <h3>{t("services.Address in Local Language", NS)}</h3>
                <p>{service.localAddress}</p>
              </>
            )}

            {hasHours(service) && (
              <span>
                <h3>{t("services.Visiting hours", NS)}</h3>
                <p>{service.isAlwaysOpen && t("services.Open 24/7", NS)}</p>
                <div className="openingTable">
                  {!service.isAlwaysOpen && (
                    <table>
                      <tbody>
                        {showTimeTable(
                          service?.country?.ampmEnabled,
                          service.serviceOpeningHours
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </span>
            )}

            {service.costOfService && (
              <h3>{t("services.Cost of service", NS)}</h3>
            )}
            {service.costOfService && <p>{service.costOfService}</p>}

            {service.latitude && service.longitude && (
              <p>
                <img
                  className="MapCursor"
                  alt={serviceT.name}
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${service.latitude},${service.longitude}`
                    )
                  }
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${service.latitude},${service.longitude}&zoom=16&size=600x300&maptype=roadmap&markers=${service.latitude},${service.longitude}&key=${GMAPS_API_KEY}`}
                />
              </p>
            )}
          </article>

          {this.state.showOtherServices ? (
            <div className="footer">
              {service.latitude && service.longitude && (
                <div
                  className="Selector"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${service.latitude},${service.longitude}`
                    )
                  }
                >
                  <span className="icon-placeholder">
                    <FontAwesomeIcon
                      icon="map-marker-alt"
                      className="MenuIcon"
                    />
                  </span>

                  <h1>{t("services.Get directions", NS)}</h1>
                </div>
              )}

              {service.serviceContactInformations &&
                sortedContactInformation.map((ci) =>
                  this.renderContactInformation(ci, callAux)
                )}

              {(relatedServices || []).length > 0 && (
                <div className="Selector" onClick={() => this.showServices()}>
                  <span className="icon-placeholder">
                    <FontAwesomeIcon icon="angle-right" className="MenuIcon" />
                  </span>
                  <h1>{t("services.OTHER_SERVICES", NS)}</h1>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="footer">
                <div className="Selector">
                  <h1 className="RelatedServicesTitle">
                    {t("services.OTHER_SERVICES", NS)}:
                  </h1>
                </div>

                {relatedServices.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => goToService(country, language, r.id)}
                  >
                    <div className="Selector related">
                      <span className="icon-placeholder">
                        <FontAwesomeIcon
                          icon="angle-right"
                          className="MenuIcon"
                        />
                      </span>
                      <h1 href="#/">
                        <div
                          style={{
                            display: "inline-block",
                            direction: "ltr",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {r.name}
                        </div>
                      </h1>
                    </div>
                  </div>
                ))}

                <div
                  className="Selector back"
                  onClick={() => this.showServices()}
                >
                  <span className="icon-placeholder">
                    <FontAwesomeIcon icon="angle-left" className="MenuIcon" />
                  </span>

                  <h1>{t("services.Back", NS)}</h1>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapState = ({ country, language }, p) => ({ country, language });

const mapDispatch = (d, p) => ({
  goToService: (country, language, id) =>
    d(push(routes.goToService(country, language, id))),
});

export default withTranslation()(connect(mapState, mapDispatch)(ServiceDetail));
