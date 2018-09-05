import React from "react";
import { translate } from "react-i18next";
import "./SearchPage.css";

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class SearchPage extends React.Component {
	render() {
		const { hideServices, searchingArticles, searchingServices, articles, services, term, t, onNavigate, country } = this.props;
		/*jshint ignore:start*/
		/*eslint-disable*/
		return (
			<div className="SearchPage">
				<div className="Title">
					<h1>
						{t("Search")}: "{term}"
					</h1>
				</div>
				<div className="results">
					<h1>
						<i className="fa fa-book" aria-hidden="true" />
						{t("Articles")}
					</h1>
					<hr />

					{searchingArticles && <div className="loader" />}
					{articles.map((article, i) => {
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
									<p dangerouslySetInnerHTML={{ __html: md.render(article.fields.lead) }} />
								</div>
							</div>,
						];
					})}
					{!searchingArticles &&
						articles.length === 0 && (
							<div>
								<em>{t("No articles found with the keywords used.")}</em>
							</div>
						)}
				</div>
				{!hideServices && [
					<div key="services" className="results">
						<h1>
							<i className="fa fa-map-marker" aria-hidden="true" />
						{t("Services")}
							
						</h1>
						<hr key="divider" />

						{searchingServices && <div className="loader" />}
						{services.map((s, i) => [
							i > 0 && <hr className="line" key={`hr-${s.id}`} />,
							<div key={s.id} className="Service" onClick={() => onNavigate(`/${country.fields.slug}/services/${s.id}/`)}>
								{s.image && <div className="Image" style={{ backgroundImage: `url('${s.image}')` }} />}
								<div className={`Text ${s.image ? 'TextWithImage' : ''}`}>
									<h2>{s.name}</h2>

									<h3>
										{s.provider.name} <small>{s.region.title}</small>
									</h3>
								</div>
							</div>,
						])}
						{!searchingServices &&
							services.length === 0 && (
								<div>
									<em>{t("No services found with the keywords used.")}</em>
								</div>
							)}
					</div>,
				]}
			</div>
		);
		/*eslint-enable*/
		/*jshint ignore:end*/
	}
}

export default translate()(SearchPage);

/*

       
*/
