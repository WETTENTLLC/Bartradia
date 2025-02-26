document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tradeForm');
    const tradeList = document.getElementById('tradeList');

    const displayTrades = async () => {
        const response = await fetch('/api/trades');
        const data = await response.json();
        tradeList.innerHTML = data.trades.map(trade => `
            <div class="trade-item" data-id="${trade.id}" onmouseenter="showItemInfo(this)" onmouseleave="hideItemInfo(this)">
                <img src="images/${trade.image}" alt="${trade.name}" class="trade-image">
                <strong>${trade.name}</strong>
                <p>${trade.description}</p>
                <div class="item-info">
                    <p><strong>Value:</strong> ${trade.value}</p>
                    <p><strong>Size:</strong> ${trade.size}</p>
                    <p><strong>Location:</strong> ${trade.location}</p>
                    <p><strong>Seller:</strong> ${trade.seller}</p>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
        attachEventListeners();
    };

    const attachEventListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeElement = e.target.closest('.trade-item');
                const tradeId = tradeElement.dataset.id;
                const tradeName = prompt('Enter new name:', tradeElement.querySelector('strong').innerText);
                const tradeDescription = prompt('Enter new description:', tradeElement.querySelector('p').innerText);
                if (tradeName && tradeDescription) {
                    updateTrade(tradeId, tradeName, tradeDescription);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeElement = e.target.closest('.trade-item');
                const tradeId = tradeElement.dataset.id;
                deleteTrade(tradeId);
            });
        });
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tradeName = document.getElementById('itemName').value;
            const tradeDescription = document.getElementById('itemDescription').value;
            const tradeValue = document.getElementById('itemValue').value;
            const tradeSize = document.getElementById('itemSize').value;
            const tradeLocation = document.getElementById('itemLocation').value;
            const tradeSeller = document.getElementById('itemSeller').value;
            const response = await fetch('/api/trades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: tradeName, description: tradeDescription, value: tradeValue, size: tradeSize, location: tradeLocation, seller: tradeSeller }),
            });
            const result = await response.json();
            if (result.id) {
                displayTrades();
            }
            form.reset();
        });
    }

    const updateTrade = async (id    , name, description, value, size, location, seller) => {
        const response = await fetch(`/api/trades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description, value, size, location, seller }),
        });
        const result = await response.json();
        if (result.updated) {
            displayTrades();
        }
    };

    const deleteTrade = async (id) => {
        const response = await fetch(`/api/trades/${id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (result.deleted) {
            displayTrades();
        }
    };

    displayTrades();
});

function showItemInfo(element) {
    element.querySelector('.item-info').style.display = 'block';
}

function hideItemInfo(element) {
    element.querySelector('.item-info').style.display = 'none';
}
