// libs
import React from "react";
import { translate } from "react-i18next";

// local
import "./ArticleListOOD.css";

/**
 * @class
 * @description OOD: short for Out Of Date, this could reuse ArticleList and ServiceList
 */
class ArticleListOOD extends React.Component {

	render() {
		const { country, category, onNavigate, md } = this.props;
		return (
			<div className="ArticleListOOD">
				<div className="Title">
					<h1>
						{category.fields.name}
					</h1>
				</div>
				<div className="list">
					{category.fields.articles && category.fields.articles.map((article, i) => {

						return [
							i > 0 && <hr className="line" key={`hr-${article.sys.id}`} />,
							<div
								key={article.sys.id}
								className="Article"
								onClick={() => onNavigate(`/${country.fields.slug}/${category.fields.slug}/${article.fields.slug}`)}>
								
								{article.fields.hero && <div className="Image" style={{ backgroundImage: `url('${article.fields.hero.fields.file.url}')` }} />}

								<div className={`Text ${article.fields.hero ? 'TextWithImage' : ''}`}>
									<h2> {article.fields.title}</h2>
									<p dangerouslySetInnerHTML={{ __html: md.render(article.fields.lead) }} />
								</div>

								<s className="Read-More">
									<a href="#/">Read More</a>
									<i className="material-icons">arrow_right</i>
								</s>
							</div>,
						];
					})}
				</div>
			</div>
		)
	}
}

export default translate()(ArticleListOOD);
