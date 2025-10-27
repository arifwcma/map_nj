"use client"
import dynamic from "next/dynamic"
import React from "react"
import "leaflet/dist/leaflet.css"

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false })
const GeoJSON = dynamic(() => import("react-leaflet").then(m => m.GeoJSON), { ssr: false })

function BoundaryLayer({ data }) {
    const { useMap } = require("react-leaflet")
    const map = useMap()
    React.useEffect(() => {
        if (data) {
            const L = require("leaflet")
            const layer = new L.GeoJSON(data)
            map.fitBounds(layer.getBounds())
        }
    }, [data, map])
    return <GeoJSON data={data} style={{ color: "black", weight: 2, fillOpacity: 0 }} />
}

function ClickHandler({ onClick }) {
    const { useMap } = require("react-leaflet")
    const map = useMap()
    React.useEffect(() => {
        if (!map) return
        const handleClick = e => onClick(e.latlng)
        map.on("click", handleClick)
        return () => map.off("click", handleClick)
    }, [map, onClick])
    return null
}

export default function MapView({ ndvi }) {
    const { tileUrl, boundary, marker, secondMarker, handleMapClick } = ndvi
    return (
        <div style={{ flex: 1 }}>
            <MapContainer style={{ height: "90vh" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {tileUrl && <TileLayer url={tileUrl} opacity={0.6} />}
                {boundary && <BoundaryLayer data={boundary} />}
                {marker && <Marker position={marker}><Popup>First Pixel</Popup></Marker>}
                {secondMarker && <Marker position={secondMarker}><Popup>Second Pixel</Popup></Marker>}
                <ClickHandler onClick={handleMapClick} />
            </MapContainer>
        </div>
    )
}
