import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ArticlePage.css';

/**
 * 
 */
export default class ArticlePage extends Component {
    static propTypes = {
        article: PropTypes.shape({
            title: PropTypes.string,
            hero: PropTypes.string,
            body: PropTypes.string,
        }),
        category: PropTypes.shape({
            name: PropTypes.string,
            slug: PropTypes.string,
            translations: PropTypes.array,
        }),
    }

    render() {
        const { article, category } = this.props;
        const { title, body, hero } = article;

        return (<div className="ArticlePage">
            <div className="title">
                <h1><small>{category.name}:</small>{title}</h1>
            </div>
            {hero && (<div className="hero">
                <img src={hero} alt="" />
            </div>)}
            <article>
                <div dangerouslySetInnerHTML={{ __html: body }}></div>
            </article>
        </div>);
    }
}