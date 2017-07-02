import React, { Component, } from 'react';

import './Footer.css'

export default class Footer extends Component {
    render() {
        return (
            <footer>
                <div className="light">
                    <p>Can't find specific information?</p>
                    <a href="http://www.facebook.com/refugee.info/"><h3>Ask us any question on Facebook</h3></a>
                </div>
                <div className="dark">Color?</div>
            </footer>
        );
    }
}