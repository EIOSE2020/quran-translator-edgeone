export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Route pour /api/translate
        if (url.pathname === '/api/translate') {
            if (request.method === 'OPTIONS') {
                return new Response(null, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                });
            }

            if (request.method !== 'POST') {
                return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
                    status: 405,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            try {
                const body = await request.json();
                const { text, targetLanguage } = body;

                if (!text || !targetLanguage) {
                    return new Response(JSON.stringify({
                        error: 'Texte et langue cible requis'
                    }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                    });
                }

                const apiKey = env.DEEPSEEK_API_KEY;
                if (!apiKey) {
                    return new Response(JSON.stringify({
                        error: 'Clé API DeepSeek manquante'
                    }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                    });
                }

                const response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': Bearer 
                    },
                    body: JSON.stringify({
                        model: 'deepseek-v4-flash',
                        messages: [
                            { role: 'system', content: Traduis le texte arabe en . },
                            { role: 'user', content: text }
                        ],
                        stream: false
                    })
                });

                const data = await response.json();
                const translation = data.choices[0].message.content;

                return new Response(JSON.stringify({
                    success: true,
                    translation: translation
                }), {
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });

            } catch (error) {
                return new Response(JSON.stringify({
                    error: 'Erreur serveur',
                    details: error.message
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }
        }

        // Route pour /api/test
        if (url.pathname === '/api/test') {
            return new Response(JSON.stringify({
                status: 'OK',
                message: 'API fonctionnelle',
                deepseekKey: !!env.DEEPSEEK_API_KEY
            }), {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        // Pour les autres routes, servir les fichiers statiques
        try {
            const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
            const file = await env.ASSETS.fetch(new Request(${url.origin}));
            if (file.status === 200) {
                return file;
            }
        } catch (e) {}

        return new Response('Page non trouvée', { status: 404 });
    }
};
