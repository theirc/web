// libs
import React from "react";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import tinycolor from "tinycolor2";

// local
import cms from '../content/cms';
import "./SearchPage.css";
import "../scenes/Services/ServiceCategoryList.css";
import "../scenes/Categories/CategoryList.css";

const Remarkable = require("remarkable");

const md = new Remarkable("full", {
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

class SearchPage extends React.Component {
	state = {
		showFullServiceList: false,
		showFullBlogList: false,
	}
	constructor(props) {
		super(props);
		this.toggleServices = this.toggleServices.bind(this);
		this.toggleArticles = this.toggleArticles.bind(this);
	}

	renderServiceItem(service) {
		const { onNavigate, measureDistance, country } = this.props;
		const distance = measureDistance && service.location && measureDistance(service.location);

		let iconWithPrefix = vector_icon => vector_icon.split("-")[0] + " " + vector_icon;
		let categoryStyle = color => {
			if (!color) {
				color = "#000";
			} else if (color.indexOf("#") === -1) {
				color = `#${color}`;
			}

			color = tinycolor(color).saturate(30).darken(10).toHexString();

			return {
				color: color,
				borderColor: tinycolor(color).darken(10),
			};
		};

		let fullAddress = [service.address, service.address_city].filter(val => val).join(", ");
		let mainType = service.type ? service.type : service.types[0];
		let subTypes = service.types.filter(t => t.id > 0 && t.id !== mainType.id);

		return [
			<li key={service.id} className="Item" onClick={() => onNavigate(`/${country.fields.slug}/services/${service.id}/`)}>
				<div className="Icon" key={`${service.id}-0`}>
					<i className={iconWithPrefix(mainType.vector_icon)} style={categoryStyle(mainType.color)} />
				</div>

				<div className="Info">
					<h1>{service.name}</h1>
					<h2>
						{service.provider.name}{" "}
						<span>
							{fullAddress}
							{distance && ` - ${distance}`}
						</span>

						<div className="Icons">
							{subTypes.map((t, idx) => (
								<div className="Icon" key={`${service.id}-${idx}`}>
									<i className={iconWithPrefix(t.vector_icon)} style={categoryStyle(t.color)} />
								</div>
							))}
						</div>
					</h2>
				</div>
				<i className="material-icons" />
			</li>,
		];
	}

	renderTiles(a) {
		const { country, onNavigate } = this.props;
		let image = a.fields.hero ? a.fields.hero.fields.file.url : '/placeholder.png';

		return (
			<li className='tile' key={a.sys.id} onClick={() => onNavigate(`/${country.fields.slug}/${a.fields.category.fields.slug}/${a.fields.slug}`)}>
				<div className='img-viewport'>
					<img src={image} alt='' />
				</div>
				<div className='text'>
					{a.fields && <h2>{a.fields.title}</h2>}
					<span className='author'>By <span>{cms.siteConfig.author}</span></span>
				</div>
			</li>)
	}

	toggleServices() {
		let newState = !this.state.showFullServiceList;
		this.setState({ showFullServiceList: newState })
	}

	toggleArticles() {
		let newState = !this.state.showFullBlogList;
		this.setState({ showFullBlogList: newState })
	}

	render() {
		const { articles, onNavigate, searchingArticles, searchingServices, services, showServiceMap, term, t } = this.props;
		let servicesList = this.state.showFullServiceList ? services : services.slice().splice(0, 4);
		let articleList = this.state.showFullBlogList ? articles : articles.slice().splice(0, 3);
		const toggleServicelabel = this.state.showFullServiceList ? t('Show Less') : t('Show More');
		const toggleArticleslabel = this.state.showFullBlogList ? t('Show Less') : t('Show More');

		return (
			<div className="SearchPage">
				<div className="Title">
					<h1>
						{t("Results for")}: "{term}"
					</h1>
				</div>

				<div className="results">
					{showServiceMap &&
						<div className='services-list'>
							<h1>{t("Services")}</h1>

							<hr />

							{searchingServices && <div className="LoaderContainer"><div className="loader" /></div>}

							<div className="ServiceList">
								<div className="ServiceListContainer">
									{servicesList.map(this.renderServiceItem.bind(this))}
								</div>
							</div>

							{!searchingServices && services.length > 0 &&
								<div className="show-action"><button className="show-more" onClick={this.toggleServices}>{toggleServicelabel}</button></div>
							}

							{!searchingServices && services.length === 0 && (
								<div className='no-results'>
									<em>{t("No services found with the keywords used")}</em>
								</div>
							)
							}
						</div>
					}

					<div className='articles-list'>
						<h1>{t("Articles")}</h1>
						
						<hr />

						{searchingArticles && <div className="LoaderContainer"><div className="loader" /></div>}

						<div className="CategoryList">
							<div className='tiles-desktop'>
								<ul>
									{articleList.map(c => this.renderTiles(c))}
								</ul>
							</div>
						</div>

						<div className="CategoryList">
							<div className='tiles-mobile'>
								{articleList.map((article, i) => {
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
							</div>
						</div>

						{!searchingArticles && articles.length > 0 &&
							<div className="show-action">
								<button className="show-more" onClick={this.toggleArticles}>{toggleArticleslabel}</button>
							</div>
						}

						{!searchingArticles && articles.length === 0 && (
							<div className='no-results'>
								<em>{t("No articles found with the keywords used")}</em>
							</div>
						)
						}
					</div>
				</div>
			</div>
		);
		/*eslint-enable*/
		/*jshint ignore:end*/
	}
}

const mapState = ({ showServiceMap }, p) => {
	return {
		showServiceMap
	};
};

export default translate()(connect(mapState)(SearchPage));
