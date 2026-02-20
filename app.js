const btn = document.getElementById('btn');
const titolo = document.getElementById('titolo');

btn.addEventListener('click', () => {
  titolo.textContent = 'Hai cliccato il bottone!';
});