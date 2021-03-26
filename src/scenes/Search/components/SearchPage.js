// libs
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import tinycolor from "tinycolor2";
import instance from '../../../backend/settings';
import 'lazysizes'

// local
import "./SearchPage.css";
import "../../Services/components/ServiceCategoryList.css";
import "../../ArticleList/components/desktop/ArticleListBody.css";
import Markdown from "markdown-to-jsx";

const NS = { ns: 'Search' };

/**
 * @class
 * @description 
 */
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
		const { onNavigate, language, measureDistance, country } = this.props;
		const distance = measureDistance && service.location && measureDistance(service.location);

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
		let mainType = service.serviceCategories ? service.serviceCategories[0] : '';
		let subTypes = service.serviceCategories.length > 1 ? service.serviceCategories.filter(c => c.id !== mainType.id) : '';

		return [
			<li key={service.id} className="Item" onClick={() => onNavigate(`/${country.fields.slug}/services/${service.id}?language=${language}`)}>
				<div className="Icon" key={`${service.id}-0`}>
					<i className={mainType.icon} style={categoryStyle(mainType.color)} />
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
							{subTypes.length > 0 && subTypes.map((t, idx) => (
								<div className="Icon" key={`${service.id}-${idx}`}>
									<i className={t.icon} style={categoryStyle(t.color)} />
								</div>
							))}
						</div>
					</h2>
				</div>
				{/* <i className="material-icons" /> */}
			</li>,
		];
	}

	renderTiles(a) {
		const { country, language, onNavigate } = this.props;
		let image = a.fields.hero ? a.fields.hero.fields.file.url : '/placeholder.png';

		let appendLeadingZeroes = (n) => {
			if(n <= 9) {
			  return "0" + n;
				  }
				  return n
			  }
		  
		const updatedDate = (param) => new Date(param)
		const updatedAtDate = (param) => `${updatedDate(param).getFullYear()}.${appendLeadingZeroes(updatedDate(param).getMonth() + 1)}.${appendLeadingZeroes(updatedDate(param).getDate())}`
	  

		return (
			<li className='tile' key={a.sys.id} onClick={() => onNavigate(`/${country.fields.slug}/${a.fields.category.fields.slug}/${a.fields.slug}?language=${language}`)}>
				<div className='img-viewport'>
					<img data-src={image} alt='hero-search-page' className="lazyload" />
				</div>
				<div className='text'>
					{a.fields && <h2>{a.fields.title}</h2>}
					<span className='author'>{updatedAtDate(a.sys.updatedAt)}</span>
				</div>
			</li>)
	}

	toggleServices() {
		let newState = !this.state.showFullServiceList;
		!newState && window.scroll(0, 0);
		this.setState({ showFullServiceList: newState })
	}

	toggleArticles() {
		let newState = !this.state.showFullBlogList;
		this.setState({ showFullBlogList: newState })
	}

	render() {
		const { articles, country, language, onNavigate, searchingArticles, searchingServices, services, term, t } = this.props;
		let servicesList = (this.state.showFullServiceList && services) ? services : (services ? services.slice().splice(0, 4): []);
		let articleList = (this.state.showFullBlogList && articles) ? articles : (articles ? articles.slice().splice(0, 3) : []);
		const toggleServicelabel = this.state.showFullServiceList ? t('buttons.Show Less', NS) : t('buttons.Show More', NS);
		const toggleArticleslabel = this.state.showFullBlogList ? t('buttons.Show Less', NS) : t('buttons.Show More', NS);

		return (
			<div className="SearchPage">
				<div className="Title">
					<h1>
						{t("title.Results for", NS)}: "{term}"
					</h1>
				</div>

				<div className="results">
					{instance.countries[country.fields.slug].switches.showServices &&
						<div className='services-list'>
							<h1>{t("list.Services", NS)}</h1>

							<hr />

							{searchingServices && <div className="LoaderContainer"><div className="loader" /></div>}

							<div className="ServiceList">
								<div className="ServiceListContainer">
									{servicesList.map(this.renderServiceItem.bind(this))}
								</div>
							</div>

							{!searchingServices && services && services.length > 4 &&
								<div className="show-action"><button className="show-more" onClick={this.toggleServices}>{toggleServicelabel}</button></div>
							}

							{!searchingServices && services &&  services.length === 0 && (
								<div className='no-results'>
									<em>{t("list.No services found with the keywords used", NS)}</em>
								</div>
							)
							}
						</div>
					}

					<div className='articles-list'>
						<h1>{t("list.Articles", NS)}</h1>
						
						<hr />

						{searchingArticles && <div className="LoaderContainer"><div className="loader" /></div>}

						<div className="ArticleListBody">
							<div className='tiles-desktop'>
								<ul>
									{articleList.map(c => this.renderTiles(c))}
								</ul>
							</div>
						</div>

						<div className="ArticleListBody">
							<div className='tiles-mobile'>
								{articleList.map((article, i) => {
									return [
										i > 0 && <hr className="line" key={`hr-${article.sys.id}`} />,
										<div
											key={article.sys.id}
											className="Article"
											onClick={() => onNavigate(`/${article.fields.country.fields.slug}/${article.fields.category.fields.slug}/${article.fields.slug}?language=${language}`)}
										>
											{article.fields.hero && <div className="Image" style={{ backgroundImage: `url('${article.fields.hero.fields.file.url}')` }} />}
											{!article.fields.hero && <div className="Image" style={{ backgroundImage: `url('/placeholder.png')` }} />}
											<div className='Text TextWithImage'>
												<h2> {article.fields.title}</h2>
												{article.fields && article.fields.lead && (<Markdown>{article.fields.lead}</Markdown>)}
											</div>
										</div>,
									];
								})}
							</div>
						</div>

						{!searchingArticles && articles &&  articles.length > 0 &&
							<div className="show-action">
								<button className="show-more" onClick={this.toggleArticles}>{toggleArticleslabel}</button>
							</div>
						}

						{!searchingArticles && articles &&  articles.length === 0 && (
							<div className='no-results'>
								<em>{t("list.No articles found with the keywords used", NS)}</em>
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

const mapState = ({ country }, p) => ({ country });

export default withTranslation()(connect(mapState)(SearchPage));
