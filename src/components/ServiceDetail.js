import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";
import { Share } from "material-ui-icons";
import { Helmet } from "react-helmet";
import HeaderBar from "./HeaderBar";

// eslint-disable-next-line
var tinycolor = require("tinycolor2");
const GMAPS_API_KEY = "AIzaSyA7eG6jYi03E6AjJ8lhedMuaLS9mVoJjJ8";
const hotlinkTels = input => input; //input.replace(/\s(\+[1-9]{1}[0-9]{5,14})|00[0-9]{5,15}/g, `<a class="tel" href="tel:$1">$1</a>`);
const moment = global.moment;

class ServiceDetail extends React.Component {
	state = {
		service: null,
		relatedServices: [],
	};
	whatsappCount = 0;
	viberCount = 0;
	messengerCount = 0;
	phoneCount = 0;
	emailCount = 0;
	skypeCount = 0;

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
	renderContactInformation(ci) {
		let {text,type} = ci;
		let typography;
		let action;
		let typeText;

		switch(type){
			case "whatsapp" :
				typography = "MenuIcon fa fa-whatsapp";
				action = "whatsapp://send?text=text";
				typeText = this.whatsappCount >1 ? "Whatsapp: " + text : "Whatsapp";
			break;
			case "skype" : 
				typography = "MenuIcon fa fa-skype";
				action = "${toUrl(text)";
				typeText = "Skype";
				typeText = this.skypeCount >1 ? "Skype: "+ this.skypeCount : "Skype";
			break;
			case "facebook_messenger" :
				typography = "MenuIcon fa fa-facebook";
				action = "${toUrl(text)";
				typeText = this.messengerCount >1 ? "Facebook Messenger: "+text : "Facebook essenger";
			break;
			case "viber" : 
				typography = "MenuIcon fa fa-phone";
				action = "viber://add?number=${text}";
				typeText = this.viberCount >1 ? "Viber: "+text : "Viber";
			break; 
			case "phone" : 
				typography = "MenuIcon fa fa-phone";
				action = "tel:${text}";
				typeText = this.phoneCount >1 ? "Call: "+text : "Call";
			break;
			case "email" : 
				typography = "MenuIcon fa fa-envelope-o";
				action = "mailto:${text}";
				typeText = this.emailCount >1 ? "Email: "+text : "Email";
			break;
		}
	
			return(
				<div>
					<hr />
					<div className="Selector" onClick={() => window.open(action)}>  
						<h1>{typeText}</h1>
						<i className= {typography} aria-hidden="true" />
					</div>	
				</div>
			)
	}

	render() {
		const { service, relatedServices } = this.state;
		const { t, language, goToService } = this.props;
		const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		if (!service) {
			return (
				<div className="ServiceList">
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

		const mLocale = d => {
			let a = moment(d)
				.locale(language)
				.format("LLL");
			return a;
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

		const showTimeTable = service => {
			return weekDays.map((w, i) => {
				if (!firstOrDefault(service.opening_time[w.toLowerCase()]).open) {
					return (
						<tr key={`tr-${i}`}>
							<td className="week">{t(w)}</td>
							<td colSpan="3">{t("Closed")}</td>
						</tr>
					);
				}

				return service.opening_time[w.toLowerCase()].map((o, oi) => (
					<tr key={`tr-${i}-${oi}`}>
						{oi === 0 && (
							<td rowSpan={service.opening_time[w.toLowerCase()].length} className="week">
								{t(w)}
							</td>
						)}
						<td key={`open-${i}-${oi}`}>{amPmTime(service.opening_time[w.toLowerCase()][oi].open)}</td>
						<td>-</td>
						<td key={`close-${i}-${oi}`}>{amPmTime(service.opening_time[w.toLowerCase()][oi].close)}</td>
					</tr>
				));
			});
		};
		let fullAddress = [service.address, service.address_floor].filter(val => val).join(', ');

		let sortedContactInformation = _.sortBy(service.contact_information || [], ci => {
			return ci.index;
		});		
		
		this.whatsappCount = 0;
		this.viberCount = 0;
		this.messengerCount = 0;
		this.phoneCount = 0;
		this.emailCount = 0;
		this.skypeCount = 0;
		for (let i=0;i<service.contact_information.length;i++){
			switch(service.contact_information[i].type){
				case "whatsapp":
					this.whatsappCount++;					
					break;
				case "viber":
					this.viberCount++;
					break;
				case "facebook_messenger":
					this.messengerCount++;
					break;
				case "phone":
					this.phoneCount++;
					break;
				case "email":
					this.emailCount++;
					break;
				case "skype":
					this.skypeCount++;
					break;
			}
		}

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
					{service.image && <div className="HeroImageContainer"><img src={service.image} alt={service.provider.name} /></div>}
				</div>

				<article>
					<em>{t("LAST_UPDATED") + " " + mLocale(service.updated_at)}</em>
					<h2>{service.name}</h2>
					<p dangerouslySetInnerHTML={{ __html: hotlinkTels(service.description) }} />

					{service.additional_info && <h3>{t("Additional Information")}</h3>}
					{service.additional_info && <p dangerouslySetInnerHTML={{ __html: hotlinkTels(service.additional_info) }} />}

					{service.languages_spoken && <h3>{t("Languages Spoken")}</h3>}
					{service.languages_spoken && <p dangerouslySetInnerHTML={{ __html: service.languages_spoken }} />}

					{hasHours(service.opening_time) && (
						<span>
							<h3>{t("Visiting hours")}</h3>
							<div>{service.opening_time["24/7"] && t("Open 24/7")}</div>
							<div className="openingTable">
								{!service.opening_time["24/7"] && (
									<table>
										<tbody>{showTimeTable(service)}</tbody>
									</table>
								)}
							</div>
						</span>
					)}
					{service.address_city && <h4>{t("City")}</h4>}
					{service.address_city && <p>{service.address_city}</p>}
					
					{service.address && <h3>{t("Address")}</h3>}
					{fullAddress && <p>{fullAddress}</p>}

					{service.address_in_country_language && <h3>{t("Address in Local Language")}</h3>}
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

					{relatedServices.length > 0 && <h3>{t("OTHER_SERVICES")}:</h3>}
					{relatedServices && (
						<ul className="RelatedServices">
							{relatedServices.map(r => (
								<li key={r.id} onClick={() => goToService(r.id)}>
									<btn className="muted">
										<a href="javascript:void(0)">{r.name}</a>
									</btn>
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
					
					{service.contact_information && sortedContactInformation.map(ci => this.renderContactInformation(ci))}
				</div>
			</div>
		);
	}
}
export default translate()(ServiceDetail);
