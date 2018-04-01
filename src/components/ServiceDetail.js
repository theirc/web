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
				typeText = "Whatsapp: ";
			break;
			case "skype" : 
				typography = "MenuIcon fa fa-skype";
				action = "${toUrl(text)";
				typeText = "Skype: ";
			break;
			case "facebook_messenger" :
				typography = "MenuIcon fa fa-facebook";
				action = "${toUrl(text)";
				typeText = "Facebook Messenger: ";
			break;
			case "viber" : 
				typography = "MenuIcon fa fa-phone";
				action = "viber://add?number=${text}";
				typeText = "Viber: ";
			break; 
			case "phone" : 
				typography = "MenuIcon fa fa-phone";
				action = "tel:${text}";
				typeText = "Call: ";
			break;
			case "email" : 
				typography = "MenuIcon fa fa-envelope-o";
				action = "mailto:${text}";
				typeText = "Email: ";
			break;
		}
	
			return(
				<div>
					<hr />
					<div className="Selector" onClick={() => window.open(action)}>  
					<h1><div style={{ display: 'inline-block', direction: 'ltr',width: '100%',
    					overflow: 'hidden', whiteSpace:'nowrap', textOverflow: 'ellipsis' }}>
						{typeText}{text} </div></h1>
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

		let sortedContactInformations = _.sortBy(service.contact_informations || [], ci => {
			return ci.index;
		});		

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
								<a href={`tel:${service.phone_number}`}>{service.phone_number}</a>
							</h1>
							<i className="MenuIcon fa fa-phone" aria-hidden="true" />
						</div>
					)}

					{service.email && <hr />}
					{service.email && (
						<div className="Selector" onClick={() => window.open(`mailto:${service.email}`)}>
							<h1><span style={{display: 'inline-block',overflow: 'hidden'}}>{t('Email')}: </span><div style={{ display: 'inline-block', direction: 'ltr',maxWidth: '60%',
    							overflow: 'hidden', whiteSpace:'nowrap', textOverflow: 'ellipsis' }}>
							 {service.email}</div></h1>
							<i className="MenuIcon fa fa-envelope-o" aria-hidden="true" />
						</div>
					)}

					{service.website && <hr />}
					{service.website && (
						<div className="Selector" onClick={() => window.open(`${toUrl(service.website)}`)}>
							<h1><div style={{ display: 'inline-block', direction: 'ltr',maxWidth: '85%',
    							overflow: 'hidden', whiteSpace:'nowrap', textOverflow: 'ellipsis' }}>
							{t('Website')}: {service.website}</div></h1>
							<i className="MenuIcon fa fa-external-link" aria-hidden="true" />
						</div>
					)}

					{service.facebook_page && <hr />}
					{service.facebook_page && (
						<div className="Selector" onClick={() => window.open(`${toUrl(service.facebook_page)}`)}>							
							<h1><div style={{ display: 'inline-block', direction: 'ltr',maxWidth: '85%',
    							overflow: 'hidden', whiteSpace:'nowrap', textOverflow: 'ellipsis' }}>
							{t('Facebook')}: {service.facebook_page}</div></h1> 
							<i className="MenuIcon fa fa-facebook-f" aria-hidden="true" />
						</div>
					)}
					
					{service.contact_informations && sortedContactInformations.map(ci => this.renderContactInformation(ci))}
				</div>
			</div>
		);
	}
}
export default translate()(ServiceDetail);
