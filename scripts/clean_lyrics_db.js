/**
 * One-time script to clean lyrics data in tamil_songs_full_db.json
 * 
 * What it does:
 * 1. English lyrics: removes website template text ("is the track from... penned by...")
 * 2. Tamil lyrics: removes singer/music/lyricist names from the top
 * 3. Tamil lyrics: removes all "Unknown" lines scattered throughout
 * 
 * Run: node scripts/clean_lyrics_db.js
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'src', 'data', 'tamil_songs_full_db.json');

// Read the database
const songs = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

console.log(`📦 Loaded ${songs.length} songs\n`);

let englishCleaned = 0;
let tamilMetaCleaned = 0;
let tamilUnknownCleaned = 0;

// ═══════════════════════════════════════
// ENGLISH LYRICS CLEANER
// ═══════════════════════════════════════
function cleanEnglishLyrics(text) {
    if (!text) return text;
    const lines = text.split('\n');

    // Pattern 1: Template starts with "is the track from" or has ". This song was sung by"
    // Find the end of the template — look for "penned by" followed by name and "."
    let templateEndIndex = -1;

    for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const line = lines[i].trim();

        if (line === '.' ||
            line.startsWith('. This song was sung by') ||
            line.startsWith('is the track from') ||
            line === 'Tamil Film' ||
            line.startsWith('. Lyrics works are penned by') ||
            line.startsWith('and the music was composed by')) {
            templateEndIndex = i;
        }

        if (line.includes('Lyrics works are penned by')) {
            if (lines[i + 1] && lines[i + 1].trim() === '.') {
                templateEndIndex = i + 1;
            } else if (lines[i + 1] && lines[i + 2] && lines[i + 2].trim() === '.') {
                templateEndIndex = i + 2;
            }
            break;
        }
    }

    // Pattern 2: "Song Name Song\n. This song was sung by..." all inline
    if (templateEndIndex === -1 && lines.length > 2) {
        for (let i = 0; i < Math.min(lines.length, 3); i++) {
            const line = lines[i].trim();
            if (line.includes('. This song was sung by') && line.includes('penned by')) {
                // Everything is on one or two lines
                const afterPenned = line.split('penned by');
                if (afterPenned.length > 1) {
                    // Check if it ends with "."
                    const remainder = afterPenned[afterPenned.length - 1].trim();
                    if (remainder.endsWith('.')) {
                        templateEndIndex = i;
                    }
                }
            }
        }
    }

    if (templateEndIndex >= 0) {
        let startIdx = templateEndIndex + 1;
        while (startIdx < lines.length && !lines[startIdx].trim()) {
            startIdx++;
        }
        return lines.slice(startIdx).join('\n').trim();
    }

    return text;
}

// ═══════════════════════════════════════
// TAMIL LYRICS CLEANER
// ═══════════════════════════════════════
function cleanTamilLyrics(tamilText, song) {
    if (!tamilText) return tamilText;
    let lines = tamilText.split('\n');
    let originalLength = lines.length;

    // Step 1: Remove all "Unknown" lines
    lines = lines.filter(line => line.trim() !== 'Unknown');
    const unknownRemoved = originalLength - lines.length;

    // Step 2: Remove metadata from the top
    const metaLabels = ['பாடகி', 'பாடகர்', 'பாடியவர்', 'பாடியவர்கள்', 'இசை', 'பாடலாசிரியர்', 'எழுதியவர்', 'இயற்றியவர்'];
    let skipCount = 0;
    let confirmedMetaCount = 0;

    for (let i = 0; i < Math.min(lines.length, 6); i++) {
        const line = lines[i].trim();
        if (!line) { skipCount = i + 1; continue; }

        const wordCount = line.split(/\s+/).length;

        // STRONG signals
        const isLabel = metaLabels.some(l => line === l);
        const hasDots = (line.match(/\./g) || []).length >= 1 && wordCount <= 5;
        const hasAnd = line.includes('மற்றும்') && wordCount <= 6;

        if (isLabel || hasDots || hasAnd) {
            skipCount = i + 1;
            confirmedMetaCount++;
            continue;
        }

        // WEAK signal — short name after confirmed metadata
        if (wordCount <= 2 && confirmedMetaCount >= 1 && i <= 4) {
            const looksLikeLyrics = line.includes('…') || line.includes('..') ||
                line.includes('ஆ') || line.includes('ஓ') || line.includes('ஹ') ||
                line.length > 30;
            if (!looksLikeLyrics) {
                skipCount = i + 1;
                confirmedMetaCount++;
                continue;
            }
        }

        break;
    }

    const result = lines.slice(skipCount).join('\n').trim();
    return { result, skipCount, unknownRemoved };
}

// ═══════════════════════════════════════
// PROCESS ALL SONGS
// ═══════════════════════════════════════
songs.forEach((song, index) => {
    // Clean English lyrics
    const cleanedEnglish = cleanEnglishLyrics(song.lyrics);
    if (cleanedEnglish !== song.lyrics) {
        const removedLines = song.lyrics.split('\n').length - cleanedEnglish.split('\n').length;
        console.log(`🔵 Song ${index}: "${song.title}" — English: removed ${removedLines} template lines`);
        song.lyrics = cleanedEnglish;
        englishCleaned++;
    }

    // Clean Tamil lyrics
    if (song.lyrics_tamil) {
        const { result, skipCount, unknownRemoved } = cleanTamilLyrics(song.lyrics_tamil, song);
        if (result !== song.lyrics_tamil) {
            const changes = [];
            if (skipCount > 0) changes.push(`${skipCount} metadata lines`);
            if (unknownRemoved > 0) changes.push(`${unknownRemoved} "Unknown" lines`);
            console.log(`🟢 Song ${index}: "${song.title}" — Tamil: removed ${changes.join(' + ')}`);
            song.lyrics_tamil = result;
            if (skipCount > 0) tamilMetaCleaned++;
            if (unknownRemoved > 0) tamilUnknownCleaned++;
        }
    }
});

// ═══════════════════════════════════════
// SAVE
// ═══════════════════════════════════════
console.log(`\n═══════════════════════════════════════`);
console.log(`📊 Summary:`);
console.log(`   English template removed: ${englishCleaned} songs`);
console.log(`   Tamil metadata removed:   ${tamilMetaCleaned} songs`);
console.log(`   Tamil "Unknown" removed:  ${tamilUnknownCleaned} songs`);
console.log(`═══════════════════════════════════════\n`);

// Backup original
const backupPath = DB_PATH.replace('.json', '_backup.json');
fs.writeFileSync(backupPath, fs.readFileSync(DB_PATH));
console.log(`💾 Backup saved to: ${backupPath}`);

// Write cleaned data
fs.writeFileSync(DB_PATH, JSON.stringify(songs, null, 4), 'utf-8');
console.log(`✅ Cleaned database saved to: ${DB_PATH}`);
