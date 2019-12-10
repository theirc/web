// libs
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { translate } from "react-i18next";

// local
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import { Skeleton } from "..";
import "./Subscribe.css";

class Suscribe extends Component {

	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeCode = this.handleChangeCode.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSubmitCode = this.handleSubmitCode.bind(this);
	}

	state = {
		phone: '',
		codeSent: false,
		code: '',
		validated: false,
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
	
		const options = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({phone: this.state.phone, categoryId: this.props.category.fields.slug, code: 0, active: false})
		}
		fetch("https://admin-qa.cuentanos.org/v2/add-subscription/", options).then(response => {
			console.log(response)
		});
	
		this.setState({ codeSent: true });
	}

	

	handleSubmitCode() {
		console.log("Submit code");
		this.setState({ validated: true });
	}

	render() {
		const title = "Subscribe";
		const { category } = this.props;
		
		return (
			<Skeleton headerColor='light'>
				<div className="SkeletonContainer">
					<div ref={r => (this._ref = r)} className={"Subscribe"}>
						<Helmet>
							<title>{title}</title>
						</Helmet>

						<HeaderBar subtitle={'Subscribe your phone number'} title={title} />

						<div className="Subscribe-content">
							<h4>Sign up to receive updates notifications for '{category.fields.name}'' straight to your cell phone via Whatsapp or SMS!
							</h4>
							<h5>
								This is a free service and only your standard text message rates will apply.
									You can end these notifications at any time by replying "STOP" to any message
							</h5>

							{!this.state.codeSent && !this.validated &&
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

export default translate()(Suscribe);
