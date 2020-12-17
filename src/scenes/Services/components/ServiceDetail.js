// libs
import React from "react";
import { translate } from "react-i18next";
import _ from "lodash";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { LibraryBooks, Link } from "material-ui-icons";
import * as clipboard from "clipboard-polyfill";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

// local
import HeaderBar from "../../../components/HeaderBar/HeaderBar";
import routes from '../routes';
import fbHelpers from '../../../helpers/facebook';
import "../../../components/ActionsBar/ActionsBar.css";
import "./ServiceDetail.css";
import "./ServiceHome.css";

const NS = { ns: 'Services' };

//temp API Key from Andres Aguilar
const GMAPS_API_KEY = "AIzaSyAK54Ir69gNM--M_5dRa0fwVH8jxWnJREQ";
const hotlinkTels = input => input;
const moment = global.moment;

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

	componentDidMount() {
		const { fetchService, fetchServicesInSameLocation, history } = this.props;
		if (fetchService) {
			fetchService().then(service => {
				!service && history.push('/404');
				this.setState({ service })
			});
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
		const { country, goToService, language, t, instance } = this.props;
		const countryCode = _.has(country, 'fields.slug') && instance.countries[country.fields.slug].countryCode;
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

		const firstOrDefault = a => _.first(a) || {};
		const toUrl = u => (u.indexOf("http") === -1 ? `http://${u}` : u);
		// const hasHours = o => {
		// 	return o.isAlwaysOpen || weekDays.map(w => o.serviceOpeningHours[w.id].map(h => !!(h.open || h.close)).indexOf(true) > -1).indexOf(true) > -1;
		// };
		const callAux = t("services.Call", NS);
		const amPmTime = time => {
			const m = moment(moment(`2001-01-01 ${time}`).toJSON())
				.locale(false)
				.locale(language);
			return `${m.format("hh:mm")} ${m.hour() >= 12 ? t("services.pm", NS) : t("services.am", NS)}`;
		};
		const serviceProviderElement = s => <span className='providerName'>{s.name}</span>;

		const showTimeTable = service => {
			return weekDays.map((w, i) => {
				if (!firstOrDefault(service.opening_time[w.toLowerCase()]).open) {
					return (
						<tr key={`tr-${i}`}>
							<td className="week">{t(w)}</td>
							<td colSpan="3">{t("services.Closed", NS)}</td>
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

		const serviceT = service.data_i18n.filter(x => x.language === language)[0]
		const providerT = service.provider.data_i18n.filter(x => x.language === language)[0]
		const providerInfo = providerT ? providerT : service.provider;

		let sortedContactInformation = _.sortBy(service.contact_information || [], ci => {
			return ci.index;
		});
		let subtitle = (service.serviceCategories && service.serviceCategories.length > 0) ? _.first(service.serviceCategories).name : '';
		let phoneNumberWithCode = countryCode + service.phone_number;
		const url = encodeURIComponent(window.location.href);
		
		let lang = '';
		switch (language) {
			case 'en':
				lang = 'en_uk';
				break;
			case 'ar':
				lang = 'ar_ar';
				break;
			case 'fr':
				lang = 'fr_be';
				break;
			case 'ur':
				lang = 'ur_pk';
				break;
			case 'fa':
				lang = 'fa_ir';
				break;
			default:
				lang = '';
				break;
		}

		return (
			<div>
				<div className="ServiceDetail" id="ServiceDetail">
					<Helmet>
						<title>{serviceT.name}</title>
					</Helmet>

					<HeaderBar subtitle={`${subtitle}:`} title={serviceT.name} />

					{service.image &&
						<div className="hero">
							<div className="HeroImageContainer"><img src={service.image} alt={service.name} /></div>
						</div>
					}

					<div className='ActionsBar'>
						<div className="left"></div>
						<div className="social">
							<div href='#' className="social-btn" onClick={() => fbHelpers.share(language)}><i className="fa fa-facebook-f" style={{ fontSize: 16 }} /></div>

							<div href='#' className="social-btn" onClick={this.onCopyLink}>
								{!this.state.copied ? <Link /> : <LibraryBooks />}
								{this.state.copied && <span className='copied'>{t('services.Copied', NS)}</span>}
							</div>

						</div>
					</div>

					{instance.brand.url === "refugee.info" && lang.length > 0 &&
					<div id="readspeaker_button1" className="rs_skip rsbtn rs_preserve">
						<a rel="nofollow" className="rsbtn_play" accessKey="L" title="ReadSpeaker webReader إستمع إلى هذه الصفحةِ مستخدماً" href={`//app-eu.readspeaker.com/cgi-bin/rsent?customerid=11950&amp;lang=${lang}&amp;readid=ServiceDetail&amp;url=${url}`}>
							<span className="rsbtn_left rsimg rspart"><span className="rsbtn_text"><span>Listen</span></span></span>
							<span className="rsbtn_right rsimg rsplay rspart"></span>
						</a>
					</div>
				}
					<article>
						<span className='author'><span>{t("services.LAST_UPDATED", NS)}</span> {moment(service.updated_at).format('YYYY.MM.DD')}</span>

						{providerInfo && <h2 className='provider'>
							{t("services.Service Provider", NS)}:&nbsp;{serviceProviderElement(providerInfo)}
						</h2>}

						<h2>{serviceT.name}</h2>
						<p dangerouslySetInnerHTML={{ __html: hotlinkTels(serviceT.description) }} />

						{serviceT.additionalInformation && <h3>{t("services.Additional Information", NS)}</h3>}
						{serviceT.additionalInformation && <p dangerouslySetInnerHTML={{ __html: hotlinkTels(serviceT.additionalInformation) }} />}

						{/* {serviceT.languages_spoken && <h3>{t("services.Languages Spoken", NS)}</h3>}
					{serviceT.languages_spoken && <p dangerouslySetInnerHTML={{ __html: serviceT.languages_spoken }} />} */}

						{/* {hasHours(service) && (
						<span>
							<h3>{t("services.Visiting hours", NS)}</h3>
							<p>{service.isAlwaysOpen && t("services.Open 24/7", NS)}</p>
							<div className="openingTable">
								{!service.opening_time["24/7"] && (
									<table>
										<tbody>{showTimeTable(service)}</tbody>
									</table>
								)}
							</div>
						</span>
					)} */}
						{/* {serviceT.address_city && <h4>{t("services.Location", NS)}</h4>}
					{serviceT.address_city && <p>{serviceT.address_city}</p>} */}

						{serviceT.address && <h3>{t("services.Address", NS)}</h3>}
						{serviceT.address && <p>{serviceT.address}</p>}
						{/* {serviceT.address_floor && <p>{serviceT.address_floor}</p>}

					{service.address_in_country_language && <h3>{t("services.Address in Local Language", NS)}</h3>}
					{service.address_in_country_language && <p>{service.address_in_country_language}</p>} */}

						{service.costOfService && <h3>{t("services.Cost of service", NS)}</h3>}
						{service.costOfService && <p>{service.costOfService}</p>}

						{service.latitude && service.longitude && (
							<p>
								<img
									className="MapCursor"
									alt={serviceT.name}
									onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${service.latitude},${service.longitude}`)}
									src={`https://maps.googleapis.com/maps/api/staticmap?center=${service.latitude},${service.longitude}&zoom=16&size=600x300&maptype=roadmap&markers=${service.latitude},${service.longitude}&key=${GMAPS_API_KEY}`}
								/>
							</p>
						)}

					</article>

					{this.state.showOtherServices ? (
						<div className="footer">
							{service.latitude && service.longitude && (
								<div className="Selector" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${service.latitude},${service.longitude}`)}>
									<span className='icon-placeholder'>
										<i className="MenuIcon fa fa-map" aria-hidden="true" />
									</span>

									<h1>{t("services.Get directions", NS)}</h1>
								</div>
							)}

							{service.phone && (
								<div className="Selector" onClick={() => window.open(`tel:${service.phone}`)}>
									<span className='icon-placeholder'>
										<i className="MenuIcon fa fa-phone" aria-hidden="true" />
									</span>

									<h1>
										{t("services.Call", NS)}:
									<a className="phoneFormat" href={`tel:${service.phone}`} >{service.phone}</a>
									</h1>
								</div>
							)}

							{service.email && (
								<div className="Selector" onClick={() => window.open(`mailto:${service.email}`)}>
									<span className='icon-placeholder'>
										<i className="MenuIcon fa fa-envelope-o" aria-hidden="true" />
									</span>

									<h1>
										<span style={{ display: 'inline-block', overflow: 'hidden' }}>{t('services.Email', NS)}:&nbsp;</span>
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
										<span style={{ display: 'inline-block', overflow: 'hidden' }}>{t('services.Website', NS)}:&nbsp;</span>
										<div className='field' style={{
											display: 'inline-block', direction: 'ltr',
											overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
										}}>
											{service.website}
										</div>
									</h1>
								</div>
							)}

							{service.facebook && (
								<div className="Selector" onClick={() => window.open(`${toUrl(service.facebook)}`)}>
									<span className='icon-placeholder'><i className="MenuIcon fa fa-facebook-f" aria-hidden="true" /></span>

									<h1>
										<span style={{ display: 'inline-block', overflow: 'hidden' }}>{t('Facebook')}:&nbsp;</span>
										<div className='field' style={{
											display: 'inline-block', direction: 'ltr',
											overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
										}}>
											{service.facebook}
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
									<h1>{t("services.OTHER_SERVICES", NS)}</h1>
								</div>)
							}
						</div>)
						: (
							<div>
								<div className="footer">
									<div className="Selector">
										<h1 className="RelatedServicesTitle">{t("services.OTHER_SERVICES", NS)}:</h1>
									</div>

									{relatedServices.map(r => (
										<div key={r.id} onClick={() => goToService(country, language, r.id)}>
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

const mapDispatch = (d, p) => ({ goToService: (country, language, id) => d(push(routes.goToService(country, language, id))) });

export default translate()(connect(mapState, mapDispatch)(ServiceDetail));
