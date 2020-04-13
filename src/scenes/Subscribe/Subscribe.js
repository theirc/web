// libs
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { Interpolate, translate } from "react-i18next";
import { connect } from "react-redux";

// local
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import { Skeleton } from "..";
import i18nHelpers from '../../helpers/i18n';
import languages from './languages';

import "./Subscribe.css";

const NS = { ns: 'Subscribe' };
const step1 = '/images/subscribe/step-1.png';
const step2 = '/images/subscribe/step-2.png';
const step3 = '/images/subscribe/step-3.png';
const step4 = '/images/subscribe/step-4.png';

/**
 * @class
 * @description 
 */
class Subscribe extends Component {

	constructor(props) {
		super(props);
		this.handlePhoneChange = this.handlePhoneChange.bind(this);
		this.handleCountryCodeChange = this.handleCountryCodeChange.bind(this);
		this.handleVerificationChange = this.handleVerificationChange.bind(this);
		this.handleSubscriptionSubmit = this.handleSubscriptionSubmit.bind(this);
		this.handleVerificationSubmit = this.handleVerificationSubmit.bind(this);
		i18nHelpers.loadResource(languages, NS.ns);
	}

	state = {
		phone: '',
		countryCode: 503,
		codeSent: false,
		code: '',
		validated: false,
		sendingCode: false,
		showCodeError: false,
		showHelp: false,
		showPhoneError: false,
	}

	static propTypes = {
		article: PropTypes.shape({
			title: PropTypes.string,
			hero: PropTypes.string,
			body: PropTypes.string,
		}),
		category: PropTypes.shape({
			name: PropTypes.string,
			slug: PropTypes.string,
			translations: PropTypes.array,
		}),
		onNavigate: PropTypes.func,
	};

	static contextTypes = {
		config: PropTypes.object,
	};

	toggleHelp() {
		this.setState({ showHelp: !this.state.showHelp })
	}

	handlePhoneChange(phone) {
		const digits = Number.isNaN(parseInt(phone.target.value, 10)) ? '' : parseInt(phone.target.value, 10);
		this.setState({ phone: digits });
	}

	handleCountryCodeChange(countryCode) {
		const digits = Number.isNaN(parseInt(countryCode.target.value, 10)) ? '' : parseInt(countryCode.target.value, 10);
		this.setState({ countryCode: digits });
	}

	handleVerificationChange(event) {
		this.setState({ code: event.target.value })
	}

	handleSubscriptionSubmit() {
		this.setState({ sendingCode: true });

		const phone = '+' + this.state.countryCode + this.state.phone;
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ phone, categorySlug: this.props.category.fields.slug })
		}
		fetch("https://signpost-crm-staging.azurewebsites.net/api/subscriptions/add-subscription", options).then(s => {
			this.setState({ sendingCode: false });
			if (s.status === 200) {
				this.setState({ codeSent: true });
				return s.json();
			} else {
				this.setState({ showPhoneError: true });
			}

		}).then(s => console.log(s));

	}

	handleVerificationSubmit() {
		console.log("Submit code");
		const phone = '+' + this.state.countryCode + this.state.phone;
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ phone, code: this.state.code })
		}
		fetch("https://signpost-crm-staging.azurewebsites.net/api/subscriptions/verify-code", options).then((s) => {
			if (s.status === 200) {
				this.setState({ validated: true, showCodeError: false });
			} else {
				this.setState({ validated: false, showCodeError: true });
			}
		});
	}

	render() {
		const { category, t } = this.props;
		console.log("state:", this.state);

		return (
			<Skeleton headerColor='light'>
				<div className="SkeletonContainer">
					<div ref={r => (this._ref = r)} className="Subscribe">
						<Helmet>
							<title>{t('title', NS)}</title>
						</Helmet>

						<HeaderBar subtitle={'Subscribe your phone number'} title={t('title', NS)} />

						<div className="Subscribe-content">
							<p>{t('Subscribe:signUp', { category: category && category.fields.name })}</p>

							{!this.state.codeSent &&
								<div className="subscribe-form">
									<div className='label'>{!this.state.sendingCode ? <strong>{t('enterPhone', NS)}</strong> : t('sendingCode', NS)}</div>

									<div id='phone-wrapper'>
										<label>+</label>
										<input id='country-code' className='subscribe-input' maxLength='3'
											onChange={countryCode => this.handleCountryCodeChange(countryCode)}
											value={this.state.countryCode}
										/>
										<input id='phone-number' className='subscribe-input' maxLength='11'
											onChange={phone => this.handlePhoneChange(phone)}
											value={this.state.phone}
										/>
									</div>

									<div className='warning'>
										{this.state.showPhoneError && t('phoneExists', NS)}
										{this.state.showCodeError && t('invalid', NS)}
									</div>


									<button type="button" onClick={this.state.phone && this.state.countryCode ? this.handleSubscriptionSubmit : undefined}
										className={`subscribe-button${this.state.phone && !this.state.sendingCode ? '' : ' disabled'}`} id="confirm">
										{t('submit', NS)}
									</button>
									<p>{t('disclaimer', NS)}</p>
								</div>
							}

							{this.state.validated &&
								<div className="subscribe-form">
									<div className="all-set">
										<h3>{t('done', NS)}</h3>
										<div>{t('registered', NS)}</div>
									</div>
									<p>{t('disclaimer', NS)}</p>
								</div>
							}

							{this.state.codeSent && !this.state.validated &&
								<div className="subscribe-form">
									<div className='label'>{t('confirmationSent', NS)}</div>
									<div><input type="text" onChange={this.handleVerificationChange} className="verify-input" id="code" value={this.state.code} maxLength={4} /></div>

									<div className='warning'>{this.state.showCodeError && t('invalid', NS)}</div>

									<button type="button" onClick={this.state.code ? this.handleVerificationSubmit : undefined} className={`subscribe-button${this.state.code ? '' : ' disabled'}`} id="confirm">{t('verify', NS)}</button>
									<p>{t('disclaimer', NS)}</p>
								</div>
							}

							<div className='how-it-works'>
								<div className='title'>
									<h4 onClick={() => this.toggleHelp()}>{t('howItWorks', NS)}</h4>
									<i className="material-icons">{this.state.showHelp ? '' : 'keyboard_arrow_right'}</i>
								</div>

								{this.state.showHelp &&
									<div className='how-it-works--wrapper'>
										<div className="step">
											<div className='step--text'>
												<div className="circle">1</div>
												<div className="text">{t('step1', NS)}</div>
											</div>
											<div className='step--image'><img src={step1} /></div>
										</div>
										<div className="step">
											<div className='step--text'>
												<div className="circle">2</div>
												<div className="text">{t('step2', NS)}</div>
											</div>
											<div className='step--image'><img src={step2} /></div>
										</div>
										<div className="step">
											<div className='step--text'>
												<div className="circle">3</div>
												<div className="text">{t('step3', NS)}</div>
											</div>
											<div className='step--image'><img src={step3} /></div>
										</div>
										<div className="step">
											<div className='step--text'>
												<div className="circle">4</div>
												<div className="text">{t('step4', NS)}</div>
											</div>
											<div className='step--image'><img src={step4} /></div>
										</div>
									</div>
								}
							</div>
						</div>
					</div>
				</div>
			</Skeleton>
		);
	}
}

const mapState = ({ country, language }, p) => ({ language, country });

export default connect(mapState)(translate()(Subscribe));

