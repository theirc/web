// libs
import React, { Component } from "react";
import { Search } from "material-ui-icons";
import Headroom from "react-headrooms";
import PropTypes from "prop-types";
import { translate, Interpolate } from "react-i18next";
import { Close, Home, List, Assignment } from "material-ui-icons";

// local
import Alert from '../Alert/Alert';
import selectedMenuItem from "../../helpers/menu-items";
import i18nHelpers from '../../helpers/i18n';
import instance from '../../backend/settings';
import languages from './languages';
import "./AppHeader.css";

const NS = { ns: 'AppHeader' };

/**
 * @class
 * @description 
 */
class AppHeader extends Component {
	
	static propTypes = {
		onChangeCountry: PropTypes.func,
		onGoToSearch: PropTypes.func,
		onGoHome: PropTypes.func,
		country: PropTypes.object,
		language: PropTypes.string,
		onGoToServices: PropTypes.func,
		onGoToCategories: PropTypes.func,
	};
	
	
	state = {
		search: false,
		prvalert: localStorage.getItem("privacy-policy"),
		searchText: "",
		active: false,
	};

	constructor() {
		super();
		i18nHelpers.loadResource(languages, NS.ns);
	}

	toggleClass() {
		const { currentState } = this.state.active;
		this.setState({ active: !currentState });
	}

	toggleSearch() {
		const { search } = this.state;
		if (!search) {
			//window.scrollTo(0, 0);
		}
		this.setState({ search: !search });
	}

	closeAlert() {
		this.setState({ prvalert: true });
		localStorage.setItem("privacy-policy", true);
	}

	handleInputChange(event) {
		const target = event.target;
		const value = target.type === "checkbox" ? target.checked : target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	}

	handleSubmit(event) {
		const { onGoToSearch } = this.props;
		const { searchText } = this.state;

		onGoToSearch(searchText);

		setTimeout(() => {
			this.setState({ search: false, searchText: "" });
		}, 200);

		event.preventDefault();
	}

	render() {
		const {
			country,
			headerColor,
			homePage,
			language,
			onChangeCountry,
			onChangeLanguage,
			onGoHome,
			onGoToCategories,
			onGoToServices,
			t,
		} = this.props;

		const { search, searchText } = this.state;
		const backgroundDark = headerColor === 'light' ? false : true;
		const logo = instance.brand.images.logo || "/logo.svg";
		const logoBlack = instance.brand.images.logoBlack || logo;
		const noop = () => console.log("noop");
		const cookiePolicyLink = <a href="/greece/privacy/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a>;
		const privacyPolicyLink = <a href="/greece/privacy/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>;

		let isOnServices = window.location.href.includes("/services");
		let isOnArticlesGreece = window.location.href.includes("/categories") || /(\/greece\/.*\/.*)/.test(window.location.href);

		let disclaimersLink = `/greece/refugee-info-greece-closed/refugee-info-stops-operating-in-greece?language=${language}`;
		disclaimersLink = window.location.href.includes(disclaimersLink) ? '#' : disclaimersLink;
		let covidLink = '/el-salvador/emergencia-por-coronavirus';

		let selectedIndex = selectedMenuItem();
		let path = window.location.pathname;
		return (
			<div className={backgroundDark ? 'AppHeader' : 'AppHeaderLight'}>
				<Headroom tolerance={5} offset={200}>
					<div className={[homePage ? "header-opacity" : "", backgroundDark ? 'app-bar' : 'app-bar-light', !(country && language) ? 'app-bar-black' : ''].join(" ")}>

						<div className={["app-bar-container logo", !(country && language) ? "logo-centered" : ""].join(" ")} onClick={path.includes('selectors') ? noop : onGoHome || noop}>
							<img onClick={onGoHome} src={backgroundDark ? logo : logoBlack} className="app-bar-logo" alt=" " />
						</div>

						{country && language &&
							(
								<div className="app-bar-container buttons">
									<div className="app-bar-buttons">
										<span className={`app-bar-selectors top-menu ${selectedIndex === 0 ? "Selected" : ""}`} color="contrast" onClick={onGoHome || noop}>
											<Home /><span className='menu-item'>{t("menu.Home", NS)}</span>
										</span>

										{instance.countries[country.fields.slug].switches.showArticles &&
											<span className={`app-bar-selectors top-menu ${selectedIndex === 1 ? "Selected" : ""}`} color="contrast" onClick={onGoToCategories || noop}>
												<Assignment /><span className='menu-item'>{t("menu.Articles", NS)}</span>
											</span>
										}

										{instance.countries[country.fields.slug].switches.showServices &&
											<span className={`app-bar-selectors top-menu ${selectedIndex === 2 ? "Selected" : ""}`} color="contrast" onClick={onGoToServices || noop}>
												<List /><span className='menu-item'>{t("menu.Services", NS)}</span>
											</span>
										}

										<span className='selectors'>
											{!instance.switches.disableCountrySelector &&
												<span className="country" color="contrast" onClick={onChangeCountry || noop}>
													<img src={`/images/flags/${country.fields.slug}.png`} alt='' />
												</span>
											}

											{!instance.switches.disableLanguageSelector &&
												<span className="lang" color="contrast" onClick={onChangeLanguage}>
													{language || " "}
												</span>
											}
										</span>

										<div className="app-bar-separator separator-searchIcon" />

										{!search && <Search className='search-btn' onClick={this.toggleSearch.bind(this)} />}

										{search && <i className="fa fa-times search-btn" onClick={this.toggleSearch.bind(this)} />}

									</div>
								</div>
							)
						}
					</div>
				</Headroom>

				{search && (
					<form onSubmit={this.handleSubmit.bind(this)} className="SearchBar">
						<input autoComplete="off" autoFocus name="searchText" placeholder={t("menu.Search", NS)} type="text" value={searchText} onChange={this.handleInputChange.bind(this)} />
						{searchText && <i className="fa fa-times-circle" onClick={() => this.setState({ searchText: "" })} />}
						<i className="fa fa-search" onClick={this.handleSubmit.bind(this)} />
					</form>
				)}

				{!this.state.prvalert && instance.switches.cookieBanner && (
					<div className={this.state.prvalert ? 'hidden' : 'privacy-banner'}>
						<div className='content'>
							<span className="privacy-banner-separator"></span>
							<Interpolate i18nKey="COOKIES_BANNER" cookiePolicy={cookiePolicyLink} privacyPolicy={privacyPolicyLink} />
						</div>
						<Close
							className="close-alert"
							color="contrast"
							size={36}
							onClick={this.closeAlert.bind(this)}
						/>
					</div>
				)}

				{(isOnServices || isOnArticlesGreece) && window.location.href.includes('/greece/') &&
					<Alert link={disclaimersLink} message={isOnServices ? t("banner.Greece.Services", NS) : t('banner.Greece.Articles', NS)} />
				}

				{!(isOnServices || isOnArticlesGreece) && window.location.href.includes('/greece') &&
					<Alert link={disclaimersLink} message={t('banner.Greece.Home', NS)} />
				}

				{window.location.href.includes('/jordan') &&
					<Alert message={t('banner.Jordan', NS)} fontColor='white'/>
				}
				
				{window.location.href.endsWith('/el-salvador') &&
					<Alert link={covidLink} message={t('banner.ElSalvador', NS)} bgColor='#ffda1a' fontColor='black'/>
				}

			</div>
		);
	}
}

export default translate()(AppHeader);
