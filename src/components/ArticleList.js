import React from "react";
import { translate } from "react-i18next";

class ArticleList extends React.Component {   
    

    render() {
        const { country, category, onNavigate, t , md} =this.props;
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
        )
    }
}

export default translate()(ArticleList);