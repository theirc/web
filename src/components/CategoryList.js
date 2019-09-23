import React, { Component } from "react";
import { translate } from "react-i18next";
import moment from 'moment';
import HeaderBar from "./HeaderBar";
import cms from '../content/cms';

import "./CategoryList.css";

class CategoryList extends Component {
	state = {
		selectedCategory: ''
	};
	
	onChange = (e) => {
		this.setState({ selectedCategory: e.target.value });
	}


	handleWindowSizeChange = () => {
		this.setState({ width: window.innerWidth });
	};

	renderTiles(c) {
		let {country, language, onNavigate, t} = this.props;
		
		if(c.fields.categories) {
			return c.fields.categories.map(a =>
				(
					<li className='tile' key={a.sys.id} onClick={() => console.log(`/${country.fields.slug}?language=`+language)}>
						<div className='img-viewport'>
							{!a.fields.hero && <img src='/placeholder.png' alt='' />}
						</div>
						<div className='text'>
							{a.fields && <h2>{a.fields.name}</h2>}
							<span className='author'>{`${t('By')} `}<span>{cms.siteConfig.author}</span></span>
						</div>
					</li>
				)
				);
			}
			
		if(!c.fields.categories && !c.fields.articles) {
			let image = c.fields.overview && c.fields.overview.fields && c.fields.overview.fields.hero ?
									c.fields.overview.fields.hero.fields.file.url : '/placeholder.png';
			
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
			return c.fields.articles.map(a => a.fields && (
				<li key={a.sys.id} className='tile' onClick={() => onNavigate(`/${country.fields.slug}/${c.fields.slug}/${a.fields.slug}?language=`+language)}>
					<div className='img-viewport'>
						{a.fields.hero && a.fields.hero.fields && <img src={a.fields.hero.fields.file.url + '?fm=jpg&fl=progressive'} alt='' />}
						{!a.fields.hero && <img src='/placeholder.png' alt='' />}
					</div>
					<div className='text'>
						<h2>{a.fields.title}</h2>
						<span className='author'>{`${t('By')} `}<span>{cms.siteConfig.author}</span>, {moment(a.sys.updatedAt).format('YYYY.MM.DD')}</span>
					</div>
				</li>
			));
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
						<select className='select-css' value={this.state.selectedCategory} onChange={this.onChange}>
							<option value=''>{t('All Categories')}</option>
							{(categories || []).filter(showCategory).map(e => <option key={e.sys.id} value={e.sys.id}>{e.fields.name}</option>)}
						</select>
					</div>
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
