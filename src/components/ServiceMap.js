import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import "./ServiceHome.css";
import { translate } from "react-i18next";

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
    let firstType = s.types[0];
    return (
      <div className="Icon" key={`${s.id}-${idx}`}>
        <i className={ iconWithPrefix(firstType.vector_icon) } style={ categoryStyle(firstType.color) } />
      </div>
    );
  }
}

class ServiceItem	extends React.Component {
  render() {
    const s = this.props.service;
    const { goToService, measureDistance } = this.props;
    const distance = measureDistance && s.location && measureDistance(s.location);

    return (
      <div key={s.id} className="Item" onClick={() => goToService(s.id)}>
        <div className="Icons">
          { s.types.map((t, idx) => <ServiceIcon idx={ idx } service={ s } />) }
        </div>
        <div className="Info">
          <h1>{s.name}</h1>
          <h2>
            {s.provider.name}{" "}
            <small>
              {s.region.title}
              {distance && ` - ${distance}`}
            </small>
          </h2>
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
	
	componentDidMount() {
		const { servicesByType } = this.props;
		if (servicesByType) {
			servicesByType()
				.then(({ services, category }) => this.setState({ services, category, loaded: true }))
				.catch(c => this.setState({ errorMessage: c.message, category: null, loaded: true }));
		}
	}

	componentDidUpdate() {
	  let L = window.Leaflet;
	  if(this.state.loaded) {
      let map = L.citymaps.map('MapCanvas', null, {
        scrollWheelZoom: true,
        zoomControl: true
      });

      if (this.state.services.length) {
        let clusters = L.markerClusterGroup();
        this.state.services.forEach((s, index) => {
          let ll = s.location.coordinates.slice().reverse();
          let markerDiv = ReactDOMServer.renderToString(<ServiceIcon idx={ index } service={ s } />)
          console.log(markerDiv);
          let icon = L.divIcon({
            html: markerDiv,
            iconAnchor: [20, 20],
            popupAnchor: [0, -16]
          });
          let marker = L.marker(ll, { title: s.name, icon: icon });
          clusters.addLayer(marker);
          let popupEl = document.createElement('div');
          ReactDOM.render(
            <ServiceItem service={ s }  { ...this.props } />,
            popupEl
          );
          let popup = L.popup({ closeButton: false }).setContent(popupEl);
          marker.bindPopup(popup);
        });
        map.addLayer(clusters);
        map.fitBounds(clusters.getBounds());
      } else {
        console.warn("no services returned");
      }
    }
	}

	render() {
		const { loaded, errorMessage } = this.state;

		return (
			<div className="ServiceMap">
				{errorMessage && (
					<div className="Error">
						<em>{errorMessage}</em>
					</div>
				)}
				
				<div className="ServiceMapContainer">
				{ loaded ? (
				  <div id="MapCanvas" style={{ width: "100%", position: "absolute", top: 64, bottom: 56 }}></div>
				) : (
				  <div className="loader" />
				) }
				</div>
			</div>
		);
	}
}

export default translate()(ServiceMap);
