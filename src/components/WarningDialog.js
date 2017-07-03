import React, { Component, } from 'react';
import PropTypes from 'prop-types';

import './WarningDialog.css';

export default class WarningDialog extends Component {
    static PropTypes = {
        text: PropTypes.string,
        type: PropTypes.string,
        dismiss: PropTypes.bool,
    }

    constructor() {
        super();
        this.state = {
            hide: false,
            hiding: false,
        };
    }

    componentDidMount() {
        if (this.props.dismiss) {
            setTimeout(() => {
                this.setState({
                    hiding: true
                });
                setTimeout(() => {
                    this.setState({
                        hide: true
                    });
                }, 1000);
            }, 30 * 1000)
        }
    }



    render() {
        const { text, children, type } = this.props;
        const { hide, hiding } = this.state;
        const containerClassName = `warning-dialog-container-${type || 'yellow'}`;
        if (hide) {
            return null;
        }

        return (<div className={[containerClassName, (hiding && "warning--hiding") || ""].join(' ')}>
            <div className="warning-dialog-container-inner">
                {text || children}
            </div>
        </div>);
    }

}
