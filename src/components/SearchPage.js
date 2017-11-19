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
						{t("Search Results")}: "{term}"
					</h1>
				</div>
				<div className="results">
					<h1>
						<i className="fa fa-book" aria-hidden="true" />
						Articles
					</h1>
					<hr />

					{searchingArticles && <div className="loader" />}
					{articles.map(article => {
						let hero = article.fields.hero;

						return (
							<div key={article.sys.id} className="Article">
								<h2> {article.fields.title}</h2>
								{article.fields.hero && <img src={article.fields.hero.fields.file.url} alt={article.fields.title} />}
								<p dangerouslySetInnerHTML={{ __html: md.render(article.fields.lead) }} />
								<s className="Read-More">
									<a href="#" onClick={() => onNavigate(`/${article.fields.country.fields.slug}/${article.fields.category.fields.slug}/${article.fields.slug}`)}>
										{t("Read More")}
									</a>
								</s>
							</div>
						);
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
							<i class="fa fa-map-marker" aria-hidden="true" />
							Services
						</h1>
						<hr key="divider" />

						{searchingServices && <div className="loader" />}
						{services.map(s => (
							<div key={s.id} className="Service">
								<h2>{s.name}</h2>
								{s.image && <img src={s.image} alt={s.name} />}

								<h3>
									{s.provider.name} <small>{s.region.title}</small>
								</h3>
								<s className="Read-More">
									<a href="#" onClick={() => onNavigate(`/${country.fields.slug}/services/${s.id}/`)}>
										{t("Read More")}
									</a>
								</s>
							</div>
						))}
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
