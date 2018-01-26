import React from 'react';
import services from '../backend';
import { connect } from 'react-redux'
import { ArticleList } from '../components'
import { push } from "react-router-redux";
import { translate } from "react-i18next";

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class CategoryHome extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    componentWillMount() {
    }

    render() {
        const { country, category, onNavigate, t } =this.props;

        if(!country || !category) {
            return null;
        }

        return (
            <div className="SearchPage">
                <div className="Title">
                    <h1>
                        {category.fields.name}
                    </h1>
                </div>
                <div className="results">
                    {category.fields.articles && category.fields.articles.map((article, i) => {
                        let hero = article.fields.hero;

                        return [
                            i > 0 && <hr className="line" key={`hr-${article.sys.id}`} />,
                            <div
                                key={article.sys.id}
                                className="Article"
                                onClick={() => onNavigate(`/${article.fields.country.fields.slug}/${article.fields.category.fields.slug}/${article.fields.slug}`)}
                            >
                                {article.fields.hero && <div className="Image" style={{ backgroundImage: `url('${article.fields.hero.fields.file.url}')` }} />}
                                <div className={`Text ${article.fields.hero ? 'TextWithImage' : ''}`}>
                                    <h2> {article.fields.title}</h2>
                                    <p dangerouslySetInnerHTML={{ __html: md.render(article.fields.lead)}} />
                                </div>
                                <s className="Read-More">
                                    <a href="#">Read More</a>
                                </s>
                            </div>,
                        ];
                    })}
                </div>
            </div>
            );
    }
}

const mapState = (s, p) => {
    return {
        articles: s.articles,
        country: s.country,
    };
};
const mapDispatch = (d, p) => {
    return {
        onNavigate(url) {
			d(push(url));
		},
        onMount: () => {
            d(services.articles.get('the-title-of-this-article-style-title'));
        }
    };
};

export default connect(mapState, mapDispatch)(CategoryHome);
