import React, { Component } from "react";
import { IconButton } from "material-ui";
import Headroom from "react-headrooms";
import PropTypes from "prop-types";
import { translate, Interpolate } from "react-i18next";
import { Close } from "material-ui-icons";
import "./AppHeader.css";

class AppHeader extends Component {
	static propTypes = {
		onChangeCountry: PropTypes.func,
		onGoToSearch: PropTypes.func,
		onGoHome: PropTypes.func,
		country: PropTypes.object,
		language: PropTypes.string,
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
		const { onChangeCountry, onChangeLanguage, disableLanguageSelector, disableCountrySelector, onGoHome, country, language, t, serbiaBanner } = this.props;
		const { search, searchText } = this.state;
		const noop = () => {
			console.log("noop");
		};
		const cookiePolicyLink = <a href="/greece/privacy/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a>;
		const privacyPolicyLink = <a href="/greece/privacy/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>;
		return (
			<div className="AppHeader">

				<Headroom tolerance={5} offset={200}>
					<div className="app-bar">
						<div className={["app-bar-container logo", !(country && language) ? "logo-centered" : ""].join(" ")} onClick={onGoHome || noop}>
							<img onClick={onGoHome} src={this.props.logo || "/logo.svg"} className="app-bar-logo" alt=" " />
						</div>
						{country &&
							language && (
								<div className="app-bar-container buttons">
									<div className="app-bar-buttons">
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

										<div className="app-bar-separator" />
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
				<div
					style={{
						backgroundColor: "#000000",
						display: "block",
						width: "100%",
						height: 64,
					}}
				/>
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
				{serbiaBanner &&(
					<div className='serbia-banner'>
						<span className="serbia-banner-separator"></span>
						<p>{t("SERBIA_BANNER")}</p>
					</div>
				)}
			</div>

		);
	}
}

export default translate()(AppHeader);
