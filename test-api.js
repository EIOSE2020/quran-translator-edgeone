fetch('http://localhost:3000/api/languages')
  .then(r => r.json())
  .then(data => console.log('Langues:', data.languages.length))
  .catch(e => console.error('Erreur:', e));

fetch('http://localhost:3000/api/surahs')
  .then(r => r.json())
  .then(data => console.log('Sourates:', data.length))
  .catch(e => console.error('Erreur:', e));
