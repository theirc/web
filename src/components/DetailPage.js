import React, { Component } from 'react';

export default class DetailPage extends Component {
    render() {
        const { title, children } = this.props;
        return (<div style={{
            marginTop: 65
        }}>
            <div className="title">
                <h1>{title}</h1>
            </div>
            <article>{children}</article>
        </div>);
    }
}