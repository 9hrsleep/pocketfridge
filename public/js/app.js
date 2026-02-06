// API Base URL
const API_URL = '/api';

// State
let currentFridge = null;
let fridges = [];
let items = [];

// DOM Elements
const fridgeList = document.getElementById('fridge-list');
const itemsList = document.getElementById('items-list');
const itemsSection = document.getElementById('items-section');
const currentFridgeName = document.getElementById('current-fridge-name');

// Modals
const fridgeModal = document.getElementById('fridge-modal');
const itemModal = document.getElementById('item-modal');
const fridgeForm = document.getElementById('fridge-form');
const itemForm = document.getElementById('item-form');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadFridges();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  // Fridge modal
  document.getElementById('add-fridge-btn').addEventListener('click', () => {
    openModal(fridgeModal);
  });

  document.getElementById('cancel-fridge').addEventListener('click', () => {
    closeModal(fridgeModal);
  });

  fridgeForm.addEventListener('submit', handleAddFridge);

  // Item modal
  document.getElementById('add-item-btn').addEventListener('click', () => {
    if (!currentFridge) {
      alert('Please select a fridge first');
      return;
    }
    openModal(itemModal);
  });

  document.getElementById('cancel-item').addEventListener('click', () => {
    closeModal(itemModal);
  });

  itemForm.addEventListener('submit', handleAddItem);

  // Close modals on X click
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeModal(fridgeModal);
      closeModal(itemModal);
    });
  });

  // Close modals on outside click
  window.addEventListener('click', event => {
    if (event.target === fridgeModal) closeModal(fridgeModal);
    if (event.target === itemModal) closeModal(itemModal);
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      filterItems(filter);
    });
  });
}

// API Functions
async function loadFridges() {
  try {
    const response = await fetch(`${API_URL}/fridges`);
    fridges = await response.json();
    renderFridges();
  } catch (error) {
    console.error('Error loading fridges:', error);
    showError('Failed to load fridges');
  }
}

async function loadItems(fridgeId) {
  try {
    const response = await fetch(`${API_URL}/fridges/${fridgeId}/items`);
    items = await response.json();
    renderItems();
  } catch (error) {
    console.error('Error loading items:', error);
    showError('Failed to load items');
  }
}

async function handleAddFridge(e) {
  e.preventDefault();
  
  const name = document.getElementById('fridge-name').value;
  const location = document.getElementById('fridge-location').value;

  try {
    const response = await fetch(`${API_URL}/fridges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location })
    });

    if (response.ok) {
      closeModal(fridgeModal);
      fridgeForm.reset();
      await loadFridges();
    } else {
      showError('Failed to add fridge');
    }
  } catch (error) {
    console.error('Error adding fridge:', error);
    showError('Failed to add fridge');
  }
}

async function handleAddItem(e) {
  e.preventDefault();

  const itemData = {
    fridge_id: currentFridge.id,
    name: document.getElementById('item-name').value,
    quantity: parseInt(document.getElementById('item-quantity').value),
    unit: document.getElementById('item-unit').value,
    category: document.getElementById('item-category').value,
    expiry_date: document.getElementById('item-expiry').value || null,
    notes: document.getElementById('item-notes').value
  };

  try {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });

    if (response.ok) {
      closeModal(itemModal);
      itemForm.reset();
      await loadItems(currentFridge.id);
    } else {
      showError('Failed to add item');
    }
  } catch (error) {
    console.error('Error adding item:', error);
    showError('Failed to add item');
  }
}

async function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    const response = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadItems(currentFridge.id);
    } else {
      showError('Failed to delete item');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    showError('Failed to delete item');
  }
}

async function deleteFridge(fridgeId) {
  if (!confirm('Are you sure you want to delete this fridge and all its items?')) return;

  try {
    const response = await fetch(`${API_URL}/fridges/${fridgeId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      if (currentFridge && currentFridge.id === fridgeId) {
        currentFridge = null;
        itemsSection.style.display = 'none';
      }
      await loadFridges();
    } else {
      showError('Failed to delete fridge');
    }
  } catch (error) {
    console.error('Error deleting fridge:', error);
    showError('Failed to delete fridge');
  }
}

// Render Functions
function renderFridges() {
  if (fridges.length === 0) {
    fridgeList.innerHTML = `
      <div class="empty-state">
        <p>No fridges yet. Click "Add Fridge" to get started!</p>
      </div>
    `;
    return;
  }

  fridgeList.innerHTML = fridges.map(fridge => `
    <div class="fridge-card ${currentFridge && currentFridge.id === fridge.id ? 'active' : ''}" 
         onclick="selectFridge(${fridge.id})">
      <h3>${escapeHtml(fridge.name)}</h3>
      ${fridge.location ? `<p>📍 ${escapeHtml(fridge.location)}</p>` : ''}
      <div class="item-count">Items: <span id="fridge-${fridge.id}-count">-</span></div>
      <button class="btn btn-danger" style="margin-top: 1rem;" 
              onclick="event.stopPropagation(); deleteFridge(${fridge.id})">Delete</button>
    </div>
  `).join('');

  // Load item counts for each fridge
  fridges.forEach(async fridge => {
    const response = await fetch(`${API_URL}/fridges/${fridge.id}/items`);
    const items = await response.json();
    const countElement = document.getElementById(`fridge-${fridge.id}-count`);
    if (countElement) {
      countElement.textContent = items.length;
    }
  });
}

function renderItems() {
  if (items.length === 0) {
    itemsList.innerHTML = `
      <div class="empty-state">
        <p>No items in this fridge. Click "Add Item" to add something!</p>
      </div>
    `;
    return;
  }

  itemsList.innerHTML = items.map(item => {
    const expiryStatus = getExpiryStatus(item.expiry_date);
    return `
      <div class="item-card ${expiryStatus.class}">
        <div class="item-header">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            ${item.category ? `<span class="item-category">${escapeHtml(item.category)}</span>` : ''}
          </div>
        </div>
        <div class="item-details">
          <p><strong>Quantity:</strong> ${item.quantity} ${item.unit || ''}</p>
          ${item.expiry_date ? `<p><strong>Expires:</strong> ${formatDate(item.expiry_date)} ${expiryStatus.text}</p>` : ''}
          ${item.notes ? `<p><strong>Notes:</strong> ${escapeHtml(item.notes)}</p>` : ''}
        </div>
        <div class="item-actions">
          <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function selectFridge(fridgeId) {
  currentFridge = fridges.find(f => f.id === fridgeId);
  if (currentFridge) {
    currentFridgeName.textContent = currentFridge.name;
    itemsSection.style.display = 'block';
    loadItems(fridgeId);
    renderFridges(); // Re-render to update active state
  }
}

function filterItems(filter) {
  const allItems = [...items];
  
  if (filter === 'expiring') {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    items = allItems.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= sevenDaysFromNow;
    });
  } else {
    items = allItems;
  }
  
  renderItems();
}

// Utility Functions
function openModal(modal) {
  modal.style.display = 'block';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

function showError(message) {
  alert(message); // In production, use a better notification system
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return { class: '', text: '' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { class: 'expired', text: '⚠️ Expired' };
  } else if (daysUntilExpiry <= 3) {
    return { class: 'expiring-soon', text: '⚡ Expires soon' };
  } else if (daysUntilExpiry <= 7) {
    return { class: 'expiring-soon', text: '⏰ Expires this week' };
  }
  
  return { class: '', text: '' };
}

// Make functions globally available
window.selectFridge = selectFridge;
window.deleteItem = deleteItem;
window.deleteFridge = deleteFridge;
