import React, { Component, } from 'react';
//import PropTypes from 'prop-types';

import './CountrySelector.css';

class CountrySelector extends Component {
    static propTypes = {
    }

	componentDidMount() {
		if (global.window) {
			delete global.window.sessionStorage.country;
			delete global.window.sessionStorage.dismissedNotifications;
		}
	}


    render() {
        const { countryList, onGoTo } = this.props;

        return <div className="CountrySelector">
            <div className="spacer"></div>
            {countryList.map((c, i) => (
                <button className="item " key={c.id} onClick={() => { onGoTo(c.fields.slug) }}>{c.fields.name}</button>
            ))}
            <div className="spacer"></div>
            <div className="bottom"></div>

        </div>;
    }
}
export default CountrySelector;
