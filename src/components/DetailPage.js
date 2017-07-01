import React, { Component } from 'react';

export default class DetailPage extends Component {
    render() {
        const { title, children } = this.props;
        return (<div style={{
        }}>
            <div style={{ display: 'block', width: '100%', height: 65 }}></div>
            <div className="title">
                <h1>{title}</h1>
            </div>
            <article>{children}</article>
        </div>);
    }
}