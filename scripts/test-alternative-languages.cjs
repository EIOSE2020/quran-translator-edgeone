// test-alternative-languages.cjs
const https = require("https");
const crypto = require("crypto");
require("dotenv").config({ path: "../.env" });

const secretId = process.env.TENCENTCLOUD_SECRET_ID;
const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

// Nouvelles langues à tester (qui devraient être supportées)
const newLanguages = [
    { code: "el", name: "Grec" },
    { code: "he", name: "Hébreu" },
    { code: "pl", name: "Polonais" },
    { code: "sv", name: "Suédois" },
    { code: "da", name: "Danois" },
    { code: "fi", name: "Finnois" },
    { code: "no", name: "Norvégien" },
    { code: "cs", name: "Tchèque" },
    { code: "ro", name: "Roumain" },
    { code: "bg", name: "Bulgare" },
    { code: "uk", name: "Ukrainien" },
    { code: "hu", name: "Hongrois" },
    { code: "ms", name: "Malais (confirmation)" }
];

const sourceText = "بسم الله الرحمن الرحيم";

async function translateTwoStep(text, sourceLang, targetLang) {
    // Étape 1: Arabe -> Anglais (ou directement si supporté)
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split("T")[0];
    const payload = JSON.stringify({
        SourceText: text,
        Source: sourceLang,
        Target: targetLang,
        ProjectId: 0,
    });

    const hashedPayload = crypto.createHash("sha256").update(payload).digest("hex");
    const canonicalRequest = `POST\n/\n\ncontent-type:application/json\nhost:tmt.tencentcloudapi.com\n\ncontent-type;host\n${hashedPayload}`;
    const algorithm = "TC3-HMAC-SHA256";
    const credentialScope = `${date}/tmt/tc3_request`;
    const hashedCanonicalRequest = crypto.createHash("sha256").update(canonicalRequest).digest("hex");
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

    const secretDate = crypto.createHmac("sha256", `TC3${secretKey}`).update(date).digest();
    const secretService = crypto.createHmac("sha256", secretDate).update("tmt").digest();
    const secretSigning = crypto.createHmac("sha256", secretService).update("tc3_request").digest();
    const signature = crypto.createHmac("sha256", secretSigning).update(stringToSign).digest("hex");

    const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`;

    const options = {
        hostname: "tmt.tencentcloudapi.com",
        path: "/",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Host: "tmt.tencentcloudapi.com",
            "X-TC-Action": "TextTranslate",
            "X-TC-Version": "2018-03-21",
            "X-TC-Timestamp": timestamp,
            "X-TC-Region": "ap-singapore",
            Authorization: authorization,
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on("error", reject);
        req.write(payload);
        req.end();
    });
}

async function testAll() {
    console.log(" TEST DES LANGUES ALTERNATIVES\n");
    console.log(`Texte source: "${sourceText}"\n`);

    // D'abord, traduire en anglais (étape 1)
    console.log(" Étape 1: Arabe  Anglais");
    const step1 = await translateTwoStep(sourceText, "ar", "en");
    if (!step1.Response || !step1.Response.TargetText) {
        console.error(" Échec de la traduction arabe  anglais");
        return;
    }
    const englishText = step1.Response.TargetText;
    console.log(`    Anglais: "${englishText}"\n`);

    console.log(" Étape 2: Anglais  Nouvelles langues");
    let successCount = 0;
    let failCount = 0;

    for (const lang of newLanguages) {
        try {
            // Tester la traduction en 2 étapes
            const response = await translateTwoStep(englishText, "en", lang.code);
            if (response.Response && response.Response.TargetText) {
                console.log(`    ${lang.name} (${lang.code}): ${response.Response.TargetText}`);
                successCount++;
            } else if (response.Response && response.Response.Error) {
                console.log(`    ${lang.name} (${lang.code}): ${response.Response.Error.Message}`);
                failCount++;
            } else {
                console.log(`    ${lang.name} (${lang.code}): Réponse inattendue`);
                failCount++;
            }
        } catch (error) {
            console.log(`    ${lang.name} (${lang.code}): ${error.message}`);
            failCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n Résultat: ${successCount} succès, ${failCount} échecs`);
    console.log("\n Langues recommandées pour remplacer celles qui échouent:");
    console.log("   - Portugais  Suédois (sv) ou Polonais (pl)");
    console.log("   - Coréen  Grec (el) ou Hébreu (he)");
    console.log("   - Tagalog  Roumain (ro) ou Bulgare (bg)");
}

testAll();
