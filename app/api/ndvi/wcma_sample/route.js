import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ee, initEarthEngine } from "@/lib/earthengine";

export async function GET(request) {
    await initEarthEngine();
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year"));
    const month = parseInt(searchParams.get("month"));
    const lat = parseFloat(searchParams.get("lat"));
    const lon = parseFloat(searchParams.get("lon"));

    if (!year || !month || isNaN(lat) || isNaN(lon))
        return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const boundaryPath = path.join(process.cwd(), "public", "data", "boundary_4326.geojson");
    const boundary = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));
    const aoi = ee.FeatureCollection(boundary);
    const point = ee.Geometry.Point([lon, lat]);

    return await new Promise((resolve) => {
        aoi.geometry().contains(point).getInfo((isInside) => {
            if (!isInside) return resolve(NextResponse.json({ inside: false, ndvi: null, lat, lon, year, month }));

            const start = ee.Date.fromYMD(year, month, 1);
            const end = start.advance(1, "month");
            const collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(aoi)
                .filterDate(start, end)
                .map((img) => img.normalizedDifference(["B8", "B4"]).rename("NDVI"));
            const mean = collection.mean().clip(aoi);
            const val = mean.sample(point, 10).first().get("NDVI");

            val.getInfo(
                (ndvi) => resolve(NextResponse.json({ inside: true, ndvi, lat, lon, year, month })),
                () => resolve(NextResponse.json({ error: "Earth Engine error" }, { status: 500 }))
            );
        });
    });
}
