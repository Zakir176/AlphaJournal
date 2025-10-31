class TradingJournal {
    constructor() {
        this.entries = this.loadEntries();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFlatpickr();
        this.setupFileUpload();
        this.renderTrades();
        this.updateStats();
    }

    loadEntries() {
        try {
            const saved = localStorage.getItem('tradingEntries');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading entries:', error);
            return [];
        }
    }

    saveEntries() {
        try {
            localStorage.setItem('tradingEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving entries:', error);
            this.showNotification('Error saving entries', 'error');
        }
    }

    setupEventListeners() {
        // Form submission
        const tradeForm = document.getElementById('tradeForm');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTrade();
            });
        }

        // Edit form submission
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEdit();
            });
        }

        // Quick actions
        const quickAdd = document.getElementById('quickAdd');
        if (quickAdd) {
            quickAdd.addEventListener('click', () => {
                document.getElementById('tradeForm').scrollIntoView({ behavior: 'smooth' });
            });
        }

        const addFirstTrade = document.getElementById('addFirstTrade');
        if (addFirstTrade) {
            addFirstTrade.addEventListener('click', () => {
                document.getElementById('tradeForm').scrollIntoView({ behavior: 'smooth' });
            });
        }

        const clearForm = document.getElementById('clearForm');
        if (clearForm) {
            clearForm.addEventListener('click', () => {
                this.clearForm();
            });
        }

        const exportTrades = document.getElementById('exportTrades');
        if (exportTrades) {
            exportTrades.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        // Modal controls
        const closeModal = document.getElementById('closeModal');
        const cancelEdit = document.getElementById('cancelEdit');
        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        if (cancelEdit) cancelEdit.addEventListener('click', () => this.closeModal());

        // Search and filter
        const searchInput = document.getElementById('searchTrades');
        const filterSelect = document.getElementById('filterTrades');
        if (searchInput) searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        if (filterSelect) filterSelect.addEventListener('change', () => this.renderTrades());
    }

    setupFlatpickr() {
        const dateInput = document.getElementById('tradeDate');
        if (dateInput) {
            flatpickr(dateInput, {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                defaultDate: new Date(),
                minuteIncrement: 1
            });
        }
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('screenshot');

        if (!uploadArea || !fileInput) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileUpload(files) {
        const previewsContainer = document.getElementById('imagePreviews');
        if (!previewsContainer) return;

        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="remove-image">✕</button>
                    `;
                    previewsContainer.appendChild(preview);

                    preview.querySelector('.remove-image').addEventListener('click', () => {
                        preview.remove();
                    });
                };
                reader.readAsDataURL(file);
            }
        }
    }

    addTrade() {
        const formData = this.getFormData();
        if (!formData) return;

        const trade = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...formData,
            images: this.getUploadedImages()
        };

        this.entries.unshift(trade);
        this.saveEntries();
        this.renderTrades();
        this.updateStats();
        this.clearForm();
        
        this.showNotification('Trade added successfully!', 'success');
    }

    getFormData() {
        const date = document.getElementById('tradeDate').value;
        const symbol = document.getElementById('symbol').value;
        const tradeType = document.getElementById('tradeType').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const entryPrice = parseFloat(document.getElementById('entryPrice').value);
        const exitPrice = parseFloat(document.getElementById('exitPrice').value);
        const pnl = parseFloat(document.getElementById('pnl').value);
        const strategy = document.getElementById('strategy').value;
        const notes = document.getElementById('notes').value;

        if (!date || !symbol || !tradeType || !quantity || !entryPrice || !exitPrice || isNaN(pnl) || !strategy) {
            this.showNotification('Please fill in all required fields', 'error');
            return null;
        }

        return {
            date,
            symbol: symbol.toUpperCase(),
            type: tradeType,
            quantity,
            entryPrice,
            exitPrice,
            pnl,
            strategy,
            notes
        };
    }

    getUploadedImages() {
        const previews = document.querySelectorAll('.image-preview img');
        return Array.from(previews).map(img => img.src);
    }

    clearForm() {
        document.getElementById('tradeForm').reset();
        const previewsContainer = document.getElementById('imagePreviews');
        if (previewsContainer) previewsContainer.innerHTML = '';
        
        // Reset date to current
        const dateInput = document.getElementById('tradeDate');
        if (dateInput._flatpickr) {
            dateInput._flatpickr.setDate(new Date());
        }
    }

    renderTrades() {
        const container = document.getElementById('tradesList');
        const emptyState = document.getElementById('emptyState');
        const trades = this.getFilteredTrades();

        if (trades.length === 0) {
            if (container) container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        if (container) {
            container.innerHTML = trades.map(trade => this.createTradeItem(trade)).join('');
            
            // Add event listeners to action buttons
            container.querySelectorAll('.edit-trade').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.closest('[data-trade-id]').dataset.tradeId;
                    this.editTrade(id);
                });
            });

            container.querySelectorAll('.delete-trade').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.closest('[data-trade-id]').dataset.tradeId;
                    this.deleteTrade(id);
                });
            });
        }
    }

    createTradeItem(trade) {
        const isProfit = trade.pnl >= 0;
        const amountClass = isProfit ? 'positive' : 'negative';
        const amountSign = isProfit ? '+' : '';
        
        return `
            <div class="trade-item ${isProfit ? 'profit' : 'loss'}" data-trade-id="${trade.id}">
                <div class="trade-info">
                    <div class="trade-symbol">${trade.symbol}</div>
                    <div class="trade-details">
                        <div class="trade-detail">
                            <strong>Type:</strong> ${trade.type}
                        </div>
                        <div class="trade-detail">
                            <strong>Qty:</strong> ${trade.quantity}
                        </div>
                        <div class="trade-detail">
                            <strong>Entry:</strong> $${trade.entryPrice.toFixed(4)}
                        </div>
                        <div class="trade-detail">
                            <strong>Exit:</strong> $${trade.exitPrice.toFixed(4)}
                        </div>
                        <div class="trade-detail">
                            <strong>Strategy:</strong> ${trade.strategy}
                        </div>
                    </div>
                </div>
                <div class="trade-amount ${amountClass}">
                    ${amountSign}$${Math.abs(trade.pnl).toFixed(2)}
                </div>
                <div class="trade-actions">
                    <button class="trade-action-btn edit edit-trade">Edit</button>
                    <button class="trade-action-btn delete delete-trade">Delete</button>
                </div>
            </div>
        `;
    }

    getFilteredTrades() {
        const searchTerm = document.getElementById('searchTrades')?.value.toLowerCase() || '';
        const filter = document.getElementById('filterTrades')?.value || 'all';

        let filtered = this.entries.filter(trade => 
            trade.symbol.toLowerCase().includes(searchTerm) ||
            trade.strategy.toLowerCase().includes(searchTerm) ||
            trade.notes.toLowerCase().includes(searchTerm)
        );

        switch (filter) {
            case 'profit':
                filtered = filtered.filter(trade => trade.pnl > 0);
                break;
            case 'loss':
                filtered = filtered.filter(trade => trade.pnl < 0);
                break;
            case 'today':
                const today = new Date().toDateString();
                filtered = filtered.filter(trade => new Date(trade.date).toDateString() === today);
                break;
            case 'week':
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(trade => new Date(trade.date) > weekAgo);
                break;
        }

        return filtered;
    }

    handleSearch(query) {
        this.renderTrades();
    }

    editTrade(id) {
        const trade = this.entries.find(t => t.id === id);
        if (!trade) return;

        this.currentEditId = id;
        
        // Populate edit form
        document.getElementById('editId').value = id;
        document.getElementById('editDate').value = trade.date;
        document.getElementById('editSymbol').value = trade.symbol;
        document.getElementById('editType').value = trade.type;
        document.getElementById('editQuantity').value = trade.quantity;
        document.getElementById('editEntryPrice').value = trade.entryPrice;
        document.getElementById('editExitPrice').value = trade.exitPrice;
        document.getElementById('editPnl').value = trade.pnl;
        document.getElementById('editStrategy').value = trade.strategy;
        document.getElementById('editNotes').value = trade.notes;

        this.openModal();
    }

    openModal() {
        const modal = document.getElementById('editModal');
        if (modal) modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('editModal');
        if (modal) modal.classList.remove('show');
        this.currentEditId = null;
    }

    saveEdit() {
        const id = document.getElementById('editId').value;
        const tradeIndex = this.entries.findIndex(t => t.id === id);
        
        if (tradeIndex === -1) return;

        // Get updated data from form (you'll need to add these fields to your edit form)
        const updatedTrade = {
            ...this.entries[tradeIndex],
            date: document.getElementById('editDate').value,
            symbol: document.getElementById('editSymbol').value,
            type: document.getElementById('editType').value,
            quantity: parseInt(document.getElementById('editQuantity').value),
            entryPrice: parseFloat(document.getElementById('editEntryPrice').value),
            exitPrice: parseFloat(document.getElementById('editExitPrice').value),
            pnl: parseFloat(document.getElementById('editPnl').value),
            strategy: document.getElementById('editStrategy').value,
            notes: document.getElementById('editNotes').value
        };

        this.entries[tradeIndex] = updatedTrade;
        this.saveEntries();
        this.renderTrades();
        this.updateStats();
        this.closeModal();
        
        this.showNotification('Trade updated successfully!', 'success');
    }

    deleteTrade(id) {
        if (confirm('Are you sure you want to delete this trade?')) {
            this.entries = this.entries.filter(trade => trade.id !== id);
            this.saveEntries();
            this.renderTrades();
            this.updateStats();
            this.showNotification('Trade deleted successfully!', 'success');
        }
    }

    updateStats() {
        const totalTrades = this.entries.length;
        const winningTrades = this.entries.filter(trade => trade.pnl > 0).length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
        const totalProfit = this.entries.reduce((sum, trade) => sum + trade.pnl, 0);
        const avgTrade = totalTrades > 0 ? totalProfit / totalTrades : 0;

        // Update UI elements
        const totalProfitElement = document.getElementById('totalProfit');
        const totalTradesElement = document.getElementById('totalTrades');
        const winRateElement = document.getElementById('winRate');
        const avgTradeElement = document.getElementById('avgTrade');

        if (totalProfitElement) totalProfitElement.textContent = `$${totalProfit.toFixed(2)}`;
        if (totalTradesElement) totalTradesElement.textContent = totalTrades;
        if (winRateElement) winRateElement.textContent = `${winRate.toFixed(1)}%`;
        if (avgTradeElement) avgTradeElement.textContent = `$${avgTrade.toFixed(2)}`;
    }

    exportToCSV() {
        if (this.entries.length === 0) {
            this.showNotification('No trades to export', 'error');
            return;
        }

        const headers = ['Date', 'Symbol', 'Type', 'Quantity', 'Entry Price', 'Exit Price', 'P/L', 'Strategy', 'Notes'];
        const csvData = this.entries.map(trade => [
            trade.date,
            trade.symbol,
            trade.type,
            trade.quantity,
            trade.entryPrice,
            trade.exitPrice,
            trade.pnl,
            trade.strategy,
            `"${(trade.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `trading-journal-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('CSV exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border-primary);
            box-shadow: var(--shadow-hover);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        if (type === 'success') {
            notification.style.borderLeft = '4px solid var(--success)';
        } else if (type === 'error') {
            notification.style.borderLeft = '4px solid var(--danger)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the journal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.journal = new TradingJournal();
});