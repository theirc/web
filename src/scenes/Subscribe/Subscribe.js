// libs
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { Interpolate, translate } from "react-i18next";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { connect } from "react-redux";

// local
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import { Skeleton } from "..";
import i18nHelpers from '../../helpers/i18n';
import languages from './languages';

import "./Subscribe.css";


const NS = { ns: 'Subscribe' };

/**
 * @class
 * @description 
 */
class Subscribe extends Component {

	constructor(props) {
		super(props);
		this.handleSubscriptionChange = this.handleSubscriptionChange.bind(this);
		this.handleVerificationChange = this.handleVerificationChange.bind(this);
		this.handleSubscriptionSubmit = this.handleSubscriptionSubmit.bind(this);
		this.handleVerificationSubmit = this.handleVerificationSubmit.bind(this);
		i18nHelpers.loadResource(languages, NS.ns);
	}

	state = {
		phone: '',
		codeSent: false,
		code: '',
		validated: false,
		sendingCode: false,
		showCodeError: false,
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

	handleSubscriptionChange(phone) {
		this.setState({ phone })
		console.log(phone);
	}

	handleVerificationChange(event) {
		this.setState({ code: event.target.value })
	}

	handleSubscriptionSubmit() {
		this.setState({ sendingCode: true });
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ phone: this.state.phone, categorySlug: this.props.category.fields.slug })
		}
		fetch("https://signpost-crm-staging.azurewebsites.net/api/subscriptions/add-subscription", options).then(s => {
			this.setState({ sendingCode: false });
			if (s.status === 200) {
				this.setState({ codeSent: true });
			} else {
				this.setState({ showPhoneError: true });
			}

			return s.json();
		}).then(s => console.log(s));

	}

	handleVerificationSubmit() {
		console.log("Submit code");
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ phone: this.state.phone, code: this.state.code })
		}
		fetch("https://signpost-crm-staging.azurewebsites.net/api/subscriptions/verify-code", options).then((s) => {
			console.log(s, s.body);
			if (s.status === 200) {
				this.setState({ validated: true, showCodeError: false });
			} else {
				this.setState({ validated: false, showCodeError: true });
			}
		})
	}

	render() {
		const { category, t } = this.props;
		// console.log("category:", category);

		return (
			<Skeleton headerColor='light'>
				<div className="SkeletonContainer">
					<div ref={r => (this._ref = r)} className={"Subscribe"}>
						<Helmet>
							<title>{t('title', NS)}</title>
						</Helmet>

						<HeaderBar subtitle={'Subscribe your phone number'} title={t('title', NS)} />

						<div className="Subscribe-content">
							<h4>{t('Subscribe:signUp', { category: category && category.fields.name })}</h4>
							<p>{t('disclaimer', NS)}</p>

							{this.sendingCode &&
								<div>{t('sendingCode', NS)}</div>
							}

							{!this.state.codeSent && !this.validated && !this.sendingCode &&
								<div className="subscribe-form">
									<div className='label'>{t('enterPhone', NS)}</div>
									{/* <div><input type="text" onChange={this.handleSubscriptionChange} className="subscribe-input" id="phoneNumber" value={this.state.phone} /></div> */}
									<PhoneInput className='subscribe-input'
										country="SV"
										value={this.state.phone}
										maxLength={18}
										onChange={phone => this.handleSubscriptionChange(phone) } />

									<div className='warning'>
										{this.state.showPhoneError && t('phoneExists', NS)}
										{this.state.showCodeError && t('invalid', NS)}
									</div>

									{this.state.validated &&
										<div className="all-set">
											<h3>{t('done', NS)}</h3>
											<div>{t('registered', NS)}</div>
										</div>
									}

									<button type="button" onClick={this.state.phone ? this.handleSubscriptionSubmit : undefined} className={`subscribe-button${this.state.phone ? '' : ' disabled'}`} id="confirm">{t('submit', NS)}</button>
								</div>}

							{this.state.codeSent && !this.state.validated &&
								<div className="subscribe-form">
									<div className='label'>{t('confirmationSent', NS)}</div>
									<div><input type="text" onChange={this.handleVerificationChange} className="verify-input" id="code" value={this.state.code} maxLength={4}/></div>

									<div className='warning'>{this.state.showCodeError && t('invalid', NS)}</div>

									<button type="button" onClick={this.state.code ? this.handleVerificationSubmit : undefined} className={`subscribe-button${this.state.code ? '' : ' disabled'}`} id="confirm">{t('verify', NS)}</button>
								</div>
							}

						</div>
					</div>
				</div>
			</Skeleton>
		);
	}
}

const mapState = ({ country, language }, p) => ({ language, country });

export default connect(mapState)(translate()(Subscribe));

