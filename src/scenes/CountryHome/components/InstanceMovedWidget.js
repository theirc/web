// libs
import React, { Component } from "react";
import { translate } from "react-i18next";

// local
import instance from '../../../backend/settings';
import "./InstanceMovedWidget.css";

const NS = { ns: 'CountryHome' };

/**
 * @class
 * @description 
 */
class InstanceMovedWidget extends Component {

	render() {
		const { country, t } = this.props;
		const partner = instance.countries[country.fields.slug].movedToPartner;

		return (
			<div className="InstanceMovedWidget">
				<span style={{backgroundImage: "url('/images/instance-moved.jpg')"}}></span>
				<h1>{t(partner.title, NS)}</h1>

				<br /><br />
				<h3>{t(partner.text, NS)}</h3>
				<br />
				
				<div className="buttons">
					{partner.buttons.map(b => <a href={b.link} key={b.link} target="_blank" rel="noopener noreferrer">{t(b.label, NS)}</a>)}
				</div>
			</div>
		)
	}
}

export default translate()(InstanceMovedWidget);
