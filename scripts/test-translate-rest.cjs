const https = require("https");
const crypto = require("crypto");
require("dotenv").config({ path: "../.env" });

const secretId = process.env.TENCENTCLOUD_SECRET_ID;
const secretKey = process.env.TENCENTCLOUD_SECRET_KEY;

async function translate() {
    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().split("T")[0];
    const payload = JSON.stringify({
        SourceText: "بسم الله الرحمن الرحيم",
        Source: "ar",
        Target: "fr",
        ProjectId: 0,
    });

    const hashedPayload = crypto
        .createHash("sha256")
        .update(payload)
        .digest("hex");
    const httpRequestMethod = "POST";
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders =
        "content-type:application/json\nhost:tmt.tencentcloudapi.com\n";
    const signedHeaders = "content-type;host";
    const canonicalRequest =
        httpRequestMethod +
        "\n" +
        canonicalUri +
        "\n" +
        canonicalQueryString +
        "\n" +
        canonicalHeaders +
        "\n" +
        signedHeaders +
        "\n" +
        hashedPayload;

    const algorithm = "TC3-HMAC-SHA256";
    const credentialScope = date + "/tmt/tc3_request";
    const hashedCanonicalRequest = crypto
        .createHash("sha256")
        .update(canonicalRequest)
        .digest("hex");
    const stringToSign =
        algorithm +
        "\n" +
        timestamp +
        "\n" +
        credentialScope +
        "\n" +
        hashedCanonicalRequest;

    const secretDate = crypto
        .createHmac("sha256", "TC3" + secretKey)
        .update(date)
        .digest();
    const secretService = crypto
        .createHmac("sha256", secretDate)
        .update("tmt")
        .digest();
    const secretSigning = crypto
        .createHmac("sha256", secretService)
        .update("tc3_request")
        .digest();
    const signature = crypto
        .createHmac("sha256", secretSigning)
        .update(stringToSign)
        .digest("hex");

    const authorization =
        algorithm +
        " Credential=" +
        secretId +
        "/" +
        credentialScope +
        ", SignedHeaders=" +
        signedHeaders +
        ", Signature=" +
        signature;

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
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
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

translate()
    .then((response) => {
        if (response.Response && response.Response.TargetText) {
            console.log(" Traduction:", response.Response.TargetText);
            console.log("   Source:", response.Response.Source);
            console.log("   Target:", response.Response.Target);
        } else if (response.Response && response.Response.Error) {
            console.error(" Erreur:", response.Response.Error.Message);
            console.error("   Code:", response.Response.Error.Code);
        } else {
            console.error(" Réponse inattendue:", JSON.stringify(response, null, 2));
        }
    })
    .catch((err) => {
        console.error(" Erreur:", err.message);
    });
