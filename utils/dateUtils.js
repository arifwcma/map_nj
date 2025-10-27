export function getMonthYear(latestYear, latestMonth, monthsBack) {
    const now = new Date(latestYear, latestMonth - 1, 1)
    now.setMonth(now.getMonth() - monthsBack)
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        label: now.toLocaleString("default", { month: "short", year: "numeric" })
    }
}

export function generateMonthsBetween(startYear, startMonth, endYear, endMonth) {
    const start = new Date(startYear, startMonth - 1, 1)
    const end = new Date(endYear, endMonth - 1, 1)
    const arr = []
    while (start <= end) {
        arr.push({
            year: start.getFullYear(),
            month: start.getMonth() + 1,
            label: start.toLocaleString("default", { month: "short", year: "numeric" })
        })
        start.setMonth(start.getMonth() + 1)
    }
    return arr
}
