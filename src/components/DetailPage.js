import React, { Component } from 'react';

export default class DetailPage extends Component {
    render() {
        return (<article>{this.props.children}</article>);
    }
}