// libs
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { translate } from "react-i18next";
import moment from 'moment';
import _ from 'lodash';

// local
import HeaderBar from "../../../../components/HeaderBar/HeaderBar";
import "../../../../components/ActionsBar/ActionsBar.css";
import "./ArticleListBody.css";

const NS = { ns: 'ArticleList' };

/**
 * @class
 * @description 
 */
class ArticleListBody extends Component {
	state = {
		selectedCategory: 0,
		selectedCategoryClassName: 'material-icons',
		selectedCategoryName: '',
		selectedIconText: 'assignment',
		showCategoriesDD: false
	};

	componentWillMount() {
		let category = decodeURIComponent(document.location.pathname.split('/')[2]);
		category !== 'categories' && !this.props.categories.filter(c => _.get(c, 'fields.slug') === category).length && this.props.history.push('/404');
	}
	
	componentDidMount() {
		const { categories } = this.props;
		let category = document.location.pathname.split('/')[2];
		category !== 'categories' && this.clk(category, true);
		
		let selectedCategory = category !== 'categories' && categories.filter(c => _.get(c, 'fields.slug') === decodeURIComponent(category));
		
		selectedCategory && selectedCategory.length && this.setState({
			selectedCategory: selectedCategory[0].sys.id,
			selectedCategoryName: selectedCategory[0].fields.name,
			selectedCategoryClassName: selectedCategory[0].fields.iconClass || 'material-icons',
			selectedIconText: selectedCategory[0].fields.iconText || ((!selectedCategory[0].fields.iconClass || selectedCategory[0].fields.iconClass === "material-icons") && "add")
		});
	}

	clk(tab, forceSelect=false) { ///Needs refactor
		//Add selected class if checked
		let selected = document.getElementById("tab-" + decodeURIComponent(tab));
		if(!selected) return;

		let buttonTab = selected.parentElement;

		if (selected.checked || forceSelect) {
			forceSelect && (selected.checked = true);
			buttonTab.classList.add("selected");
		} else {
			buttonTab.classList.remove("selected");
		}
		
		//Uncheck any other checked input
		let chk = document.getElementsByClassName("tabs");
		for (let i = 0; i < chk.length; i++) {
			if (chk[i].id !== "tab-" + decodeURIComponent(tab)) {
				chk[i].checked = false;
				chk[i].parentElement.classList.remove("selected");
			}
		}
	}


	onChange = e => {
		const {history, country} = this.props;
		this.setState({ selectedCategory: e.sys.id, selectedIconText: e.fields.iconText, selectedCategoryClassName: e.fields.iconClass, selectedCategoryName: e.fields.name, showCategoriesDD: false });
		e.sys.id ? history.push(`/${country.fields.slug}/${e.fields.slug}`) : history.push(`/${country.fields.slug}/categories`);
	}

	toggleDD = () => this.setState({ showCategoriesDD: !this.state.showCategoriesDD });

	handleWindowSizeChange = () => {
		this.setState({ width: window.innerWidth });
	};

