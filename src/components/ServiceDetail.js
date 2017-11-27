import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";
import moment from "moment";
import { Share } from "material-ui-icons";
import { Helmet } from "react-helmet";
import HeaderBar from "./HeaderBar";

// eslint-disable-next-line
var tinycolor = require("tinycolor2");
const GMAPS_API_KEY = "AIzaSyA7eG6jYi03E6AjJ8lhedMuaLS9mVoJjJ8";
const hotlinkTels = input => input.replace(/(\+[1-9]{1}[0-9]{3,19}|00[0-9]{3,15})/g, `<a class="tel" href="tel:$1">$1</a>`);

class ServiceDetail extends React.Component {
	state = {
		service: null,
		relatedServices: [],
	};

	share() {
		const { language } = this.props;

		if (global.window) {
			const { FB } = global.window;
			let { href } = window.location;
			href += (href.indexOf("?") > -1 ? "&" : "?") + "language=" + language;

			if (FB) {
				FB.ui(
					{
						method: "share",
						href,
					},
					function(response) {}
				);
			}
		}
	}

	componentDidMount() {
		const { fetchService, fetchServicesInSameLocation } = this.props;
		if (fetchService) {
			fetchService().then(service => this.setState({ service }));
		}

		if (fetchServicesInSameLocation) {
			fetchServicesInSameLocation().then(relatedServices => this.setState({ relatedServices }));
		}
	}
	render() {
		const { service, relatedServices } = this.state;
		const { t, language, goToService } = this.props;
		const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		if (!service) {
			return (
				<div className="ServiceDetail">
					<HeaderBar title={t("Service Detail")} />
					<div className="loader" />
				</div>
			);
		}
		const firstOrDefault = a => _.first(a) || {};
		const toUrl = u => (u.indexOf("http") === -1 ? `http://${u}` : u);
		const hasHours = o => {
			return o["24/7"] || weekDays.map(w => o[w.toLowerCase()].map(h => !!(h.open || h.close)).indexOf(true) > -1).indexOf(true) > -1;
		};

		const amPmTime = time => {
			const m = moment(moment(`2001-01-01 ${time}`).toJSON())
				.locale(false)
				.locale(language);
			return `${m.format("hh:mm")} ${m.hour() >= 12 ? t("pm") : t("am")}`;
		};
		const serviceProviderElement = s => {
			return s.provider.website ? (
				<a href={toUrl(s.provider.website)} rel="noopener noreferrer" target="_blank">
					{s.provider.name}
				</a>
			) : (
				s.provider.name
			);
		};

		let point = service.location && _.reverse(_.clone(service.location.coordinates)).join(",");

		return (
			<div className="ServiceDetail">
				<Helmet>
					<title>{service.name}</title>
				</Helmet>
				<HeaderBar subtitle={`${_.first(service.types).name}:`} title={service.name} />
				<div className="hero">
					<h2>
						<small>{t("Service Provider")}:</small>
						{serviceProviderElement(service)}
					</h2>
					{service.image && <img src={service.image} alt={service.provider.name} />}
				</div>

				<article>
					<p dangerouslySetInnerHTML={{ __html: hotlinkTels(service.description) }} />

					{service.additional_info && <h3>{t("Additional Information")}</h3>}
					{service.additional_info && <p dangerouslySetInnerHTML={{ __html: hotlinkTels(service.additional_info) }} />}

					{service.languages_spoken && <h3>{t("Languages Spoken")}</h3>}
					{service.languages_spoken && <p dangerouslySetInnerHTML={{ __html: service.languages_spoken }} />}

					{hasHours(service.opening_time) && (
						<span>
							<h3>{t("Opening hours")}</h3>
							<div>{service.opening_time["24/7"] && t("Open 24/7")}</div>
							<div className="openingTable">
								{!service.opening_time["24/7"] && (
									<table>
										<tbody>
											{weekDays.map((w, i) => (
												<tr key={`tr-${i}`}>
													<td>{t(w)}</td>
													{!firstOrDefault(service.opening_time[w.toLowerCase()]).open && <td colSpan="2">{t("Closed")}</td>}
													{firstOrDefault(service.opening_time[w.toLowerCase()]).open && [
														<td key="open">{amPmTime(firstOrDefault(service.opening_time[w.toLowerCase()]).open)}</td>,
														<td key="close">{amPmTime(firstOrDefault(service.opening_time[w.toLowerCase()]).close)}</td>,
													]}
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						</span>
					)}
					{service.address && <h3>{t("Address")}</h3>}
					{service.address && <p>{service.address}</p>}

					{service.address_city && <h4>{t("City")}</h4>}
					{service.address_city && <p>{service.address_city}</p>}

					{service.address_in_country_language && <h3>{t("Address in Country Language")}</h3>}
					{service.address_in_country_language && <p>{service.address_in_country_language}</p>}

					{point && (
						<p>
							<img
								alt={service.name}
								onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${point}`)}
								src={`https://maps.googleapis.com/maps/api/staticmap?center=${point}&zoom=16&size=600x300&maptype=roadmap&markers=${point}&key=${GMAPS_API_KEY}`}
							/>
						</p>
					)}

					{relatedServices.length > 0 && <h3>{t("Other services at this location")}:</h3>}
					{relatedServices && (
						<ul className="RelatedServices">
							{relatedServices.map(r => (
								<li key={r.id} onClick={() => goToService(r.id)}>
									<btn-muted>{r.name}</btn-muted>
								</li>
							))}
						</ul>
					)}
				</article>
				<div className="footer">
					<div className="Selector" onClick={() => this.share()}>
						<h1>{t("Share this page")}</h1>
						<Share className="MenuIcon" />
					</div>

					{service.location && <hr />}
					{service.location && (
						<div className="Selector" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${point}`)}>
							<h1>{t("Get Directions")}</h1>
							<i className="MenuIcon fa fa-map" aria-hidden="true" />
						</div>
					)}

					{service.phone_number && <hr />}
					{service.phone_number && (
						<div className="Selector" onClick={() => window.open(`tel:${service.phone_number}`)}>
							<h1>
								{t("Call")}:
								<ltr>
									<a href={`tel:${service.phone_number}`}>{service.phone_number}</a>
								</ltr>
							</h1>
							<i className="MenuIcon fa fa-phone" aria-hidden="true" />
						</div>
					)}

					{service.email && <hr />}
					{service.email && (
						<div className="Selector" onClick={() => window.open(`mailto:${service.email}`)}>
							<h1>{t("Email")}</h1>
							<i className="MenuIcon fa fa-envelope-o" aria-hidden="true" />
						</div>
					)}

					{service.website && <hr />}
					{service.website && (
						<div className="Selector" onClick={() => window.open(`${toUrl(service.website)}`)}>
							<h1>{t("Web Site")}</h1>
							<i className="MenuIcon fa fa-external-link" aria-hidden="true" />
						</div>
					)}

					{service.facebook_page && <hr />}
					{service.facebook_page && (
						<div className="Selector" onClick={() => window.open(`${toUrl(service.facebook_page)}`)}>
							<h1>{t("Facebook Page")}</h1>
							<i className="MenuIcon fa fa-facebook-f" aria-hidden="true" />
						</div>
					)}
				</div>
			</div>
		);
	}
}
export default translate()(ServiceDetail);