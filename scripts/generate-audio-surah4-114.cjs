// generate-audio-v3.cjs
const tencentcloud = require("tencentcloud-sdk-nodejs");
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Utiliser TENCENT_SECRET_ID ou TENCENTCLOUD_SECRET_ID
const secretId = process.env.TENCENT_SECRET_ID || process.env.TENCENTCLOUD_SECRET_ID;
const secretKey = process.env.TENCENT_SECRET_KEY || process.env.TENCENTCLOUD_SECRET_KEY;
const region = process.env.TENCENT_REGION || process.env.TENCENTCLOUD_REGION || 'ap-singapore';

console.log(' SecretId:', secretId ? ' OK' : ' MISSING');

const TtsClient = tencentcloud.tts.v20190823.Client;

const CONFIG = {
    langues: [
        { code: 'ar', name: 'Arabe', voiceType: 1001 },
        { code: 'fr', name: 'Français', voiceType: 1050 },
        { code: 'en', name: 'Anglais', voiceType: 1003 },
        { code: 'zh', name: 'Chinois', voiceType: 1010 },
        { code: 'es', name: 'Espagnol', voiceType: 1030 },
        { code: 'de', name: 'Allemand', voiceType: 1040 },
        { code: 'id', name: 'Indonésien', voiceType: 1060 },
        { code: 'ur', name: 'Ourdou', voiceType: 1070 },
        { code: 'fa', name: 'Persan', voiceType: 1080 },
        { code: 'tr', name: 'Turc', voiceType: 1090 },
        { code: 'ru', name: 'Russe', voiceType: 1100 },
        { code: 'hi', name: 'Hindi', voiceType: 1110 },
        { code: 'bn', name: 'Bengali', voiceType: 1120 },
        { code: 'pa', name: 'Pendjabi', voiceType: 1130 },
        { code: 'ja', name: 'Japonais', voiceType: 1140 },
        { code: 'ko', name: 'Coréen', voiceType: 1150 },
        { code: 'it', name: 'Italien', voiceType: 1160 },
        { code: 'nl', name: 'Néerlandais', voiceType: 1170 }
    ],
    sampleRate: 16000,
    codec: 'mp3',
    volume: 5,
    speed: 0,
    batchSize: 5,
    delayBetweenBatches: 2000
};

const client = new TtsClient({
    credential: {
        secretId: secretId,
        secretKey: secretKey,
    },
    region: region,
    profile: {
        httpProfile: {
            endpoint: 'tts.tencentcloudapi.com',
        },
    },
});

// Charger les données du Coran
function loadQuranData() {
    const dataPath = path.join(__dirname, '..', 'data', 'quran_fr.json');
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(` Données du Coran chargées : ${data.length} sourates`);
        
        // Compter le nombre total de versets
        let totalVerses = 0;
        data.forEach(surah => {
            totalVerses += surah.verses.length;
        });
        console.log(` Total des versets : ${totalVerses}`);
        
        return data;
    } catch (error) {
        console.error(' Erreur chargement des données :', error.message);
        process.exit(1);
    }
}

async function generateAudio(text, languageCode, voiceType, surahId, surahName, verseId) {
    try {
        const params = {
            Text: text,
            SessionId: `${surahId}_${verseId}_${languageCode}`,
            VoiceType: voiceType,
            Volume: CONFIG.volume,
            Speed: CONFIG.speed,
            SampleRate: CONFIG.sampleRate,
            Codec: CONFIG.codec,
        };

        const response = await client.TextToVoice(params);
        
        if (response.Audio) {
            const audioBuffer = Buffer.from(response.Audio, 'base64');
            const filename = `surah_${surahId}_ayah_${verseId}.mp3`;
            const filepath = path.join(__dirname, '..', 'audio', languageCode, filename);
            
            const dir = path.dirname(filepath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(filepath, audioBuffer);
            console.log(` Généré : ${languageCode}/surah_${surahId}_ayah_${verseId}.mp3 (${(audioBuffer.length / 1024).toFixed(2)} KB) - ${surahName} ${verseId}`);
            return true;
        } else {
            console.log(` Aucun audio reçu pour ${languageCode}/${surahId}/${verseId}`);
            return false;
        }
    } catch (error) {
        console.error(` Erreur pour ${languageCode}/${surahId}/${verseId} :`, error.message);
        return false;
    }
}

async function processSurah(surah, languageCode, voiceType, batchSize = CONFIG.batchSize) {
    const surahId = surah.id;
    const surahName = surah.translation || surah.name || `Sourate ${surahId}`;
    const verses = surah.verses;
    
    console.log(`\n Sourate ${surahId} : ${surahName} (${verses.length} versets)`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < verses.length; i += batchSize) {
        const batch = verses.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(verses.length / batchSize);
        
        console.log(`   Lot ${batchNumber}/${totalBatches} (${batch.length} versets)`);
        
        const promises = batch.map((verse) => {
            const text = verse.translation || verse.text || 'Texte non disponible';
            return generateAudio(
                text.substring(0, 1000),
                languageCode,
                voiceType,
                surahId,
                surahName,
                verse.id || verse.number || i + 1
            );
        });
        
        const results = await Promise.all(promises);
        const batchSuccess = results.filter(r => r === true).length;
        const batchFail = results.filter(r => r === false).length;
        
        successCount += batchSuccess;
        failCount += batchFail;
        
        console.log(`   Lot ${batchNumber} :  ${batchSuccess} /  ${batchFail}`);
        
        if (i + batchSize < verses.length) {
            console.log(`   Attente de ${CONFIG.delayBetweenBatches}ms...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
        }
    }
    
    return { successCount, failCount };
}

async function main() {
    console.log(' GÉNÉRATEUR AUDIO CORAN - TENCLOUD TTS');
    console.log('=========================================\n');
    
    if (!secretId || !secretKey) {
        console.error(' Erreur : Variables d\'environnement non configurées');
        process.exit(1);
    }
    
    const quranData = loadQuranData();
    
    // Tester avec l'arabe seulement
    const langues = CONFIG.langues.filter(l => l.code === 'ar');
    
    for (const langue of langues) {
        console.log(`\n Traitement de la langue : ${langue.name} (${langue.code})`);
        console.log('===================================================');
        
        const audioDir = path.join(__dirname, '..', 'audio', langue.code);
        if (!fs.existsSync(audioDir)) {
            console.log(` Dossier ${langue.code} non trouvé, création...`);
            fs.mkdirSync(audioDir, { recursive: true });
        }
        
        let totalSuccess = 0;
        let totalFail = 0;
        
        // Traiter seulement les 3 premières sourates pour le test
        const testSurahs = quranData.filter(s => s.id >= 4 && s.id <= 114);
        
        for (const surah of testSurahs) {
            const result = await processSurah(surah, langue.code, langue.voiceType);
            totalSuccess += result.successCount;
            totalFail += result.failCount;
        }
        
        console.log(`\n Résultat pour ${langue.name} :`);
        console.log(`    Succès : ${totalSuccess}`);
        console.log(`    Échecs : ${totalFail}`);
    }
    
    console.log('\n Génération terminée !');
}

main().catch(console.error);
