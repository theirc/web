// libs
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import { translate } from "react-i18next";
import { connect } from "react-redux";
import { push } from "react-router-redux";

// local
import routes from '../routes';
import "./ServiceHome.css";
import getSessionStorage from "../../../shared/sessionStorage";
import HtmlMarker from "./HtmlMarker";

var tinycolor = require("tinycolor2");
let iconWithPrefix = vector_icon => vector_icon.indexOf('icon') > -1 ?
	`${vector_icon.split('-')[0]} ${vector_icon}` :
	`fa fa-${vector_icon}`;
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
		const { service, idx, type } = this.props;
		return type ? (
			<div className="Icon" key={`${service.id}-${idx}`} style={{ 'fontSize': '18px' }}>
				<i className={iconWithPrefix(type.icon)} style={categoryStyle(type.color)} />
			</div>
		) : (
				<div />
			);
	}
}

/**
 * @class
 * @description 
 */
class ServiceItem extends React.Component {
	render() {
		const { country, goToService, language, service } = this.props;
		const mainType = service.serviceCategories ? service.serviceCategories[0] : '';
		const types = (service.serviceCategories || []).filter(t => t.id !== mainType.id);

		return (
			<div key={service.id} className="Item" style={{ "border": "none" }} onClick={() => goToService(country, language, service.id)}>
				{mainType &&
					<ServiceIcon key={`si-${mainType.idx}`} idx={0} isMainType={1} service={service} type={mainType} />
				}

				<div className="Info" style={{ 'fontSize': '120%' }}>
					<div className="Item-content title">
						<h1>{service.name}</h1>
					</div>

					<h2 className="Item-content">
						{service.provider ? service.provider.name : ''}{" "}

						<address className="fullAddress Item-content">
							{service.address}
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

				<i className="material-icons arrow" id="goToServiceIcon" />
			</div>
		);
	}
}

/**
 * @class
 * @description 
 */
class ServiceMapDesktop extends React.Component {
	state = {
		loaded: false,
		errorMessage: null,
	};

	map = null;
	clusters = null;
	bounds = null;

	componentDidMount() {
		const {
			defaultLocation,
			services
		} = this.props;

		const sessionStorage = getSessionStorage();

		if (navigator.onLine) {
			let isMap = window.google;
			const map = new window.google.maps.Map(document.getElementById('MapCanvas'), {
				minZoom: 3,
				center: { lat: 4.6403306, lng: -74.0430238 },
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
			this.map = map;

		}
	}

	componentDidUpdate() {

		if (this.state.loaded) {
			if (this.props.services.length) {

				let locationServices = this.props.services.filter(s => s.latitude != null && s.longitude != null && s.status === "public");

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
		const {
			loaded,
			errorMessage
		} = this.state;

		/*
			Very small tweak on the render. toggling the visibility so we can run the L.map on didMount
		*/

		return (
			<div className="ServiceMap">
				{errorMessage && (
					<div className="Error">
						<em>{errorMessage}</em>
					</div>
				)}
				<div className="ServiceMapContainer">
					<div id="MapCanvas" style={{ width: "100%", position: "relative", height: 500, visibility: loaded ? "visible" : "hidden" }} />
					{!loaded && <div className="loader" />}
				</div>
			</div>
		);
	}
}

const mapState = ({ country, language }, p) => ({ country, language });

const mapDispatch = (d, p) => ({ goToService: (country, language, id) => d(push(routes.goToService(country, language, id))) });

export default translate()(connect(mapState, mapDispatch)(ServiceMapDesktop));
