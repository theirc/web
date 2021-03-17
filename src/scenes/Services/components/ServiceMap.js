// libs
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// local
import routes from '../routes';
import getSessionStorage from "../../../shared/sessionStorage";
import "./ServiceHome.css";
import HtmlMarker from "./HtmlMarker";

var tinycolor = require("tinycolor2");
let categoryStyle = color => {
	if (!color) {
		color = "#000";
	} else if (color.indexOf("#") === -1) {
		color = `#${color}`;
	}

	color = tinycolor(color)
		.saturate(30)
		.darken(10)
		.toHexString();

	return {
		color: color,
		borderColor: tinycolor(color).darken(10),
	};
};

/**
 * @class
 * @description 
 */
class ServiceIcon extends React.Component {
	render() {
		let s = this.props.service;
		let idx = this.props.idx;
		let type = this.props.type;

		return type ? (
			<div className="Icon" key={`${s.id}-${idx}`} style={{ 'fontSize': '18px' }}>
				<i className={type.icon} style={categoryStyle(type.color)} />
			</div>
		) : <div />;
	}
}

/**
 * @class
 * @description 
 */
class ServiceItem extends React.Component {

	render() {
		const { country, goToService, language, service } = this.props;
		const serviceT = service.data_i18n && service.data_i18n.filter(x => x.language === language)[0];
		const providerT = (service.provider && service.provider.data_i18n) && service.provider.data_i18n.filter(p => p.language === language)[0];
		const serviceInfo = serviceT ? serviceT : service;
		const providerInfo = providerT ? providerT : service.provider;
		const mainType = service.serviceCategories ? service.serviceCategories[0] : '';

		const types = (service.serviceCategories || []).filter(t => t.id !== mainType.id);

		return (
			<div key={service.id} className="Item" style={{ "border": "none" }} onClick={() => goToService(country, language, service.id)}>
				{mainType &&
					<ServiceIcon key={`si-${mainType.idx}`} idx={0} isMainType={1} service={service} type={mainType} />
				}

				<div className="Info" style={{ 'fontSize': '120%' }}>
					<div className="Item-content title">
						<h1>{serviceInfo.name}</h1>
					</div>

					<h2 className="Item-content">
						{providerInfo ? providerInfo.name : ''}{" "}

						<address className="fullAddress Item-content">
							{serviceInfo.address}
						</address>

						{service.address_city &&
							<address className="regionTitle Item-content">
								{service.address_city}
							</address>
						}

						<div className="Icons Item-content">
							{types.map((t, idx) => t && <ServiceIcon key={`si-${idx}`} idx={idx} isMainType={0} service={service} type={t} />)}
						</div>
					</h2>
				</div>

				<FontAwesomeIcon icon="angle-right" className="arrow" />
			</div>
		);
	}
}

/**
 * @class
 * @description 
 */
class ServiceMap extends React.Component {
	state = {
		category: {},
		services: [],
		loaded: false,
		errorMessage: null,
	};

	map = null;
	clusters = null;
	bounds = null;

	componentDidMount() {

		const {
			findServicesInLocation,
			country
		} = this.props;
		const sessionStorage = getSessionStorage();

		/*
			RR:
			Moved the map and cluster group variables to the DidMount event.

			This way we can run updates on the content of the map
		*/
		if (navigator.onLine) {
			const map = new window.google.maps.Map(document.getElementById('MapCanvas'), {
				minZoom: 3,
				center: { lat: country.fields.coordinates.lat, lng: country.fields.coordinates.lon },
				zoom: 8,
				disableDefaultUI: false,
				zoomControl: true,
				gestureHandling: "greedy",
			});

			this.setState({
				loaded: true
			});

			if (sessionStorage.serviceMapBounds) {
				const b = sessionStorage.serviceMapBounds.split(",").map(c => parseFloat(c));
				const zoom = parseInt(sessionStorage.serviceMapZoom, 10);

				map.fitBounds({
					west: b[0],
					north: b[1],
					east: b[2],
					south: b[3]
				});
				map.setZoom(zoom);
			}

			window.google.maps.event.addListener(map, 'click', () => {
				if (this.infoWindow) {
					this.infoWindow.close();
				}
			});
			findServicesInLocation([])
				.then(({
					services,
					category
				}) => {
					this.setState({
						services,
						category,
						loaded: true
					});
				})
				.catch(c => this.setState({
					errorMessage: c.message,
					category: null,
					loaded: true
				}));

			this.map = map;
		}
	}

	componentDidUpdate() {

		if (this.state.loaded) {
			if (this.state.services.length) {

				let locationServices = this.state.services.filter(s => s.latitude != null && s.longitude != null && s.status === "public");

				const markers = locationServices.map((s, index) => {
					const mainType = s.serviceCategories ? s.serviceCategories[0] : '';
					let markerDiv = ReactDOMServer.renderToString(<ServiceIcon idx={0} service={s} type={mainType} />);

					let popupEl = document.createElement("div");
					ReactDOM.render(<ServiceItem service={s} {...this.props} />, popupEl);

					let marker = new HtmlMarker(new global.google.maps.LatLng(s.latitude, s.longitude), this.map, {
						html: markerDiv
					});

					marker.addListener('click', () => {
						setTimeout(() => {
							this.infoWindow
								? this.infoWindow.setContent(popupEl)
								: this.infoWindow = new global.google.maps.InfoWindow({ content: popupEl })
							this.infoWindow.open(this.map, marker);
						}, 1);
					});

					return marker;
				});

				new window.MarkerClusterer(this.map, markers, {
					imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
				});
				window.markers = markers;
				if (markers.length) {
					let bounds = new global.google.maps.LatLngBounds();
					markers.forEach(m => {
						bounds.extend(m.getPosition());
					});
					this.map.fitBounds(bounds);
				}
			}
		}
	}

	componentWillUnmount() {
	}

	render() {
		const { loaded, errorMessage } = this.state;
		let isOnline = navigator.onLine;

		return (
			<div className="ServiceMap">
				{errorMessage && (
					<div className="Error">
						<em>{errorMessage}</em>
					</div>
				)
				}

				{isOnline &&
					<div className="ServiceMapContainer">
						{!loaded && <div className="loader" />}
						<div id="MapCanvas" style={{ width: "100%", visibility: loaded ? "visible" : "hidden" }} />
					</div>
				}

				{!isOnline &&
					<div className="ServiceMapContainer2" style={{ width: "100%", backgroundImage: "url('/images/cn-offline-map.jpg')", backgroundSize: "contain" }}>
						<div id="MapCanvas2"></div>
					</div>
				}
			</div>
		);
	}
}

const mapState = ({ country, defaultLocation, language }, p) => ({ country, defaultLocation, language });

const mapDispatch = (d, p) => ({ goToService: (country, language, id) => d(push(routes.goToService(country, language, id))) });

export default withTranslation()(connect(mapState, mapDispatch)(ServiceMap));
