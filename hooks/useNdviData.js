"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { getMonthYear, generateMonthsBetween } from "@/utils/dateUtils"
import { fetchNdviTile, fetchNdviSample, fetchRangeSamples, fetchImageCount } from "@/utils/api"

export default function useNdviData() {
    const maxPast = 72
    const [tileUrl, setTileUrl] = useState(null)
    const [boundary, setBoundary] = useState(null)
    const [offset, setOffset] = useState(maxPast)
    const [info, setInfo] = useState(null)
    const [marker, setMarker] = useState(null)
    const [label, setLabel] = useState("")
    const [series, setSeries] = useState({ labels: [], data: [] })
    const [fromMonth, setFromMonth] = useState(null)
    const [fromYear, setFromYear] = useState(null)
    const [toMonth, setToMonth] = useState(null)
    const [toYear, setToYear] = useState(null)
    const [loading, setLoading] = useState(false)
    const displayLabel = loading ? `${label} is loading ...` : label
    const [compareMode, setCompareMode] = useState(false)
    const [secondMarker, setSecondMarker] = useState(null)
    const [secondSeries, setSecondSeries] = useState({ labels: [], data: [] })
    const [secondInfo, setSecondInfo] = useState(null)
    const [latestYear, setLatestYear] = useState(new Date().getFullYear())
    const [latestMonth, setLatestMonth] = useState(new Date().getMonth() + 1)
    const debounceRef = useRef(null)
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const yearRange = []
    const thisYear = new Date().getFullYear()
    for (let y = 2019; y <= thisYear; y++) yearRange.push(y)


    const fetchNdvi = useCallback(async (monthsBack) => {

        setLoading(true)
        const { year, month, label } = getMonthYear(latestYear, latestMonth, monthsBack)
        setLabel(label)
        if (marker) await fetchRangeSamples(marker.lat, marker.lng, fromYear, fromMonth, toYear, toMonth, false, setSeries, setInfo)
        const tile = await fetchNdviTile(year, month)
        setTileUrl(tile)
        setLoading(false)
    }, [marker, fromYear, fromMonth, toYear, toMonth, latestYear, latestMonth])

    useEffect(() => {
        const now = new Date()
        const y = now.getFullYear()
        const m = now.getMonth() + 1
        fetchImageCount(y, m).then(({ yy, mm }) => {
            setLatestYear(yy)
            setLatestMonth(mm)
            scheduleNdvi(0)
            fetch("/data/boundary_4326.geojson").then(res => res.json()).then(setBoundary)
        })
    }, [fetchNdvi])

    const scheduleNdvi = useCallback((monthsBack) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => fetchNdvi(monthsBack), 500)
    }, [fetchNdvi])

    const handleRelease = () => {
        scheduleNdvi(maxPast - offset)
        if (secondMarker) fetchRangeSamples(secondMarker.lat, secondMarker.lng, fromYear, fromMonth, toYear, toMonth, true, setSecondSeries, setSecondInfo)
    }

    const handleMapClick = async (latlng) => {
        const { year, month, label } = getMonthYear(latestYear, latestMonth, maxPast - offset)
        const data = await fetchNdviSample(year, month, latlng.lat, latlng.lng)
        if (!data.inside) return
        if (compareMode && !secondMarker) {
            setSecondMarker(latlng)
            fetchRangeSamples(latlng.lat, latlng.lng, fromYear, fromMonth, toYear, toMonth, true, setSecondSeries, setSecondInfo)
            setCompareMode(false)
        } else {
            setMarker(latlng)
            setInfo({ ...data, label })
            fetchRangeSamples(latlng.lat, latlng.lng, fromYear, fromMonth, toYear, toMonth, false, setSeries, setInfo)
            setSecondMarker(null)
            setSecondSeries({ labels: [], data: [] })
            setSecondInfo(null)
            setCompareMode(false)
        }
    }

    const showRange = () => {
        if (marker) {
            fetchRangeSamples(marker.lat, marker.lng, fromYear, fromMonth, toYear, toMonth, false, setSeries, setInfo)
            if (secondMarker) fetchRangeSamples(secondMarker.lat, secondMarker.lng, fromYear, fromMonth, toYear, toMonth, true, setSecondSeries, setSecondInfo)
        }
    }

    const prev = () => {
        const newVal = Math.max(0, offset - 1)
        setOffset(newVal)
        scheduleNdvi(maxPast - newVal)
    }

    const next = () => {
        const newVal = Math.min(maxPast, offset + 1)
        setOffset(newVal)
        scheduleNdvi(maxPast - newVal)
    }

    const firstVal = series.data[0] ?? null
    const lastVal = series.data.at(-1) ?? null
    const diffVal = firstVal !== null && lastVal !== null ? lastVal - firstVal : null
    const firstLabel = series.labels[0] ?? ""
    const lastLabel = series.labels.at(-1) ?? ""

    const chartData = {
        labels: series.labels,
        datasets: [
            {
                label: "NDVI",
                data: series.data,
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.2,
                borderColor: "#00589c",
                backgroundColor: "#00589c"
            },
            ...(secondSeries.data.length
                ? [{
                    label: "NDVI (Second Pixel)",
                    data: secondSeries.data,
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.2,
                    borderColor: "red",
                    backgroundColor: "red"
                }]
                : [])
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: -1, max: 1 } },
        plugins: { legend: { display: true }, title: { display: false } }
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    return {
        maxPast,
        offset,
        setOffset,
        prev,
        next,
        handleRelease,
        handleMapClick,
        enableCompare: () => setCompareMode(true),
        compareMode,
        tileUrl,
        boundary,
        label,
        displayLabel,
        info,
        loading,
        series,
        chartData,
        chartOptions,
        monthNames,
        yearRange,
        fromMonth,
        fromYear,
        toMonth,
        toYear,
        setFromMonth,
        setFromYear,
        setToMonth,
        setToYear,
        showRange,
        firstVal,
        lastVal,
        diffVal,
        firstLabel,
        lastLabel,
        secondMarker,
        secondSeries,
        secondInfo
    }
}
