import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import "./ServiceHome.css";
import {
	translate
} from "react-i18next";
import circle from "@turf/circle";
import bbox from "@turf/bbox";
import getSessionStorage from "../shared/sessionStorage";

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

/**
 *  TODO: ServiceIcon and ServiceItem could be separated into their own components for use in ServiceList
 */
class ServiceIcon extends React.Component {
	render() {
		let s = this.props.service;
		let idx = this.props.idx;
		let type = this.props.type ? this.props.type : s.type ? s.type : s.types[idx];
			
		return type ? (
			<div className="Icon" key={`${s.id}-${idx}`}>
				<i className={iconWithPrefix(type.vector_icon)} style={categoryStyle(type.color)} />
			</div>
		) : (
				<div />
			);
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
			<div className="Icons">
				{mainType &&
						<ServiceIcon key={`si-${mainType.idx}`} idx={0} isMainType={1} service={s} type={mainType} />
				}
				{types.map((t, idx) => t && <ServiceIcon key={`si-${idx}`} idx={idx} isMainType={0} service={s} type={t} />)}
			</div>
				<div className="Info">
					<h1>{s.name}</h1>
					<h2>{s.provider.name}{" "}</h2>
					<address className="fullAddress">
						{s.address}
					</address>
					{s.region.level > 1 &&
						<address className="regionTitle">
							{s.region.name}
						</address>
					}
				</div>
				<i className="material-icons" />
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
		// const {
		// 	servicesByType
		// } = this.props;
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

		const map = L.citymaps.map("MapCanvas", null, {
			scrollWheelZoom: true,
			zoomControl: true,
			// Citymaps will automatically select "global" if language is not supported or undefined.
			language: this.props.i18n.language
		});

		let clusters = L.markerClusterGroup({
			maxClusterRadius: 20, // in pixels. Decreasing this will create more, smaller clusters.
			spiderfyDistanceMultiplier: 1.5,
			spiderfyOnMaxZoom: true
		});
		map.addLayer(clusters);
		var locate = L.control.locate();
		locate.addTo(map);

		map.on("dragend", a => {
			if (findServicesInLocation) {
                /*
        This is the buggest change in the code: I changed the near to a bbox of the map.

        Whenever the user moves the map, it will reload the data in the backend
        */
				const bounds = a.target.getBounds();
				const sw = bounds.getSouthWest();
				const ne = bounds.getNorthEast();
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
					})
					.catch(c => this.setState({
						errorMessage: c.message,
						category: null,
						loaded: true
					}));
			}
		});

		map.on("moveend", function (e) {
			var bounds = map.getBounds();
			sessionStorage.serviceMapBounds = bounds.toBBoxString();
			sessionStorage.serviceMapZoom = map.getZoom();;
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
				console.log("user position");
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

	componentDidUpdate() {
		const L = window.Leaflet;
		const {
			// map,
			clusters
		} = this;
		// const {
		// 	defaultLocation,
		// 	findServicesInLocation
		// } = this.props;

		if (this.state.loaded) {
			if (this.state.services.length) {
				const markers = this.state.services.map((s, index) => {
					let ll = s.location.coordinates.slice().reverse();
					let markerDiv = ReactDOMServer.renderToString(<ServiceIcon idx={0} service={s} />);
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
					<div id="MapCanvas" style={{ width: "100%", position: "absolute", top: 64, bottom: 56, right: 0, visibility: loaded ? "visible" : "hidden" }} />
					{!loaded && <div className="loader" />}
					
				</div>
			</div>
		);
	}
}

export default translate()(ServiceMap);
