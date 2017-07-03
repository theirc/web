import React, { Component, } from 'react';
import moment from 'moment'
import './Footer.css'
import { EditLocation, Language, } from 'material-ui-icons';


export default class Footer extends Component {
    render() {
        const year = moment().year();

        return (
            <footer className="Footer">
                <div className="light">
                    <p>Can't find specific information?</p>
                    <a href="http://www.facebook.com/refugee.info/"><h3>Ask us any question on Facebook</h3></a>
                </div>
                <div className="dark">
                    <div className="button-container">
                        <div className="button">
                            <div className="icon-container">
                                <EditLocation />
                            </div>
                            <span>Change Location</span>
                        </div>
                        <div className="button-separator">
                            <div className="middle"/>
                        </div>
                        <div className="button">
                            <div className="icon-container">
                                <Language />
                            </div>
                            <span>Change Language</span>
                        </div>
                    </div>
                    <span>
                        Mission statement.
                    </span>
                    <img src="/google-play-badge.png" className="app-store-logo" alt="Get it on Google Play" />
                    <span className="padded">
                        Powered by the International Rescue Committee with partners. Copyleft {year}.
                    </span>
                </div>
            </footer>
        );
    }
}