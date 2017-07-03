import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ArticlePage.css';

/**
 * 
 */
export default class ArticlePage extends Component {
    static PropTypes =  {
        article: PropTypes.shape({
            title: PropTypes.string,
            hero: PropTypes.string,
            body: PropTypes.string,
        }),
    }

    render() {
        const { article } = this.props;
        const { title, body, hero } = article;

        return (<div style={{
        }}>
            <div className="title">
                <h1>{title}</h1>
            </div>
            <div className="hero">
                <img src={hero} alt="" />
            </div>
            <article>
                <div dangerouslySetInnerHTML={{ __html: body }}></div>
            </article>
        </div>);
    }
}