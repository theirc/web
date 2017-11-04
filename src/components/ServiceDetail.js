import React from "react";
import "./ServiceHome.css";
import { translate } from "react-i18next";
import _ from "lodash";
import { CircularProgress } from "material-ui/Progress";

// eslint-disable-next-line
var tinycolor = require("tinycolor2");

class ServiceDetail extends React.Component {
	state = {
		service: null,
	};
	componentDidMount() {
		const { fetchService } = this.props;
		if (fetchService) {
			fetchService().then(service => this.setState({ service }));
		}
	}
	render() {
		const { service } = this.state;
		const { t } = this.props;
		if (!service) {
			return (
				<div className="ServiceDetail">
					<div className="Title">
						<h1>{t("Service Detail")}</h1>
					</div>
					<div className="Spacer">
						<CircularProgress />
					</div>
				</div>
			);
		}

		return (
			<div className="ServiceDetail">
				<div className="Title">
					<h1>
						<small>{_.first(service.types).name}:</small>
						{service.name}
					</h1>
				</div>
				{service.image && (
					<div className="hero">
						<img src={service.image} alt={service.provider.name} />
					</div>
				)}
				<article>
					<p dangerouslySetInnerHTML={{ __html: service.description }} />
					{service.additional_information && [<h3>{t("Additional Information")}</h3>, <p dangerouslySetInnerHTML={{ __html: service.additional_information }} />]}
					<h3>{t("Address")}</h3>
					<p>
						<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service["address_en"])}`} rel="noopener noreferrer" target="_blank">
							{service.address}
						</a>
					</p>
					<p dangerouslySetInnerHTML={{ __html: service.address_in_country_language }} />
				</article>
			</div>
		);
	}
}
export default translate()(ServiceDetail);
