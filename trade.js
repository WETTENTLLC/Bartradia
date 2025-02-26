// Constants and State Management
const API_ENDPOINTS = {
    GET_TRADES: '/api/trades',
    UPDATE_TRADE: (id) => `/api/trades/${id}`,
    DELETE_TRADE: (id) => `/api/trades/${id}`
};

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('tradeForm');
    const tradeList = document.getElementById('tradeList');

    // Core Functions
    const displayTrades = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.GET_TRADES);
            const data = await response.json();
            
            if (!data.trades) {
                tradeList.innerHTML = '<p>No trades available</p>';
                return;
            }

            tradeList.innerHTML = data.trades.map(trade => createTradeItemHTML(trade)).join('');
            attachEventListeners();
        } catch (error) {
            console.error('Error fetching trades:', error);
            tradeList.innerHTML = '<p>Error loading trades. Please try again later.</p>';
        }
    };

    const createTradeItemHTML = (trade) => `
        <div class="trade-item" data-id="${trade.id}" onmouseenter="showItemInfo(this)" onmouseleave="hideItemInfo(this)">
            <img src="images/${trade.image}" alt="${trade.name}" class="trade-image">
            <strong>${trade.name}</strong>
            <p>${trade.description}</p>
            <div class="item-info">
                <p><strong>Value:</strong> ${trade.value}</p>
                <p><strong>Size:</strong> ${trade.size}</p>
                <p><strong>Location:</strong> ${trade.location}</p>
                <p><strong>Seller:</strong> ${trade.seller}</p>
                <div class="action-buttons">
                    <button class="edit-btn btn-secondary">Edit</button>
                    <button class="delete-btn btn-danger">Delete</button>
                </div>
            </div>
        </div>
    `;

    // Event Handlers
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDescription').value,
            value: document.getElementById('itemValue').value,
            size: document.getElementById('itemSize').value,
            location: document.getElementById('itemLocation').value,
            seller: document.getElementById('itemSeller').value
        };

        try {
            const response = await fetch(API_ENDPOINTS.GET_TRADES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            
            if (result.id) {
                displayTrades();
                form.reset();
            }
        } catch (error) {
            console.error('Error creating trade:', error);
        }
    };

    // Event Listeners
    const attachEventListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });
    };

    const handleEditClick = async (e) => {
        const tradeElement = e.target.closest('.trade-item');
        const tradeId = tradeElement.dataset.id;
        
        // You might want to replace these prompts with a modal form
        const updates = {
            name: prompt('Enter new name:', tradeElement.querySelector('strong').innerText),
            description: prompt('Enter new description:', tradeElement.querySelector('p').innerText)
        };

        if (updates.name && updates.description) {
            await updateTrade(tradeId, updates);
        }
    };

    const handleDeleteClick = async (e) => {
        if (confirm('Are you sure you want to delete this item?')) {
            const tradeElement = e.target.closest('.trade-item');
            const tradeId = tradeElement.dataset.id;
            await deleteTrade(tradeId);
        }
    };

    // API Functions
    const updateTrade = async (id, updates) => {
        try {
            const response = await fetch(API_ENDPOINTS.UPDATE_TRADE(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const result = await response.json();
            
            if (result.updated) {
                displayTrades();
            }
        } catch (error) {
            console.error('Error updating trade:', error);
        }
    };

    const deleteTrade = async (id) => {
        try {
            const response = await fetch(API_ENDPOINTS.DELETE_TRADE(id), {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.deleted) {
                displayTrades();
            }
        } catch (error) {
            console.error('Error deleting trade:', error);
        }
    };

    // Initialize
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    displayTrades();
});

// Utility Functions
function showItemInfo(element) {
    element.querySelector('.item-info').style.display = 'block';
}

function hideItemInfo(element) {
    element.querySelector('.item-info').style.display = 'none';
}
