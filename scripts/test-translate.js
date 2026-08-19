const tencentcloud = require("tencentcloud-sdk-nodejs");
require('dotenv').config({ path: '../.env' });

// Initialisation correcte du client TMT
const TmtClient = tencentcloud.tmt.v20180321.Client;

const client = new TmtClient({
    credential: {
        secretId: process.env.TENCENTCLOUD_SECRET_ID,
        secretKey: process.env.TENCENTCLOUD_SECRET_KEY,
    },
    region: 'ap-singapore',
    profile: {
        httpProfile: {
            endpoint: 'tmt.tencentcloudapi.com'
        }
    }
});

// Paramètres de traduction
const params = {
    SourceText: 'بسم الله الرحمن الرحيم',
    Source: 'ar',
    Target: 'fr',
    ProjectId: 0
};

// Appel correct
client.TextTranslate(params).then(
    (data) => {
        console.log(' Traduction:', data.TargetText);
        console.log('   Source:', data.Source);
        console.log('   Target:', data.Target);
        console.log('   RequestId:', data.RequestId);
    },
    (err) => {
        console.error(' Erreur:', err.message);
    }
);
