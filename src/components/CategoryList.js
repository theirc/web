import React, { Component } from "react";
import { translate } from "react-i18next";
import moment from 'moment';
import HeaderBar from "./HeaderBar";
import cms from '../content/cms';

import "./CategoryList.css";

class CategoryList extends Component {
	state = {
		selectedCategory: 0,
		selectedCategoryClassName: 'fa fa-list',
		selectedCategoryName: '',
		selectedIconText: '',
		showCategoriesDD: false
	};
	
	onChange = e => {
		this.setState({ selectedCategory: e.sys.id, selectedIconText: e.fields.iconText, selectedCategoryClassName: e.fields.iconClass, selectedCategoryName: e.fields.name, showCategoriesDD: false });
	}

	toggleDD = () => this.setState({ showCategoriesDD: !this.state.showCategoriesDD});

	handleWindowSizeChange = () => {
		this.setState({ width: window.innerWidth });
	};

	renderTiles(c) {
		let {country, language, onNavigate, t} = this.props;
		
		if(c.fields.categories) {
			return c.fields.categories.map(a => {

				let image = '/placeholder.png';
				a.fields.hero && (image = a.fields.hero.fields.file.url);
				a.fields.gallery && (image = a.fields.gallery.fields.file.url);

				return (
						<li className='tile' key={a.sys.id} onClick={() => console.log(`/${country.fields.slug}?language=`+language)}>
							<div className='img-viewport'>
								<img src={image} alt='' />
							</div>
							<div className='text'>
								{a.fields && <h2>{a.fields.name}</h2>}
								<span className='author'>{`${t('By')} `}<span>{cms.siteConfig.author}</span></span>
							</div>
						</li>
					)
				}
			);
		}
			
		if(!c.fields.categories && !c.fields.articles) {
			let image = '/placeholder.png';
			if(c.fields.overview) {
				c.fields.overview.fields && c.fields.overview.fields.hero && (image = c.fields.overview.fields.hero.fields.file.url);
				c.fields.overview.fields && c.fields.overview.fields.gallery && (image = c.fields.overview.fields.gallery.fields.file.url);
			}
					
			
			return (
				<li key={c.sys.id} className='tile' onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${c.fields.overview.fields.slug}?language=`+language)}>
					<div className='img-viewport'>
						<img src={image} alt='' />
					</div>
					<div className='text'>
						{c.fields && <h2>{c.fields.name}</h2>}
						<span className='author'>{`${t('By')} `}<span>{cms.siteConfig.author}</span>, {moment(c.sys.updatedAt).format('YYYY.MM.DD')}</span>
					</div>
				</li>
			);
		}

		if(c.fields.articles) {
			return c.fields.articles.map(a => {

				let image = '/placeholder.png';
				a.fields.hero && (image = a.fields.hero.fields.file.url);
				a.fields.gallery && (image = a.fields.gallery.fields.file.url);

				return (
					<li key={a.sys.id} className='tile' onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}?language=`+language)}>
						<div className='img-viewport'>
							<img src={image} alt='' />
						</div>
						<div className='text'>
							<h2>{a.fields.title}</h2>
							<span className='author'>{`${t('By')} `}<span>{cms.siteConfig.author}</span>, {moment(a.sys.updatedAt).format('YYYY.MM.DD')}</span>
						</div>
					</li>
					)
				}
			);
		}
	}

	render() {
		const { country, categories, onNavigate, t, language } = this.props;
		const showToggle = c => {
			return (c.fields.subCategories && c.fields.subCategories.length) || (c.fields.articles && c.fields.articles.length && c.fields.type !== "News" && !c.fields.overview);
		};
		let showCategory = c => c && c.fields && !c.fields.hide && c.fields.slug && (c.fields.overview || c.fields.articles);
		const overviewOrFirst = c => c.fields.overview || (c.fields.articles.length && c.fields.articles[0]);
		const clk = (tab) => {   ///Needs refactor
			//Add selected class if checked
			let selected = document.getElementById("tab-"+tab);
			let buttonTab = selected.parentElement;
			if (selected.checked){
				buttonTab.classList.add("selected");
			}else{
				buttonTab.classList.remove("selected");
			}
			//Uncheck any other checked input
			let chk = document.getElementsByClassName("tabs");
			for(let i=0; i<chk.length; i++){		
				if(chk[i].id !== "tab-"+tab){
					chk[i].checked=false;
					chk[i].parentElement.classList.remove("selected");
				}
			}			
		}

		return (
			<div className="CategoryList">
				<HeaderBar title={t("Categories").toUpperCase()} />
				<div className='tiles-desktop'>
					<div className='filter-bar'>
						<button className='btn-filter' onClick={this.toggleDD}>
							<div className='content'>
								<i className={this.state.selectedCategoryClassName || 'material-icons'}>{this.state.selectedIconText || ((!this.state.selectedCategoryClassName || this.state.selectedCategoryClassName === "material-icons") && "add")}</i>
								<span>{this.state.selectedCategoryName.length ? this.state.selectedCategoryName : t('All Categories')}</span>
							</div>
							<i className="material-icons">keyboard_arrow_down</i>
						</button>
						{this.state.showCategoriesDD &&
							<ul className='categories'>
								<li value={0} className={!this.state.selectedCategory ? 'active': ''} onClick={() => this.onChange({ sys: { id: 0}, fields: {name: t('All Categories'), iconClass: 'fa fa-list'}})}><i className='fa fa-list' /><span>{t('All Categories')}</span></li>
								{
									(categories || []).filter(showCategory).map(e =>
										<li key={e.sys.id} value={e.sys.id} className={e.sys.id === this.state.selectedCategory ? 'active': ''} onClick={() => this.onChange(e)}>
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
							if(c.sys.id === this.state.selectedCategory || !this.state.selectedCategory.length) {
								return this.renderTiles(c);
							}
						})}
					</ul>
				</div>
				<ul className='tiles-mobile'>
					{(categories || []).filter(showCategory).map((c, i) => (
						<li key={c.sys.id}>
							{i > 0 && <hr className="line" />}
							<input type="checkbox" className="tabs" name={"tab"} id={`tab-${i}`} onClick={() => clk(i)} />
							{showToggle(c) && [
								<label key="a-1" htmlFor={`tab-${i}`} className="container">
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
													<li key={a.sys.id} onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}?language=`+language)}>
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
										onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${c.fields.overview.fields.slug}?language=`+language)}
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

export default translate()(CategoryList);
