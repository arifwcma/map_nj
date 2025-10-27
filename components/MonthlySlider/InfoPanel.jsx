"use client"
import React from "react"
import NdviChart from "./NdviChart"

export default function InfoPanel({ ndvi }) {
    const {
        info,
        loading,
        chartData,
        chartOptions,
        series,
        fromMonth,
        fromYear,
        toMonth,
        toYear,
        monthNames,
        yearRange,
        setFromMonth,
        setFromYear,
        setToMonth,
        setToYear,
        showRange,
        firstLabel,
        lastLabel,
        firstVal,
        lastVal,
        diffVal,
        compareMode,
        secondInfo,
        enableCompare
    } = ndvi

    return (
        <div style={{ width: "280px", padding: "10px", borderLeft: "1px solid #ccc" }}>
            {info ? (
                <div>
                    <p><b>Month:</b> {info.label}</p>
                    <p><b>NDVI:</b> {info.ndvi !== null ? info.ndvi.toFixed(3) : "N/A"}</p>
                    <div style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "40px" }}>From</span>
                                <select value={fromMonth || ""} onChange={e => setFromMonth(parseInt(e.target.value))} style={{ flex: 1 }}>
                                    {monthNames.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                                </select>
                                <select value={fromYear || ""} onChange={e => setFromYear(parseInt(e.target.value))} style={{ flex: 1 }}>
                                    {yearRange.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "40px" }}>To</span>
                                <select value={toMonth || ""} onChange={e => setToMonth(parseInt(e.target.value))} style={{ flex: 1 }}>
                                    {monthNames.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                                </select>
                                <select value={toYear || ""} onChange={e => setToYear(parseInt(e.target.value))} style={{ flex: 1 }}>
                                    {yearRange.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div><button onClick={showRange}>Show</button></div>
                        </div>
                    </div>
                    <div style={{ height: 180 }}>
                        {loading ? <p>Loading...</p> : <NdviChart data={chartData} options={chartOptions} />}
                    </div>
                    {series.labels.length > 1 && (
                        <div style={{ marginTop: "10px" }}>
                            <p><b>Initial NDVI ({firstLabel}):</b> {firstVal?.toFixed(3) ?? "N/A"}</p>
                            <p><b>Last NDVI ({lastLabel}):</b> {lastVal?.toFixed(3) ?? "N/A"}</p>
                            <p><b>Difference:</b> {diffVal?.toFixed(3) ?? "N/A"}</p>
                        </div>
                    )}
                    <div style={{ marginTop: "10px" }}>
                        {secondInfo ? (
                            <div style={{ color: "red" }}>
                                <p>Second pixel:</p>
                                <p>Initial NDVI ({secondInfo.firstLabel}): {secondInfo.initial?.toFixed(3) ?? "N/A"}</p>
                                <p>Last NDVI ({secondInfo.lastLabel}): {secondInfo.last?.toFixed(3) ?? "N/A"}</p>
                                <p>Difference: {(secondInfo.last - secondInfo.initial)?.toFixed(3) ?? "N/A"}</p>
                            </div>
                        ) : compareMode ? (
                            <p>Click another pixel to compare</p>
                        ) : (
                            <button onClick={enableCompare}>Compare with ...</button>
                        )}
                    </div>
                </div>
            ) : (
                <p>Click a pixel to see info</p>
            )}
        </div>
    )
}
