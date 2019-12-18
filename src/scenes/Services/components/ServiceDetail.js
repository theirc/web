// libs
import React from "react";
import { translate } from "react-i18next";
import _ from "lodash";
import { connect } from "react-redux";
import { LibraryBooks, Link } from "material-ui-icons";
import * as clipboard from "clipboard-polyfill";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import "../../../components/ActionsBar/ActionsBar.css";
import "./ServiceDetail.css";
import "./ServiceHome.css";

// eslint-disable-next-line
//const GMAPS_API_KEY = "AIzaSyA7eG6jYi03E6AjJ8lhedMuaLS9mVoJjJ8";

//temp API Key from Andres Aguilar
const GMAPS_API_KEY = "AIzaSyAK54Ir69gNM--M_5dRa0fwVH8jxWnJREQ";
const hotlinkTels = input => input; //input.replace(/\s(\+[1-9]{1}[0-9]{5,14})|00[0-9]{5,15}/g, `<a class="tel" href="tel:$1">$1</a>`);
const moment = global.moment;

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
			copySlug = (window.location + (window.location.toString().indexOf("?") > -1 ? "&" : "?") + "language=" + language);
		}

		this.state = { value: copySlug, copied: false, shareIN: true, showOtherServices: true };
		this.sharePage = this.sharePage.bind(this);
		this.showServices = this.showServices.bind(this);
		this.Copiedlnk = this.Copiedlnk.bind(this);
	}

	showServices() {
		this.setState({ showOtherServices: !this.state.showOtherServices });
	}

	sharePage() {
		this.setState(prevState => ({ shareIN: false }));
	}

	Copiedlnk() {
		clipboard.writeText(document.location.href);

		this.setState(prevState => ({ copied: !prevState.copied }));
		setTimeout(() => {
			this.setState({ shareIN: true });
			setTimeout(() => {
				this.setState(prevState => ({ copied: !prevState.copied }));
			}, 2);
		}, 3000);
	}

	onCopyLink = () => {
		this.setState({ copied: true });

		clipboard.writeText(document.location.href);

		setTimeout(() => this.setState({ copied: false }), 1500);
	}

	onShareOnFacebook = () => {
		const { language } = this.props
		if (global.window) {
			const { FB } = global.window;
			let { href } = window.location;
			console.log(FB, href)
			href += (href.indexOf("?") > -1 ? "&" : "?") + "language=" + language;

			if (FB) {
				FB.ui(
					{
						method: "share",
						href,
					},
					function (response) { }
				);
			}
		}
	}

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
					function (response) { }
				);
			}
		}
	}

	componentDidMount() {
		const { fetchService, fetchServicesInSameLocation } = this.props;
		if (fetchService) {
			fetchService().then(service => {
				this.setState({ service })
			}
			);
		}

		if (fetchServicesInSameLocation) {
			fetchServicesInSameLocation().then(relatedServices => this.setState({ relatedServices }));
		}
	}

	renderContactInformation(ci, callAux) {
		let { text, type } = ci;
		let typography;
		let action;
		let typeText;
		let textClass = 'noPhoneFormat';

		switch (type) {
			case "whatsapp":
				typography = "MenuIcon fa fa-whatsapp";
				action = `whatsapp://send?phone=${text}`;
				typeText = "Whatsapp: ";
				break;

			case "skype":
				typography = "MenuIcon fa fa-skype";
				action = `skype:${text}?chat`;
				typeText = "Skype: ";
				break;

			case "facebook_messenger":
				typography = "MenuIcon fa fa-facebook";
				action = `http://m.me/${text}`;
				typeText = "Facebook Messenger: ";
				break;

			case "viber":
				typography = "MenuIcon fa fa-phone";
				action = `viber://add?number=${text}`;
				typeText = "Viber: ";
				break;

			case "phone":
				typography = "MenuIcon fa fa-phone";
				action = `tel:${text}`;
				typeText = callAux + ":";
				textClass = 'phoneFormat';
				break;

			case "email":
				typography = "MenuIcon fa fa-envelope-o";
				action = `mailto:${text}`;
				typeText = "Email: ";
				break;

			case "instagram":
				typography = "MenuIcon fa fa-envelope-o";
				action = `https://www.instagram.com/${text}`;
				typeText = "Instagram: ";
				break;

			default:
				break;
		}
		return (
			<div className="Selector" onClick={() => window.open(action)}>
				<span className='icon-placeholder'>
					<i className={typography} aria-hidden="true" />
				</span>

				<h1>
					<div className="ContactInformation">
						{typeText}<a href={action} className={textClass}>{text}</a>
					</div>
				</h1>
			</div>
		)
	}

	render() {
		const { service, relatedServices } = this.state;
		const { t, language, goToService, country, phoneCodes } = this.props;

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
		const callAux = t("Call");
		const amPmTime = time => {
			const m = moment(moment(`2001-01-01 ${time}`).toJSON())
				.locale(false)
				.locale(language);
			return `${m.format("hh:mm")} ${m.hour() >= 12 ? t("pm") : t("am")}`;
		};
		const serviceProviderElement = s => <span className='providerName'>{s.provider.name}</span>;

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

		// service translated fields
		let serviceT = {
			additional_info: service[`additional_info_${language}`],
			address: service[`address_${language}`],
			address_city: service[`address_city_${language}`],
			address_floor: service[`address_floor_${language}`],
			description: service[`description_${language}`],
			languages_spoken: service[`languages_spoken_${language}`],
			name: service[`name_${language}`],
		};
		//let fullAddress = [serviceT.address, serviceT.address_floor].filter(val => val).join(', ');

		let sortedContactInformation = _.sortBy(service.contact_information || [], ci => {
			return ci.index;
		});
		let subtitle = service.type ? service.type.name : _.first(service.types).name;
		const currentCountry = phoneCodes.filter(pc => pc.country === country.fields.name);
		let phoneNumberWithCode;
		(currentCountry.length) ? (phoneNumberWithCode = currentCountry[0].code + service.phone_number) : (phoneNumberWithCode = service.phone_number);
		return (
			<div className="ServiceDetail">
				<Helmet>
					<title>{serviceT.name}</title>
				</Helmet>

				<HeaderBar subtitle={`${subtitle}:`} title={serviceT.name} />

				{service.image &&
					<div className="hero">
						<div className="HeroImageContainer"><img src={service.image} alt={service.provider.name} /></div>
					</div>
				}

				<div className='ActionsBar'>
					<div className="left"></div>
					<div className="social">
						<div href='#' className="social-btn" onClick={this.onShareOnFacebook}><i className="fa fa-facebook-f" style={{ fontSize: 16 }} /></div>

						<div href='#' className="social-btn" onClick={this.onCopyLink}>
							{!this.state.copied ? <Link /> : <LibraryBooks />}
							{this.state.copied && <span className='copied'>{t('Copied')}</span>}
						</div>

					</div>
				</div>

				<article>
					<span className='author'><span>{t("LAST_UPDATED")}</span> {moment(service.updated_at).format('YYYY.MM.DD')}</span>

					<h2 className='provider'>
						{t("Service Provider")}:&nbsp;{serviceProviderElement(service)}
					</h2>

					{/* <h2>{serviceT.name}</h2> */}
					<p dangerouslySetInnerHTML={{ __html: hotlinkTels(serviceT.description) }} />

					{serviceT.additional_info && <h3>{t("Additional Information")}</h3>}
					{serviceT.additional_info && <p dangerouslySetInnerHTML={{ __html: hotlinkTels(serviceT.additional_info) }} />}

					{serviceT.languages_spoken && <h3>{t("Languages Spoken")}</h3>}
					{serviceT.languages_spoken && <p dangerouslySetInnerHTML={{ __html: serviceT.languages_spoken }} />}

					{hasHours(service.opening_time) && (
						<span>
							<h3>{t("Visiting hours")}</h3>
							<p>{service.opening_time["24/7"] && t("Open 24/7")}</p>
							<div className="openingTable">
								{!service.opening_time["24/7"] && (
									<table>
										<tbody>{showTimeTable(service)}</tbody>
									</table>
								)}
							</div>
						</span>
					)}
					{serviceT.address_city && <h4>{t("Location")}</h4>}
					{serviceT.address_city && <p>{serviceT.address_city}</p>}

					{serviceT.address && <h3>{t("Address")}</h3>}
					{serviceT.address_floor && <p>{serviceT.address_floor}</p>}
					{serviceT.address && <p>{serviceT.address}</p>}

					{service.address_in_country_language && <h3>{t("Address in Local Language")}</h3>}
					{service.address_in_country_language && <p>{service.address_in_country_language}</p>}

					{service.cost_of_service && <h3>{t("Cost of service")}</h3>}
					{service.cost_of_service && <p>{service.cost_of_service}</p>}

					{point && (
						<p>
							<img
								className="MapCursor"
								alt={serviceT.name}
								onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${point}`)}
								src={`https://maps.googleapis.com/maps/api/staticmap?center=${point}&zoom=16&size=600x300&maptype=roadmap&markers=${point}&key=${GMAPS_API_KEY}`}
							/>
						</p>
					)}

				</article>

				{this.state.showOtherServices ? (
					<div className="footer">
						{service.location && (
							<div className="Selector" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${point}`)}>
								<span className='icon-placeholder'>
									<i className="MenuIcon fa fa-map" aria-hidden="true" />
								</span>

								<h1>{t("Get directions")}</h1>
							</div>
						)}

						{service.phone_number && (
							<div className="Selector" onClick={() => window.open(`tel:${service.phone_number}`)}>
								<span className='icon-placeholder'>
									<i className="MenuIcon fa fa-phone" aria-hidden="true" />
								</span>

								<h1>
									{t("Call")}:
									<a className="phoneFormat" href={`tel:${phoneNumberWithCode}`} >{phoneNumberWithCode}</a>
								</h1>
							</div>
						)}

						{service.email && (
							<div className="Selector" onClick={() => window.open(`mailto:${service.email}`)}>
								<span className='icon-placeholder'>
									<i className="MenuIcon fa fa-envelope-o" aria-hidden="true" />
								</span>

								<h1>
									<span style={{ display: 'inline-block', overflow: 'hidden' }}>{t('Email')}:&nbsp;</span>
									<div className='field' style={{
										display: 'inline-block', direction: 'ltr',
										overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
									}}>
										{service.email}
									</div>
								</h1>
							</div>
						)}

						{service.website && (
							<div className="Selector" onClick={() => window.open(`${toUrl(service.website)}`)}>
								<span className='icon-placeholder'>
									<i className="MenuIcon fa fa-external-link" aria-hidden="true" />
								</span>

								<h1>
									<span style={{ display: 'inline-block', overflow: 'hidden' }}>{t('Website')}:&nbsp;</span>
									<div className='field' style={{
										display: 'inline-block', direction: 'ltr',
										overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
									}}>
										{service.website}
									</div>
								</h1>
							</div>
						)}

						{service.facebook_page && (
							<div className="Selector" onClick={() => window.open(`${toUrl(service.facebook_page)}`)}>
								<span className='icon-placeholder'><i className="MenuIcon fa fa-facebook-f" aria-hidden="true" /></span>

								<h1>
									<span style={{ display: 'inline-block', overflow: 'hidden' }}>{t('Facebook')}:&nbsp;</span>
									<div className='field' style={{
										display: 'inline-block', direction: 'ltr',
										overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
									}}>
										{service.facebook_page}
									</div>
								</h1>
							</div>
						)}

						{service.contact_information && sortedContactInformation.map(ci => this.renderContactInformation(ci, callAux))}

						{(relatedServices || []).length > 0 && (
							<div className="Selector" onClick={() => this.showServices()}>
								<span className='icon-placeholder'>
									<i className="MenuIcon fa fa-angle-right" aria-hidden="true" />
								</span>
								<h1>{t("OTHER_SERVICES")}</h1>
							</div>)
						}
					</div>)
					: (
						<div>
							<div className="footer">
								<div className="Selector">
									<h1 className="RelatedServicesTitle">{t("OTHER_SERVICES")}:</h1>
								</div>

								{relatedServices.map(r => (
									<div key={r.id} onClick={() => goToService(r.id)}>
										<div className="Selector related">
											<span className='icon-placeholder'>
												<i className="MenuIcon fa fa-angle-right" aria-hidden="true" />
											</span>
											<h1 href="#/" ><div style={{
												display: 'inline-block', direction: 'ltr', overflow: 'hidden',
												whiteSpace: 'nowrap', textOverflow: 'ellipsis'
											}}>{r.name}</div></h1>
										</div>
									</div>
								))
								}

								<div className="Selector back" onClick={() => this.showServices()}>
									<span className='icon-placeholder'>
										<i className="MenuIcon fa fa-angle-left" aria-hidden="true" />
									</span>

									<h1>{t("Back")}</h1>
								</div>
							</div>
						</div>
					)}
			</div>
		);
	}
}

const mapState = ({ country, language }, p) => {
	return { country, language };
};

export default translate()(connect(mapState)(ServiceDetail));
