export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    
    const surah = parseInt(url.searchParams.get('surah')) || 1;
    const ayah = parseInt(url.searchParams.get('ayah')) || 1;
    const range = parseInt(url.searchParams.get('range')) || 7;
    
    try {
        const quranUrl = new URL('/data/quran_fr.json', url.origin);
        const response = await fetch(quranUrl.toString());
        
        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'Fichier Coran non trouvé', verses: [] }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            });
        }
        
        const quran = await response.json();
        let surahData = null;
        for (const s of quran) {
            if (s.id === surah) {
                surahData = s;
                break;
            }
        }
        
        if (!surahData) {
            return new Response(JSON.stringify({ error: 'Sourate non trouvée', verses: [] }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            });
        }
        
        const totalVerses = surahData.total_verses || surahData.verses.length;
        const start = ayah - 1;
        const end = Math.min(start + range, totalVerses);
        
        const verses = [];
        for (let i = start; i < end; i++) {
            if (surahData.verses && surahData.verses[i]) {
                const v = surahData.verses[i];
                verses.push({
                    number: v.id || (i + 1),
                    arabic: v.text || '',
                    translation: v.translation || 'Traduction non disponible'
                });
            }
        }
        
        return new Response(JSON.stringify({
            surah: surah,
            surah_name: surahData.translation || surahData.name || `Sourate ${surah}`,
            total_verses: totalVerses,
            verses: verses
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Erreur serveur', verses: [] }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
