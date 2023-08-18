import { useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  FeatureGroup,
  Circle,
  Polygon,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { Icon, MarkerCluster, divIcon, marker, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "./App.css";

import { v4 as uuidv4 } from "uuid";
const id = uuidv4();

export const icons = [
  new Icon({
    iconUrl: "/radio-tower.svg",
    iconSize: [30, 30], // size of the icon
  }),
  new Icon({
    iconUrl: "/brain-circuit.svg",
    iconSize: [30, 30], // size of the icon
  }),
];





function App() {
  //polygon states
  const [modalVisible, setModalVisible] = useState(false);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [showPolygons, setShowPolygons] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [showEditPoligon, setShowEditPoligon] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);
  
  
  
  //marker states
  const [activeMarker, setActiveMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [geocode, setGeocode] = useState([]);




  // Manejar el clic en el polígono
  const handleLayerClick = (layer) => {
    setSelectedLayer(layer);
    setShowEditPoligon(true);
    console.log("click work");
  };


  const handleLayerCreate = async (event) => {
    const { layerType, layer } = event;

    console.log(layer)

    if (layerType === "polygon") {
      const coords = layer
        .getLatLngs()[0]
        .map((latLng) => [latLng.lat, latLng.lng]);
      setPolygonCoords(coords);

      try {
        const newPolygon = await addPolygonToDatabase(coords);

        setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
      } catch (error) {
        console.error("Error al agregar el polígono:", error);
      }


    } else if (layerType === "marker") {
      // console.log(layer)
      setActiveMarker(layer);
      setModalVisible(true);

      const { lat, lng } = layer._latlng;
      const coord = [lat, lng];
      console.log(coord);
      setGeocode(coord);
    }
  };

  const handleTogglePolygons = async () => {
    if (!showPolygons) {
      const response = await fetch("http://localhost:3000/capas");
      const data = await response.json();
      setPolygons(data);
    } else {
      setPolygons([]);
    }

    setShowPolygons(!showPolygons);
  };

  const addPolygonToDatabase = async (coords) => {
    try {
      const response = await fetch("http://localhost:3000/capas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: { id },
          name: "nueva capa by post",
          description: "new capa by post",
          coordenadas: coords,
          fillColor: "blue",
        }),
      });
      if (!response.ok) {
        throw new Error("Error al agregar el polígono a la base de datos");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateLayer = (newData) => {
    fetch(`http://localhost:3000/capas/${selectedLayer.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setShowEditPoligon(false); // Cierra el modal después de actualizar
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectIcon = async (icon) => {
    setSelectedIcon(icon);
    if (activeMarker) {
      activeMarker.setIcon(icon);
    }

    try {
      const newMarker = await addMarkerToDatabase(geocode);
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    } catch (error) {
      console.error("Error al agregar el marcador:", error);
    }

    setModalVisible(false);
  };

  const addMarkerToDatabase = async (coords) => {
    try {
      const response = await fetch("http://localhost:3000/elementos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "1232132",
          geocode: coords,
          popUp: "test",
          key_relacionada_capa: 1,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al agregar el marcador a la base de datos");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleToggleMarkers = async () => {
    if (!showMarkers) {
      // Si los marcadores no se muestran, haz el fetch
      const response = await fetch("http://localhost:3000/capas/1/elementos");
      const data = await response.json();
      console.log(data);
      setMarkers(data);
    } else {
      // Si los polígonos ya se muestran, borra los datos
      setMarkers([]);
    }
    // Cambia el estado para mostrar u ocultar polígonos
    setShowMarkers(!showMarkers);
  };

  //icon por default
  const torreIcon = new Icon({
    iconUrl: "/radio-tower.svg",
    iconSize: [30, 30], // size of the icon
  });

  const circuitIcon = new Icon({
    iconUrl: "/brain-circuit.svg",
    iconSize: [30, 30], // size of the icon
  });


  return (
    <div className="container-main">
      <button onClick={handleTogglePolygons}>
        {showPolygons ? "Ocultar Polígonos" : "Mostrar Polígonos"}
      </button>
      <button onClick={handleToggleMarkers}>
        {showMarkers ? "Ocultar Marcadores" : "Mostrar Marcadores"}
      </button>

      <MapContainer center={[-26.534758, -59.343242]} zoom={14}>
        <TileLayer
          attribution="Stadia.AlidadeSmoothDark
        "
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            draw={{
              rectangle: {
                shapeOptions: {
                  color: "#07073e",
                  fillColor: "#d10f2cb7",
                },
              },
            }}
            onCreated={handleLayerCreate}
          />
          {/* Circulo marcado de inicio */}
          {/* <Circle center={[-26.535838, -59.343217]} radius={200}  /> */}
          {showPolygons &&
            polygons.length > 0 &&
            polygons.map((polygon) =>
              polygon.coordenadas ? (
                <Polygon
                  className="test"
                  key={polygon.id}
                  positions={polygon.coordenadas}
                  // fillColor={polygon.fillColor}
                  color={polygon.fillColor}
                  fillColor={polygon.fillColor}
                  eventHandlers={{
                    click: () => {
                      handleLayerClick(polygon);
                    },
                  }}
                  // onClick={() => handleLayerClick(polygon)}
                  // onClick={() => handlePolygonClick(polygon.id)}
                >
                  <Tooltip>
                    <div className="modalIcon">
                      <p>name: {polygon.name}</p>
                      <p>id: {polygon.id}</p>
                    </div>
                  </Tooltip>
                </Polygon>
              ) : null
            )}
          {showEditPoligon && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "400px",
                height: "400px",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "60000",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <input
                  type="text"
                  value={selectedLayer.name}
                  onChange={(e) =>
                    setSelectedLayer({ ...selectedLayer, name: e.target.value })
                  }
                />

                <span
                  style={{ display: "flex", gap: "3px", alignItems: "center" }}
                >
                  <h3>Color capa: </h3>
                  <input
                    placeholder="color"
                    type="color"
                    value={selectedLayer.fillColor}
                    onChange={(e) =>
                      setSelectedLayer({
                        ...selectedLayer,
                        fillColor: e.target.value,
                      })
                    }
                  />
                </span>
                {/* ... otros campos ... */}
                <button onClick={() => updateLayer(selectedLayer)}>
                  Guardar cambios
                </button>
              </div>
            </div>
          )}
        </FeatureGroup>

        <MarkerClusterGroup
          chunkedLoading //performance
        >
          {markers.length > 0 &&
            markers.map((i) => (
              <Marker
                key={i.id}
                position={i.geocode}
                icon={i.iconUrl === "antena" ? torreIcon : circuitIcon}
              >
                <Popup>
                  <div className="modalIcon">{i.popUp}</div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>

      {modalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "400px",
            height: "400px",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "60000",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h2>Selecciona un icono</h2>
            {icons.map((icon, index) => (
              <button key={index} onClick={() => handleSelectIcon(icon)}>
                Icono {index + 1}
              </button>
            ))}
            <button onClick={handleCloseModal}>Cancelar</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <button onClick={() => handleColorChange("#FF0000")}>Rojo</button>
          <button onClick={() => handleColorChange("#00FF00")}>Verde</button>
          <button onClick={() => handleColorChange("#0000FF")}>Azul</button>
        </div>
      )}
      <pre>{JSON.stringify(polygonCoords, null, 2)}</pre>
    </div>
  );
}

export default App;
