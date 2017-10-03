import React, { Component, } from 'react';
import PropTypes from 'prop-types';

import './CountrySelector.css';

export default class CountrySelector extends Component {
    static propTypes = {
    }

    constructor() {
        super();
    }

    componentDidMount() {
    }

    render() {
        const { countryList, onGoTo } = this.props;

        return <div className="CountrySelector">
            <div className="spacer"></div>
            {countryList.map((c, i) => (
                <button className="item " key={c.id} onClick={() => { onGoTo(c.slug) }}>{c.name}</button>
            ))}
            <div className="spacer"></div>
            <div className="bottom"></div>

        </div>;
    }

}
