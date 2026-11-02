'use strict';
const root = document.documentElement;
const picker = document.querySelector('#theme');
const preference = matchMedia('(prefers-color-scheme: dark)');
let theme = 'light';
try { const saved = localStorage.getItem('kopaka-ds-v2-theme'); if (['system', 'light', 'dark'].includes(saved)) theme = saved; } catch { /* file:// storage may be unavailable */ }
function applyTheme() { root.dataset.theme = theme === 'system' ? (preference.matches ? 'dark' : 'light') : theme; }
picker.value = theme;
applyTheme();
picker.addEventListener('change', () => { theme = picker.value; applyTheme(); try { localStorage.setItem('kopaka-ds-v2-theme', theme); } catch {} });
preference.addEventListener('change', applyTheme);
const layouts = {0:[],1:[[22,22]],2:[[12,12],[32,32]],3:[[12,12],[22,22],[32,32]],4:[[12,12],[32,12],[12,32],[32,32]],5:[[12,12],[32,12],[22,22],[12,32],[32,32]],6:[[12,10],[32,10],[12,22],[32,22],[12,34],[32,34]]};
const ns = 'http://www.w3.org/2000/svg';
function half(value) {
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 44 44'); svg.setAttribute('aria-hidden','true');
  for (const [x,y] of layouts[value]) { const pip = document.createElementNS(ns,'circle'); pip.setAttribute('cx',x); pip.setAttribute('cy',y); pip.setAttribute('r','3'); svg.append(pip); }
  return svg;
}
for (const group of document.querySelectorAll('[data-tiles]')) {
  for (const pair of group.dataset.tiles.split(',')) {
    const [a,b] = pair.split('-').map(Number);
    const interactive = group.id === 'hand';
    const tile = document.createElement(interactive ? 'button' : 'span'); tile.className = 'tile';
    tile.append(half(a),half(b));
    if (interactive) {
      tile.type = 'button'; tile.setAttribute('aria-label', `Domino ${a}–${b}`); tile.setAttribute('aria-pressed','false');
      tile.addEventListener('click', () => {
        const selected = tile.getAttribute('aria-pressed') !== 'true';
        document.querySelectorAll('#hand .tile').forEach(t => t.setAttribute('aria-pressed','false'));
        tile.setAttribute('aria-pressed',String(selected));
        document.querySelector('#selection').textContent = selected ? `Pièce ${a}–${b} sélectionnée. Exemple visuel, aucune pose envoyée.` : 'Aucune pièce sélectionnée.';
        document.querySelector('#clear-selection').disabled = !selected;
      });
    } else tile.setAttribute('aria-hidden','true');
    group.append(tile);
  }
}
document.querySelector('#clear-selection').addEventListener('click', () => {
  const selected = document.querySelector('#hand [aria-pressed="true"]');
  document.querySelectorAll('#hand .tile').forEach(t => t.setAttribute('aria-pressed','false'));
  document.querySelector('#selection').textContent = 'Aucune pièce sélectionnée.';
  if (selected) selected.focus();
  document.querySelector('#clear-selection').disabled = true;
});
function feedback(text,kind) { const region = document.querySelector('#feedback'); region.className = `notice ${kind}`; region.textContent = text; }
function openDialog(id, trigger) { const dialog = document.querySelector(id); dialog.showModal(); dialog.addEventListener('close', () => trigger.focus(), {once:true}); }
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelector('#guest-open').addEventListener('click', event => { document.querySelector('#chosen-mode').textContent = `Format choisi : ${document.querySelector('[name="mode"]:checked').value} joueurs.`; openDialog('#guest-dialog',event.currentTarget); });
document.querySelector('#guest-form').addEventListener('submit', event => {
  event.preventDefault(); const nickname = document.querySelector('#nickname');
  if (!nickname.value.trim()) { nickname.setCustomValidity('Saisis un pseudonyme pour cet exemple.'); nickname.reportValidity(); return; }
  document.querySelector('#guest-dialog').close(); feedback(`Exemple confirmé pour ${nickname.value.trim()}. Aucune salle créée, aucune donnée envoyée.`,'success');
});
document.querySelector('#nickname').addEventListener('input', event => event.target.setCustomValidity(''));
document.querySelector('#dialog-example').addEventListener('click', event => openDialog('#example-dialog',event.currentTarget));
document.querySelector('#status-example').addEventListener('click', () => feedback('Action confirmée dans le catalogue. Le serveur de jeu ne reçoit aucune action.','success'));
document.querySelector('#error-example').addEventListener('click', () => feedback('Exemple : cette pièce ne peut pas être posée ici. Choisis une autre extrémité autorisée.','error'));
