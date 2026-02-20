// Prende il bottone e il titolo
const btn = document.getElementById('btn');
const titolo = document.getElementById('titolo');

// Al click cambia il testo
btn.addEventListener('click', () => {
  titolo.textContent = 'Hai cliccato il bottone!';
});