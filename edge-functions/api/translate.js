export async function onRequestPost({ request, env }) {
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

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
