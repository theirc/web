import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavigateBefore, NavigateNext, Share, ModeEdit } from 'material-ui-icons';

import './ArticleFooter.css';

/**
 * 
 */
export default class ArticleFooter extends Component {
    static propTypes = {
        match: PropTypes.shape({
            pathName: PropTypes.string
        }),
        previous: PropTypes.object,
        next: PropTypes.object,
    }

    render() {
        const rtl = false;

        return (<div className="ArticleFooter">
            <div className="selector">
                <h1>
                    <small>PREVIOUS PAGE:</small>
                    Getting an Ikka Ikka ptwang card
                </h1>
                {!rtl ? <NavigateBefore className="icon" /> : <NavigateNext className="icon" />}
            </div>
            <hr />
            <div className="selector">
                <h1>
                    <small>NEXT PAGE:</small>
                    Getting an Ikka Ikka ptwang card
                </h1>
                {!rtl ? <NavigateNext className="icon" /> : <NavigateBefore className="icon" />}
            </div>
            <hr />
            <div className="selector">
                <h1>Share this page</h1>
                <Share className="icon" />
            </div>
            <hr />
            <div className="selector">
                <h1>Suggest changes to this page</h1>
                <ModeEdit className="icon" />
            </div>
        </div>);
    }
}