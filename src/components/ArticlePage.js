import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ArticlePage.css';

const Remarkable = require('remarkable');

const md = new Remarkable('full', {
    html: true,
    linkify: true,
    typographer: true
  });

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
        const { article, category, loading } = this.props;
        const { title, content, hero } = article.fields;

        return (<div className={["ArticlePage", loading ? "loading" : "loaded"].join(' ')}>
            <div className="title">
                <h1><small>{category.fields.name}:</small>{title}</h1>
            </div>
            {hero && (<div className="hero">
                <img src={hero.fields.file.url + "?fm=jpg&fl=progressive"} alt="" />
            </div>)}
            <article>
                <div dangerouslySetInnerHTML={{ __html: md.render(content) }}></div>
            </article>
        </div>);
    }
}