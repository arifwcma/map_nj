"use client"
import React from "react"
import useNdviData from "@/hooks/useNdviData"
import MapView from "./MapView"
import InfoPanel from "./InfoPanel"

export default function MonthlySlider() {
    const ndvi = useNdviData()
    return (
        <div>
            <h3>NDVI for {ndvi.displayLabel}</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                <button onClick={ndvi.prev} disabled={ndvi.offset === 0}>-</button>
                <input
                    type="range"
                    min="0"
                    max={ndvi.maxPast}
                    value={ndvi.offset}
                    onChange={e => ndvi.setOffset(parseInt(e.target.value))}
                    onMouseUp={ndvi.handleRelease}
                    onTouchEnd={ndvi.handleRelease}
                    style={{ width: "300px", margin: "0 10px" }}
                />
                <button onClick={ndvi.next} disabled={ndvi.offset === ndvi.maxPast}>+</button>
            </div>
            <div style={{ display: "flex", width: "100vw", overflow: "hidden" }}>
                <MapView ndvi={ndvi} />
                <InfoPanel ndvi={ndvi} />
            </div>
        </div>
    )
}
