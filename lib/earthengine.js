import fs from "fs";
import ee from "@google/earthengine";

let initialized = false;

export async function initEarthEngine() {
    if (initialized) return;

    const privateKey = JSON.parse(
        fs.readFileSync("sensitive_resources/service-account.json", "utf8")
    );

    await new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(privateKey, () => {
            ee.initialize(null, null, () => {
                console.log("✅ Earth Engine initialized");
                initialized = true;
                resolve();
            }, reject);
        });
    });
}

export { ee };
