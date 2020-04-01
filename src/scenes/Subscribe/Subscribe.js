// libs
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { translate } from "react-i18next";
import { connect } from "react-redux";

// local
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import { Skeleton } from "..";
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
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
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeCode = this.handleChangeCode.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSubmitCode = this.handleSubmitCode.bind(this);
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

	handleChange(event) {
		this.setState({ phone: event.target.value })
	}

	handleChangeCode(event) {
		this.setState({ code: event.target.value })
	}

	handleSubmit() {
		this.setState({sendingCode: true, showPhoneError: true});
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({phone: this.state.phone, categorySlug: this.props.category.fields.slug})
		}
		fetch("https://signpost-crm-staging.azurewebsites.net/api/subscriptions/add-subscription", options).then((s) => {
			console.log(s);
			this.setState({sendingCode: false});
			if (s.status == 200){
				this.setState({ codeSent: true });
			}else{
				this.setState({ showPhoneError: true });
			}
			
		})
		
	}

	handleSubmitCode() {
		console.log("Submit code");
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({phone: this.state.phone, code: this.state.code})
		}
		fetch("https://signpost-crm-staging.azurewebsites.net/api/subscriptions/verify-code", options).then((s) => {
			console.log(s);
			if (s.status == 200){
				this.setState({ validated: true, showCodeError: false });
			}else{
				this.setState({ validated: false, showCodeError: true });

			}
			

		})
	}

	render() {
		const title = "Subscribe";
		const { category } = this.props;
		console.log("category:", category);
		return (
			<Skeleton headerColor='light'>
				<div className="SkeletonContainer">
					<div ref={r => (this._ref = r)} className={"Subscribe"}>
						<Helmet>
							<title>{title}</title>
						</Helmet>

						<HeaderBar subtitle={'Subscribe your phone number'} title={title} />

						<div className="Subscribe-content">
							<h4>Sign up to receive updates notifications for '{category && category.fields.name}'' straight to your cell phone via Whatsapp or SMS!
							</h4>
							<h5>
								This is a free service and only your standard text message rates will apply.
									You can end these notifications at any time by replying "STOP" to any message
							</h5>
							{this.sendingCode && 
								<div>Sending verification code</div>
							}
							{!this.state.codeSent && !this.validated && !this.sendingCode &&
								<div className="subscribe-form">
									<label>Enter your phone number</label><br></br>
									<input type="text" onChange={this.handleChange} className="subscribe-input" id="phoneNumber" value={this.state.phone} /><br></br>

									<button type="button" onClick={this.handleSubmit} className="subscribe-button" id="confirm">Submit</button>
								</div>}

							{this.state.codeSent && !this.state.validated &&
								<div className="subscribe-form">
									<label>Le hemos enviado un código de confirmación. Por favor ingréselo debajo para verificar su número</label><br></br>
									<input type="text" onChange={this.handleChangeCode} className="subscribe-input" id="code" value={this.state.code} /><br></br>
									<button type="button" onClick={this.handleSubmitCode} className="subscribe-button" id="confirm">Verify</button>
								</div>
							}
							
							{this.state.showCodeError &&
								<div>
									<h4>El código ingresado no es válido</h4>
								</div>
							}
							{this.state.showPhoneError &&
								<div>
									<h4>El número ingresado ya tiene una subscripción activa para esta categoría</h4>
								</div>
							}
							{this.state.validated &&
								<div className="all-set">
									<h3>
										Listo!
							</h3>
									<h4>
										Su número de telefono ha quedado registrado y ahora recibirás notificaciones cuando haya nueva información disponible.
							</h4>
								</div>}

						</div>


					</div>
				</div>
			</Skeleton>
		);
	}
}

const mapState = ({ country, language }, p) => ({ language, country});

export default connect(mapState)(Subscribe);

