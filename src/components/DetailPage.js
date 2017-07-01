import React, { Component } from 'react';

export default class DetailPage extends Component {
    render() {
        const { title, children, hero } = this.props;
        return (<div style={{
        }}>
            <div className="title">
                <h1>{title}</h1>
            </div>
                <img className="hero" src={hero} />
            <article>
                {children}
            </article>
        </div>);
    }
}