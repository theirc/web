import React, { Component } from 'react';

import './DetailPage.css';

export default class DetailPage extends Component {
    render() {
        const { title, children, hero } = this.props;
        return (<div style={{
        }}>
            <div className="title">
                <h1>{title}</h1>
            </div>
            <div className="hero">
                <img src={hero} />
            </div>
            <article>
                {children}
            </article>
        </div>);
    }
}