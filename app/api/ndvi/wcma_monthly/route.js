import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ee, initEarthEngine } from "@/lib/earthengine";
import { BOUNDARY_FILE } from "@/lib/boundaryConfig"

export async function GET(request) {
    await initEarthEngine();
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year"));
    const month = parseInt(searchParams.get("month"));

    if (!year || !month)
        return NextResponse.json({ error: "Missing year or month" }, { status: 400 });

    const boundaryPath = path.join(process.cwd(), "public", "data", BOUNDARY_FILE);
    const boundary = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));
    const aoi = ee.FeatureCollection(boundary);

    const start = ee.Date.fromYMD(year, month, 1);
    const end = start.advance(1, "month");

    const collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(aoi)
        .filterDate(start, end)
        .map(img => img.normalizedDifference(["B8", "B4"]).rename("NDVI"));

    return await new Promise((resolve) => {
        collection.size().getInfo(() => {
            const mean = collection.mean().clip(aoi);
            const vis = { min: -1, max: 1, palette: ["blue", "white", "yellow", "green", "darkgreen"] };

            mean.getMap(vis, (mapObj, err) => {
                if (err) return resolve(NextResponse.json({ error: "Map error" }, { status: 500 }));
                const tileUrl = `https://earthengine.googleapis.com/v1/${mapObj.mapid}/tiles/{z}/{x}/{y}`;
                resolve(NextResponse.json({ tileUrl, year, month }));
            });
        });
    });
}
