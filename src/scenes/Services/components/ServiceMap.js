// libs
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import { translate } from "react-i18next";
import circle from "@turf/circle";
import bbox from "@turf/bbox";

// local
import getSessionStorage from "../../../shared/sessionStorage";
import "./ServiceHome.css";

var tinycolor = require("tinycolor2");
let iconWithPrefix = vector_icon => vector_icon.split("-")[0] + " " + vector_icon;
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

class ServiceIcon extends React.Component {
	render() {
		let s = this.props.service;
		let idx = this.props.idx;
		let type = this.props.type;

		return type ? (
			<div className="Icon" key={`${s.id}-${idx}`}>
				<i className={iconWithPrefix(type.vector_icon)} style={categoryStyle(type.color)} />
			</div>
		) : <div />;
	}
}

class ServiceItem extends React.Component {

	render() {
		const s = this.props.service;
		const {
			goToService,
			// measureDistance
		} = this.props;
		// const distance = measureDistance && s.location && measureDistance(s.location);
		const mainType = s.type ? s.type : s.types[0];

		const types = (s.types || []).filter(t => t.id !== mainType.id);

		return (
			<div key={s.id} className="Item" onClick={() => goToService(s.id)}>
				<div className="Info">
					<div className="Item-content title">
						<h1>{s.name}</h1>
						<i className="material-icons" id="goToServiceIcon" />
					</div>

					<h2 className="Item-content">{s.provider.name}{" "}</h2>

					<address className="fullAddress Item-content">
						{s.address}
					</address>

					{s.address_city &&
						<address className="regionTitle Item-content">
							{s.address_city}
						</address>
					}
				</div>

				<div className="Icons Item-content">
					{mainType &&
						<ServiceIcon key={`si-${mainType.idx}`} idx={0} isMainType={1} service={s} type={mainType} />
					}

					{types.map((t, idx) => t && <ServiceIcon key={`si-${idx}`} idx={idx} isMainType={0} service={s} type={t} />)}
				</div>
			</div>
		);
	}
}

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

	findUsersPosition(def) {
		/// Copied it over from the services Component because web apis are fair game in html component
		/// NB: there are no rules against it that I know of, but I can be wrong.
		/// - RR
		return new Promise((res, rej) => {
			// const rejectMe = () => rej({
			// 	message: "Unable to determine position"
			// });

			if (!navigator.geolocation) {
				res(def);
			}

			navigator.geolocation.getCurrentPosition(
				p => {
					const {
						latitude,
						longitude
					} = p.coords;
					if (latitude && longitude) {
						res({
							latitude,
							longitude
						});
					} else {
						res(def);
					}
				},
				e => {
					res(def);
				}
			);
		});
	}

	componentDidMount() {
		const L = window.Leaflet;
		const {
			defaultLocation,
			findServicesInLocation
		} = this.props;
		const sessionStorage = getSessionStorage();

		/*
			RR:
			Moved the map and cluster group variables to the DidMount event.

			This way we can run updates on the content of the map
		*/
		if (navigator.onLine) {
			const map = L.citymaps.map("MapCanvas", null, {
				scrollWheelZoom: true,
				zoomControl: true,
				// Citymaps will automatically select "global" if language is not supported or undefined.
				language: this.props.i18n.language,
				worldCopyJump: true
			});

			let clusters = L.markerClusterGroup({
				maxClusterRadius: 20, // in pixels. Decreasing this will create more, smaller clusters.
				spiderfyDistanceMultiplier: 1.5,
				spiderfyOnMaxZoom: true
			});
			map.addLayer(clusters);
			// var locate = L.control.locate();
			// locate.addTo(map);

			if (sessionStorage.serviceMapBounds) {
				const b = sessionStorage.serviceMapBounds.split(",").map(c => parseFloat(c));
				const zoom = sessionStorage.serviceMapZoom;

				map.fitBounds([
					[b[1], b[0]],
					[b[3], b[2]]
				]);
				map.setZoom(zoom);

				setTimeout(() => {
					map.invalidateSize();
				}, 500);
			}

			map.on("dragend", a => {
				if (findServicesInLocation && this.state.services.length === 0) {
					/*
			This is the buggest change in the code: I changed the near to a bbox of the map.

			Whenever the user moves the map, it will reload the data in the backend
			*/
					let bounds = a.target.getBounds();
					let sw = bounds.getSouthWest();
					let ne = bounds.getNorthEast();

					if (sw.lat - ne.lat === 0 || sw.lng - ne.lng === 0) {
						const b = sessionStorage.serviceMapBounds.split(",").map(c => parseFloat(c));
						let p1 = L.latLng(b[1], b[0]);
						let p2 = L.latLng(b[3], b[2]);
						bounds = L.latLngBounds(p1, p2);
						sw = bounds.getSouthWest();
						ne = bounds.getNorthEast();
					}

					findServicesInLocation([sw.lng, sw.lat, ne.lng, ne.lat])
						.then(({
							services,
							category
						}) => {
							this.setState({
								services,
								category,
								loaded: true
							});
							map.invalidateSize();
						})
						.catch(c => this.setState({
							errorMessage: c.message,
							category: null,
							loaded: true
						}));
					if (this.map) {
						this.map.fitBounds(bounds);
					}
				}
			});

			map.on("moveend", function (e) {
				var bounds = map.getBounds();
				const sw = bounds.getSouthWest();
				const ne = bounds.getNorthEast();

				if (sw.lat - ne.lat !== 0 && sw.lng - ne.lng !== 0) {
					sessionStorage.serviceMapBounds = bounds.toBBoxString();
					sessionStorage.serviceMapZoom = map.getZoom();
				}
			});

			/*
				We try to get the user's position first, if that doesn't work, we use the key coordinate for the country
				Then we make a circle of 100k radius around that point, get the box around it and call it the bounds for the screen.
			*/
			if (sessionStorage.serviceMapBounds) {
				const b = sessionStorage.serviceMapBounds.split(",").map(c => parseFloat(c));
				const zoom = sessionStorage.serviceMapZoom;

				map.fitBounds([
					[b[1], b[0]],
					[b[3], b[2]]
				]);
				map.setZoom(zoom);
				map.fire("dragend");
			} else {
				this.findUsersPosition(defaultLocation).then(l => {
					var center = [l.longitude, l.latitude];
					var radius = 100;
					var options = {
						units: "kilometers"
					};
					var c = circle(center, radius, null, null, options);
					var b = bbox(c);
					map.fitBounds([
						[b[1], b[0]],
						[b[3], b[2]]
					]);
					map.fire("dragend");
				});
			}

			this.clusters = clusters;
			this.map = map;
		}
	}

	componentDidUpdate() {
		const L = window.Leaflet;
		const {
			// map,
			clusters
		} = this;
		let keepPreviousZoom = this.props.keepPreviousZoom;

		if (this.state.loaded) {
			if (this.state.services.length) {
				let locationServices = this.state.services.filter(s => s.location != null);

				const markers = locationServices.map((s, index) => {
					let ll = s.location.coordinates.slice().reverse();
					const mainType = s.type ? s.type : s.types[0];
					let markerDiv = ReactDOMServer.renderToString(<ServiceIcon idx={0} service={s} type={mainType} />);
					let icon = L.divIcon({
						html: markerDiv,
						iconAnchor: [20, 20],
						popupAnchor: [0, -16],
					});
					let marker = L.marker(ll, {
						title: s.name,
						icon: icon
					});

					let popupEl = document.createElement("div");
					ReactDOM.render(<ServiceItem service={s} {...this.props} />, popupEl);
					let popup = L.popup({
						closeButton: false
					}).setContent(popupEl);
					marker.bindPopup(popup);

					return marker;
				});

				clusters.clearLayers();
				clusters.addLayers(markers);

				if (!keepPreviousZoom) {
					let group = new L.featureGroup(markers);
					this.map.fitBounds(group.getBounds());
				}
			} else {
				console.warn("no services returned");
			}
		}
	}

	componentWillUnmount() {
		// Cleaning up.
		this.map.off();
		this.map.remove();
	}

	render() {
		const {
			loaded,
			errorMessage
		} = this.state;
		let isOnline = navigator.onLine;
		// let isMobile = document.documentElement.clientWidth < 1000;
		//let image = isMobile ? "url(/images/cn-offline-map-mobile.png)" : "url(/images/cn-offline-map.png)"
		/*
			Very small tweak on the render. toggling the visibility so we can run the L.map on didMount
		*/

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
					<div className="ServiceMapContainer2" style={{ width: "100%", backgroundImage: "url('/images/cn-offline-map.png')", backgroundSize: "contain" }}>
						<div id="MapCanvas2"></div>
					</div>
				}
			</div>
		);
	}
}

export default translate()(ServiceMap);