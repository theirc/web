import React, { Component, } from 'react';
//import PropTypes from 'prop-types';

import './LanguageSelector.css';

export default class LanguageSelector extends Component {
    static propTypes = {
    }

    componentDidMount() {
    }

    render() {
        const { languages, onSelectLanguage } = this.props;

        return <div className="LanguageSelector">
            <div className="spacer"></div>
            {languages.map((c, i) => (
                <button className="item " key={i} onClick={() => { onSelectLanguage(c[0]) }}>{c[1]}</button>
            ))}
            <div className="spacer"></div>
            <div className="bottom"></div>

        </div>;
    }

}
