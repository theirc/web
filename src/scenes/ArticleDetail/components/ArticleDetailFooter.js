// libs
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// local
import "./ArticleDetailFooter.css";

const NS = { ns: 'ArticleDetail' };

/**
 * @class
 * @description 
 */
class ArticleDetailFooter extends Component {
	static propTypes = {
		onNavigateTo: PropTypes.func,
		country: PropTypes.object,
		direction: PropTypes.string,
		match: PropTypes.shape({
			pathName: PropTypes.string,
		}),
		previous: PropTypes.shape({
			slug: PropTypes.string,
			title: PropTypes.string,
		}),
		next: PropTypes.shape({
			slug: PropTypes.string,
			title: PropTypes.string,
		}),
	};

	constructor(props) {
		super(props);
		const { language } = this.props;
		let copySlug = "";
		
		if (window.location.toString().indexOf("language=") > -1) {
			copySlug = window.location;
		} else {
			copySlug = (window.location += (window.location.toString().indexOf("?") > -1 ? "&" : "?") + "language=" + language);
		}

		this.state = { value: copySlug, copied: true, shareIN: true };
		this.sharePage = this.sharePage.bind(this);
		this.Copiedlnk = this.Copiedlnk.bind(this);
	}

	sharePage() {
		this.setState(prevState => ({ shareIN: false }));
	}

	Copiedlnk() {
		navigator.clipboard.writeText(document.location.href)

		this.setState(prevState => ({ copied: !prevState.copied }));
		setTimeout(() => {
			this.setState({ shareIN: true });
			setTimeout(() => {
				this.setState(prevState => ({ copied: !prevState.copied }));
			}, 2);
		}, 3000);
	}

	render() {
		const { category, country, previous, next, onNavigateTo, direction, t } = this.props;
		const rtl = direction === "rtl";
		
		return ((previous || next) &&
		<div className="ArticleDetailFooter">
				{category.fields.slug === 'emergencia-por-coronavirus' &&
					<div className='subscription'>
						{t('subscribe-title', NS)}
						<a href={`/${country.fields.slug}/subscribe/${category.fields.slug}`}>{t('subscribe', NS)}</a>
					</div>
				}
				<div className='nav'>
					{previous && (
						<div className="page-selector prev" onClick={() => onNavigateTo(previous.fields.slug)}>
							{!rtl ? <FontAwesomeIcon icon="chevron-left" className="icon" /> : <FontAwesomeIcon icon="chevron-right" className="icon" />}

							<div className='caption'>
								<h1>{previous.fields.title}</h1>
							</div>
						</div>
					)}

					{next && (
						<div className="page-selector next" onClick={() => onNavigateTo(next.fields.slug)}>
							<div className='caption'>
								<h1>{next.fields.title}</h1>
							</div>

							{!rtl ? <FontAwesomeIcon icon="chevron-right" className="icon" /> : <FontAwesomeIcon icon="chevron-left" className="icon" />}
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default withTranslation()(ArticleDetailFooter);
