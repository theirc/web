import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './DetailPage.css';

export default class DetailPage extends Component {
    static propTypes =  {
        title: PropTypes.string,
        hero: PropTypes.string,
        body: PropTypes.string,
    }
    render() {
        const { title, children, hero } = this.props;
        return (<div style={{
        }}>
            <div className="title">
                <h1>{title}</h1>
            </div>
            <div className="hero">
                <img src={hero} alt=" "/>
            </div>
            <article>
                {children}
            </article>
        </div>);
    }
}