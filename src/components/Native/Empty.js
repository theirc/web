import React, { Component, } from 'react';
import {View} from 'react-native';

export default class Empty extends Component {
    render() {
        return (
            <div>{this.props.children}</div>
        );
    }
}
