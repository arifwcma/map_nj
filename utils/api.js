import { generateMonthsBetween } from "./dateUtils"

const base = process.env.NEXT_PUBLIC_BASE_URL

export async function fetchImageCount(year, month) {
    const res = await fetch(`${base}/ndvi/count_images?year=${year}&month=${month}`)
    const d = await res.json()
    if (d.count >= 100) return { yy: year, mm: month }
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    return fetchImageCount(prevYear, prevMonth)
}

export async function fetchNdviTile(year, month) {
    const res = await fetch(`${base}/ndvi/wcma_monthly?year=${year}&month=${month}`)
    const d = await res.json()
    return d.tileUrl
}

export async function fetchNdviSample(year, month, lat, lon) {
    const res = await fetch(`${base}/ndvi/wcma_sample?year=${year}&month=${month}&lat=${lat}&lon=${lon}`)
    return res.json()
}

export async function fetchRangeSamples(lat, lon, fy, fm, ty, tm, isSecond, setSeries, setInfo) {
    const items = generateMonthsBetween(fy, fm, ty, tm)
    const urls = items.map(it =>
        fetch(`${base}/ndvi/wcma_sample?year=${it.year}&month=${it.month}&lat=${lat}&lon=${lon}`)
            .then(r => r.json())
            .catch(() => ({ ndvi: null, inside: false }))
    )
    const res = await Promise.all(urls)
    const labels = items.map(it => it.label)
    const data = res.map(x => (x && x.inside && x.ndvi !== null ? x.ndvi : null))
    setSeries({ labels, data })
    if (isSecond) {
        setInfo({
            initial: data[0] ?? null,
            last: data.at(-1) ?? null,
            firstLabel: labels[0] ?? "",
            lastLabel: labels.at(-1) ?? ""
        })
    }
}