	renderTiles(c) {
		let { country, language } = this.props;

		if(!c.fields) { console.log('c.fields is null', c); return null;}

		if (!c.fields.categories && !c.fields.articles) {
			let image = '/placeholder.png';
			if (c.fields.overview) {
				_.has(c, 'fields.overview.fields.hero.fields.file') && (image = c.fields.overview.fields.hero.fields.file.url);
				_.has(c, 'fields.overview.fields.gallery.fields.file') && (image = c.fields.overview.fields.gallery.fields.file.url);
			}

			return (
				<li key={c.sys.id} className='tile'>
					<Link to={`/${country.fields.slug}/${c.fields.slug}/${c.fields.overview.fields.slug}?language=${language}`}>
						<div className='img-viewport'>
							<img src={image} alt='' />
						</div>

						<div className='text'>
							<div className='category'>
								<i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "add")}</i>
								<span>{c.fields.name}</span>
							</div>
							
							{c.fields && <h2>{c.fields.name}</h2>}
							<span className='author'>{moment(c.sys.updatedAt).format('YYYY.MM.DD')}</span>
						</div>
					</Link>
				</li>
			);
		}

		if (c.fields.articles) {
			return c.fields.articles.map(a => {

				if(!a.fields) return null;

				let image = '/placeholder.png';
				_.has(a, 'fields.hero.fields.file') && (image = a.fields.hero.fields.file.url);
				_.has(a, 'fields.gallery.fields.file') && (image = a.fields.gallery.fields.file.url);

				return (
					<li key={a.sys.id} className='tile'>
						<Link to={`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}?language=${language}`}>
							<div className='img-viewport'>
								<img src={image} alt='' />
							</div>

							<div className='text'>
								{a.fields.category &&
								<div className='category'>
									<i className={a.fields.category.fields.iconClass || "material-icons"}>{a.fields.category.fields.iconText || ((!a.fields.category.fields.iconClass || a.fields.category.fields.iconClass === "material-icons") && "add")}</i>
									<span>{a.fields.category.fields.name}</span>
								</div>}

								<h2>{a.fields.title}</h2>
								<span className='author'>{moment(a.sys.updatedAt).format('YYYY.MM.DD')}</span>
							</div>
						</Link>
					</li>
				)
			});
		}
	}

	render() {
		const { country, categories, onNavigate, t, language } = this.props;
		const showToggle = c => {
			return (c.fields.subCategories && c.fields.subCategories.length) || (c.fields.articles && c.fields.articles.length && c.fields.type !== "News" && !c.fields.overview);
		};
		let showCategory = c => c && c.fields && !c.fields.hide && c.fields.slug && (c.fields.overview || c.fields.articles);
		const overviewOrFirst = c => c.fields.overview || (c.fields.articles.length && c.fields.articles[0]);

		return (
			<div className="ArticleListBody">
				{/* TODO: Translate this */}
				<HeaderBar title={t("header.Categories", NS).toUpperCase()} />
				<div className='tiles-desktop'>
					<div className='ActionsBar'>
						<div className="left">
							<div id='articles-list-dropdown' onClick={this.toggleDD}>
								<div className='content'>
									<i className={this.state.selectedCategoryClassName || 'material-icons'}>{this.state.selectedIconText || ((!this.state.selectedCategoryClassName || this.state.selectedCategoryClassName === "material-icons") && "add")}</i>
									<span>{this.state.selectedCategoryName.length ? this.state.selectedCategoryName : t('actions.All Articles', NS)}</span>
								</div>
								<i className="material-icons">keyboard_arrow_down</i>
							</div>
						</div>

						{this.state.showCategoriesDD &&
							<ul id='articles-list-popover'>
								<li value={0} className={!this.state.selectedCategory ? 'active' : ''} onClick={() => this.onChange({ sys: { id: 0 }, fields: { name: t('actions.All Articles', NS), iconClass: 'material-icons', iconText: 'assignment' } })}><i className='material-icons'>assignment</i><span>{t('actions.All Articles', NS)}</span></li>
								{
									(categories || []).filter(showCategory).map(e =>
										<li key={e.sys.id} value={e.sys.id} className={e.sys.id === this.state.selectedCategory ? 'active' : ''} onClick={() => {this.onChange(e); this.clk(e.fields.slug, true)}}>
											<i className={e.fields.iconClass || "material-icons"}>{e.fields.iconText || ((!e.fields.iconClass || e.fields.iconClass === "material-icons") && "add")}</i>
											<span>{e.fields.name}</span>
										</li>
									)
								}
							</ul>
						}
					</div>

					{this.state.showCategoriesDD && <div className="overlay" onClick={this.toggleDD}></div>}

					<ul>
						{(categories || []).filter(showCategory).map(c => {
							if (c.sys.id === this.state.selectedCategory || !this.state.selectedCategory.length) {
								return this.renderTiles(c);
							}
							return null;
						})}
					</ul>
				</div>
				<ul className='tiles-mobile'>
					{(categories || []).filter(showCategory).map((c, i) => (
						<li key={c.sys.id}>
							{i > 0 && <hr className="line" />}

							<input type="checkbox" className="tabs" name={"tab"} id={`tab-${c.fields.slug}`} onClick={() => {this.clk(c.fields.slug)}} />

							{showToggle(c) && [
								<label key="a-1" htmlFor={`tab-${c.fields.slug}`} className="container">
									<i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "add")}</i>
									<span className="category-name">{c.fields && c.fields.name}</span>
									<div className="up">
										<i className="material-icons">keyboard_arrow_up</i>
									</div>
									<div className="down">
										<i className="material-icons">keyboard_arrow_down</i>
									</div>
								</label>,
								c.fields.categories && (
									<ul key="a-2">
										{c.fields.categories.map(
											a =>
												a.fields && (
													<li key={a.sys.id} onClick={() => onNavigate(`/${country.fields.slug}/${a.fields.slug}/${overviewOrFirst(a).fields.slug}`)}>
														<div className="inner-container article-title">
															<div> {a.fields.name}</div>
														</div>
													</li>
												)
										)}
									</ul>
								),
								<ul key="a-3">
									{c.fields.articles &&
										c.fields.articles.map(
											a =>
												a.fields && (
													<li key={a.sys.id} onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}?language=` + language)}>
														<div className="inner-container article-title">
															<div> {a.fields.title}</div>
														</div>
													</li>
												)
										)}
								</ul>,
							]}

							{!showToggle(c) &&
								c.fields.overview && (
									<label
										key={c.sys.id}
										htmlFor={`tab-${i}`}
										className="container"
										onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${c.fields.overview.fields.slug}?language=` + language)}
									>
										<i className={c.fields.iconClass || "material-icons"}>{c.fields.iconText || ((!c.fields.iconClass || c.fields.iconClass === "material-icons") && "book")}</i>
										<span className="category-name">{c.fields && c.fields.name}</span>
									</label>
								)}
						</li>
					))}
				</ul>
			</div>
		);
	}
}

export default translate()(ArticleListBody);
