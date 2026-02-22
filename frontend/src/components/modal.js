export function renderModal(content) {
  return `
    <div class="modal-overlay" id="modal">
      <div class="modal-content">
        <button class="modal-close" id="close-modal">&times;</button>
        ${content}
      </div>
    </div>
  `;
}

export function showModal(content) {
  const modal = document.createElement('div');
  modal.innerHTML = renderModal(content);
  document.body.appendChild(modal.firstElementChild);
  
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });
}

export function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.remove();
}
