// Single-select button groups
const buttonGroups = document.querySelectorAll('.button-group');

buttonGroups.forEach(group => {
  const buttons = group.querySelectorAll('button');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
});

// Multi-select chips
const chips = document.querySelectorAll('.chip');

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('active');
  });
});

// Save data locally
const saveButton = document.getElementById('saveButton');

saveButton.addEventListener('click', () => {

  const data = {
    wineName: document.getElementById('wineName').value,
    producer: document.getElementById('producer').value,
    vintage: document.getElementById('vintage').value,
    smellNotes: document.getElementById('smellNotes').value,
    tasteNotes: document.getElementById('tasteNotes').value
  };

  localStorage.setItem('wineTastingData', JSON.stringify(data));

  alert('Notes saved locally');
});

// Load saved data
window.addEventListener('load', () => {

  const saved = localStorage.getItem('wineTastingData');

  if (!saved) return;

  const data = JSON.parse(saved);

  document.getElementById('wineName').value = data.wineName || '';
  document.getElementById('producer').value = data.producer || '';
  document.getElementById('vintage').value = data.vintage || '';
  document.getElementById('smellNotes').value = data.smellNotes || '';
  document.getElementById('tasteNotes').value = data.tasteNotes || '';
});
