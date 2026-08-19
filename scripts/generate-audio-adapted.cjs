// generate-audio-adapted.cjs
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
    batchSize: 10,
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

function loadQuranData() {
    const dataPath = path.join(__dirname, '..', 'data', 'quran_fr.json');
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(` Données du Coran chargées : ${data.length} versets`);
        return data;
    } catch (error) {
        console.error(' Erreur chargement des données :', error.message);
        process.exit(1);
    }
}

async function generateAudio(text, languageCode, voiceType, surah, ayah) {
    try {
        const params = {
            Text: text,
            SessionId: `${surah}_${ayah}_${languageCode}`,
            VoiceType: voiceType,
            Volume: CONFIG.volume,
            Speed: CONFIG.speed,
            SampleRate: CONFIG.sampleRate,
            Codec: CONFIG.codec,
        };

        const response = await client.TextToVoice(params);
        
        if (response.Audio) {
            const audioBuffer = Buffer.from(response.Audio, 'base64');
            const filename = `surah_${surah}_ayah_${ayah}.mp3`;
            const filepath = path.join(__dirname, '..', 'audio', languageCode, filename);
            
            fs.writeFileSync(filepath, audioBuffer);
            console.log(` Généré : ${languageCode}/${filename} (${(audioBuffer.length / 1024).toFixed(2)} KB)`);
            return true;
        } else {
            console.log(` Aucun audio reçu pour ${languageCode}/${surah}/${ayah}`);
            return false;
        }
    } catch (error) {
        console.error(` Erreur pour ${languageCode}/${surah}/${ayah} :`, error.message);
        return false;
    }
}

async function processBatch(versets, languageCode, voiceType, batchSize = CONFIG.batchSize) {
    console.log(`\n Traitement de ${versets.length} versets pour ${languageCode}...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < versets.length; i += batchSize) {
        const batch = versets.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(versets.length / batchSize);
        
        console.log(`\n   Lot ${batchNumber}/${totalBatches} (${batch.length} versets)`);
        
        const promises = batch.map((v) => {
            const text = v.translation || v.text || v.arabic || 'Text not available';
            return generateAudio(
                text.substring(0, 1000),
                languageCode,
                voiceType,
                v.surah || v.sourate || 1,
                v.ayah || v.verset || 1
            );
        });
        
        const results = await Promise.all(promises);
        const batchSuccess = results.filter(r => r === true).length;
        const batchFail = results.filter(r => r === false).length;
        
        successCount += batchSuccess;
        failCount += batchFail;
        
        console.log(`   Lot ${batchNumber} :  ${batchSuccess} /  ${batchFail}`);
        
        if (i + batchSize < versets.length) {
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
        console.error('   TENCENT_SECRET_ID ou TENCENTCLOUD_SECRET_ID:', secretId ? '' : '');
        console.error('   TENCENT_SECRET_KEY ou TENCENTCLOUD_SECRET_KEY:', secretKey ? '' : '');
        process.exit(1);
    }
    
    const quranData = loadQuranData();
    const langues = CONFIG.langues.filter(l => l.code === 'ar');
    
    for (const langue of langues) {
        console.log(`\n Traitement de la langue : ${langue.name} (${langue.code})`);
        console.log('----------------------------------------');
        
        const audioDir = path.join(__dirname, '..', 'audio', langue.code);
        if (!fs.existsSync(audioDir)) {
            console.log(` Dossier ${langue.code} non trouvé, création...`);
            fs.mkdirSync(audioDir, { recursive: true });
        }
        
        const versets = quranData.map(v => ({
            ...v,
            text: v.translation || v.text || v.arabic || 'Texte non disponible'
        }));
        
        const testVersets = versets.slice(0, 10);
        
        const result = await processBatch(
            testVersets, 
            langue.code, 
            langue.voiceType
        );
        
        console.log(`\n Résultat pour ${langue.name} :`);
        console.log(`    Succès : ${result.successCount}`);
        console.log(`    Échecs : ${result.failCount}`);
    }
    
    console.log('\n Génération terminée !');
}

main().catch(console.error);
