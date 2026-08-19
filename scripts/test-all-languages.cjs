// test-all-languages.cjs
const https = require("https");
const crypto = require("crypto");
require("dotenv").config({ path: "../.env" });

const secretId = process.env.TENCENTCLOUD_SECRET_ID;
const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

// Liste des langues cibles (sans l'arabe)
const languages = [
    { code: "en", name: "Anglais" },
    { code: "es", name: "Espagnol" },
    { code: "de", name: "Allemand" },
    { code: "it", name: "Italien" },
    { code: "pt", name: "Portugais" },
    { code: "ru", name: "Russe" },
    { code: "zh", name: "Chinois" },
    { code: "ja", name: "Japonais" },
    { code: "ko", name: "Coréen" },
    { code: "hi", name: "Hindi" },
    { code: "id", name: "Indonésien" },
    { code: "th", name: "Thaï" },
    { code: "vi", name: "Vietnamien" },
    { code: "tr", name: "Turc" },
    { code: "ms", name: "Malais" },
    { code: "tl", name: "Tagalog" }
];

// Texte à traduire (Bismillah)
const sourceText = "بسم الله الرحمن الرحيم";

async function translate(targetLang) {
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split("T")[0];
    const payload = JSON.stringify({
        SourceText: sourceText,
        Source: "ar",
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
    console.log(" TEST DE TRADUCTION - 17 LANGUES\n");
    console.log(`Texte source: "${sourceText}"\n`);

    let successCount = 0;
    let failCount = 0;

    for (const lang of languages) {
        try {
            const response = await translate(lang.code);
            if (response.Response && response.Response.TargetText) {
                console.log(` ${lang.name} (${lang.code}): ${response.Response.TargetText}`);
                successCount++;
            } else if (response.Response && response.Response.Error) {
                console.log(` ${lang.name} (${lang.code}): ${response.Response.Error.Message}`);
                failCount++;
            } else {
                console.log(` ${lang.name} (${lang.code}): Réponse inattendue`);
                failCount++;
            }
        } catch (error) {
            console.log(` ${lang.name} (${lang.code}): ${error.message}`);
            failCount++;
        }
        // Pause pour éviter la limitation de l'API
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n Résultat: ${successCount} succès, ${failCount} échecs`);
}

testAll();
