import React, { Component } from "react";
import { IconButton } from "material-ui";
import { connect } from "react-redux";
import Headroom from "react-headrooms";
import PropTypes from "prop-types";
import { translate, Interpolate } from "react-i18next";
import { Close } from "material-ui-icons";
import "./AppHeader.css";
import { lang } from "moment";
import { push } from "react-router-redux";

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
	toggleClass() {
		const { currentState } = this.state.active;
		this.setState({ active: !currentState });
	}
	toggleSearch() {
		const { search } = this.state;
		if (!search) {
			window.scrollTo(0, 0);
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
		const { onChangeCountry, onChangeLanguage, disableLanguageSelector, disableCountrySelector, onGoHome, onGoToServices, onGoToCategories, country, language, t, headerColor } = this.props;
		const { search, searchText } = this.state;
		const backgroundDark = headerColor === 'light' ? false : true;
		const logo = this.props.logo || "/logo.svg";
		const logoBlack = this.props.logoBlack || logo;
		console.log("backgroundDark", backgroundDark, "Logo:", logo, "Logo Black:", logoBlack);
		const noop = () => {
			console.log("noop");
		};
		const cookiePolicyLink = <a href="/greece/privacy/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a>;
		const privacyPolicyLink = <a href="/greece/privacy/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>;
		const showHeaderBackground = !country || !language;
		return (
			<div className={backgroundDark ? 'AppHeader' : 'AppHeaderLight'}>

				<Headroom tolerance={5} offset={200}>					
					<div className={backgroundDark ? 'app-bar' : 'app-bar-light'}>
						<div className={["app-bar-container logo", !(country && language) ? "logo-centered" : ""].join(" ")} onClick={onGoHome || noop}>
							<img onClick={onGoHome} src={backgroundDark ? logo : logoBlack} className="app-bar-logo" alt=" " />
						</div>
						{country &&
							language && (
								<div className="app-bar-container buttons">
									<div className="app-bar-buttons">
									<span className="app-bar-selectors top-menu" color="contrast" onClick={onGoHome || noop}>
											{t("Home")}
										</span>
										<span className="app-bar-selectors top-menu" color="contrast" onClick={onGoToCategories || noop}>
											{t("Blog")}
										</span>
										<span className="app-bar-selectors top-menu" color="contrast" onClick={onGoToServices || noop}>
											{t("Services")}	
										</span>
										{!disableCountrySelector && (
											<span className="app-bar-selectors" color="contrast" onClick={onChangeCountry || noop}>
												{(country && country.fields.name) || " "}
											</span>
										)}
										{!disableLanguageSelector && !disableCountrySelector && <div className="app-bar-separator" />}
										{!disableLanguageSelector && (
											<span className="app-bar-selectors" color="contrast" onClick={onChangeLanguage}>
												{language || " "}
											</span>
										)}

										<div className="app-bar-separator separator-searchIcon" />
										<IconButton
											className={`search-close ${[this.state.search && "active"].join(" ")} search-button `}
											color="contrast"
											onClick={this.toggleSearch.bind(this)}
											style={{ width: 36 }}
										/>
									</div>
								</div>
							)}
					</div>
				</Headroom>				
				{showHeaderBackground &&  <div
					style={{
						backgroundColor: "#000000",
						display: "block",
						width: "100%",
						height: 64,
					}}
				/>}
				{!showHeaderBackground &&  <div className={backgroundDark ? 'headerBackground': 'headerBackgroundLight'}></div>}
				{search && (
					<form onSubmit={this.handleSubmit.bind(this)} className="SearchBar">
						<input autoComplete="off" autoFocus name="searchText" placeholder={t("Search")} type="text" value={searchText} onChange={this.handleInputChange.bind(this)} />
						{searchText && <i className="fa fa-times-circle" onClick={() => this.setState({ searchText: "" })} />}
						<i className="fa fa-search" onClick={this.handleSubmit.bind(this)} />
					</form>
				)}
				{!this.state.prvalert && this.props.cookieBanner && (
					<div className={this.state.prvalert ? 'hidden' : 'privacy-banner'}>
						<span className="privacy-banner-separator"></span>
						<Interpolate i18nKey="COOKIES_BANNER" cookiePolicy={cookiePolicyLink} privacyPolicy={privacyPolicyLink}/>
						<Close
							className="close-alert"
							color="contrast"
							size={36}
							onClick={this.closeAlert.bind(this)}
						/>
					</div>
				)}
			</div>

		);
	}
}export default translate()(AppHeader);