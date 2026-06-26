import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define paths
const songsPath = path.join(process.cwd(), 'src', 'data', 'lyrics_db_part1_fast.json');
const adsPath = path.join(process.cwd(), 'src', 'data', 'ads.json');

// Helper function to read/write
const readJSON = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
};

export async function GET() {
    // Get Ads Data for Frontend
    const ads = readJSON(adsPath) || { showAds: false, headerAd: "", sidebarAd: "" };
    return NextResponse.json(ads);
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { action, id, newData, adData } = body;

        // --- SONG ACTIONS ---
        if (['CREATE', 'UPDATE', 'DELETE'].includes(action)) {
            let songs = readJSON(songsPath) || [];

            if (action === 'CREATE') {
                // Add new song to the beginning
                songs.unshift(newData);
            } else if (action === 'UPDATE') {
                if (songs[id]) songs[id] = { ...songs[id], ...newData };
            } else if (action === 'DELETE') {
                songs = songs.filter((_, index) => index !== id);
            }

            writeJSON(songsPath, songs);
            return NextResponse.json({ success: true, message: `Song ${action} Successful!` });
        }

        // --- AD ACTIONS ---
        if (action === 'UPDATE_ADS') {
            writeJSON(adsPath, adData);
            return NextResponse.json({ success: true, message: "Ad Settings Saved!" });
        }

        return NextResponse.json({ success: false, message: "Invalid Action" });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
