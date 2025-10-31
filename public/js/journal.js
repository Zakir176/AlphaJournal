class TradingJournal {
    constructor() {
        this.entries = this.loadEntries();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setTodayDate();
        this.renderEntries();
        this.updateStats();
        this.setupTheme();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('tradeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEntry();
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        // Image upload
        document.getElementById('tradeImage').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Remove image
        document.getElementById('removeImage').addEventListener('click', () => {
            this.clearImagePreview();
        });

        // Filters
        document.getElementById('filterType').addEventListener('change', () => {
            this.renderEntries();
        });

        document.getElementById('sortBy').addEventListener('change', () => {
            this.renderEntries();
        });

        // Export CSV
        document.getElementById('exportCSV').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Close modal on backdrop click
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });
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

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tradeDate').value = today;
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                const previewImage = document.getElementById('previewImage');
                previewImage.src = e.target.result;
                preview.classList.add('show');
            };
            reader.readAsDataURL(file);
        }
    }

    clearImagePreview() {
        document.getElementById('tradeImage').value = '';
        document.getElementById('imagePreview').classList.remove('show');
        document.getElementById('previewImage').src = '';
    }

    addEntry() {
        const formData = this.getFormData();
        if (!formData) return;

        const entry = {
            id: Date.now().toString(),
            date: formData.date,
            desc: formData.desc.trim(),
            amount: parseFloat(formData.amount),
            image: document.getElementById('previewImage').src || null
        };

        this.entries.unshift(entry);
        this.saveEntries();
        this.renderEntries();
        this.updateStats();
        this.clearForm();
        
        // Show success feedback
        this.showNotification('Trade added successfully!', 'success');
    }

    getFormData() {
        const date = document.getElementById('tradeDate').value;
        const amount = document.getElementById('tradeAmount').value;
        const desc = document.getElementById('tradeDesc').value;

        if (!date || !amount || !desc) {
            this.showNotification('Please fill in all required fields', 'error');
            return null;
        }

        return { date, amount, desc };
    }

    clearForm() {
        document.getElementById('tradeForm').reset();
        this.setTodayDate();
        this.clearImagePreview();
    }

    editEntry(id) {
        const entry = this.entries.find(e => e.id === id);
        if (!entry) return;

        this.currentEditId = id;
        document.getElementById('editId').value = id;
        document.getElementById('editDate').value = entry.date;
        document.getElementById('editAmount').value = entry.amount;
        document.getElementById('editDesc').value = entry.desc;

        this.openModal();
    }

    saveEdit() {
        const id = document.getElementById('editId').value;
        const entryIndex = this.entries.findIndex(e => e.id === id);
        
        if (entryIndex === -1) return;

        const formData = this.getEditFormData();
        if (!formData) return;

        this.entries[entryIndex] = {
            ...this.entries[entryIndex],
            date: formData.date,
            amount: parseFloat(formData.amount),
            desc: formData.desc.trim()
        };

        this.saveEntries();
        this.renderEntries();
        this.updateStats();
        this.closeModal();
        
        this.showNotification('Trade updated successfully!', 'success');
    }

    getEditFormData() {
        const date = document.getElementById('editDate').value;
        const amount = document.getElementById('editAmount').value;
        const desc = document.getElementById('editDesc').value;

        if (!date || !amount || !desc) {
            this.showNotification('Please fill in all required fields', 'error');
            return null;
        }

        return { date, amount, desc };
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this trade entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== id);
            this.saveEntries();
            this.renderEntries();
            this.updateStats();
            this.showNotification('Trade deleted successfully!', 'success');
        }
    }

    getFilteredAndSortedEntries() {
        const filterType = document.getElementById('filterType').value;
        const sortBy = document.getElementById('sortBy').value;

        let filtered = [...this.entries];

        // Apply filters
        if (filterType === 'profit') {
            filtered = filtered.filter(entry => entry.amount > 0);
        } else if (filterType === 'loss') {
            filtered = filtered.filter(entry => entry.amount < 0);
        }

        // Apply sorting
        switch (sortBy) {
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'amount-desc':
                filtered.sort((a, b) => b.amount - a.amount);
                break;
            case 'amount-asc':
                filtered.sort((a, b) => a.amount - b.amount);
                break;
        }

        return filtered;
    }

    renderEntries() {
        const container = document.getElementById('entriesContainer');
        const emptyState = document.getElementById('emptyState');
        const entries = this.getFilteredAndSortedEntries();

        if (entries.length === 0) {
            container.style.display = 'none';
            emptyState.classList.add('show');
            return;
        }

        container.style.display = 'grid';
        emptyState.classList.remove('show');

        container.innerHTML = entries.map(entry => this.createEntryCard(entry)).join('');
    }

    createEntryCard(entry) {
        const isProfit = entry.amount >= 0;
        const amountClass = isProfit ? 'amount-profit' : 'amount-loss';
        const amountSign = isProfit ? '+' : '';
        
        return `
            <div class="entry-card ${isProfit ? 'profit' : 'loss'}">
                <div class="entry-header">
                    <div class="entry-date">${this.formatDate(entry.date)}</div>
                    <div class="entry-amount ${amountClass}">
                        ${amountSign}$${Math.abs(entry.amount).toFixed(2)}
                    </div>
                </div>
                <div class="entry-desc">${this.escapeHtml(entry.desc)}</div>
                ${entry.image ? `
                    <img src="${entry.image}" alt="Trade screenshot" class="entry-image" 
                         onclick="journal.viewImage('${entry.image}')">
                ` : ''}
                <div class="entry-actions">
                    <button class="action-btn edit-btn" onclick="journal.editEntry('${entry.id}')">
                        Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="journal.deleteEntry('${entry.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    viewImage(src) {
        window.open(src, '_blank');
    }

    updateStats() {
        const totalTrades = this.entries.length;
        const totalProfit = this.entries
            .filter(entry => entry.amount > 0)
            .reduce((sum, entry) => sum + entry.amount, 0);
        const totalLoss = this.entries
            .filter(entry => entry.amount < 0)
            .reduce((sum, entry) => sum + entry.amount, 0);

        document.getElementById('totalTrades').textContent = totalTrades;
        document.getElementById('totalProfit').textContent = `$${totalProfit.toFixed(2)}`;
        document.getElementById('totalLoss').textContent = `$${Math.abs(totalLoss).toFixed(2)}`;
    }

    exportToCSV() {
        if (this.entries.length === 0) {
            this.showNotification('No entries to export', 'error');
            return;
        }

        const headers = ['Date', 'Description', 'Profit/Loss', 'Image'];
        const csvData = this.entries.map(entry => [
            entry.date,
            `"${entry.desc.replace(/"/g, '""')}"`,
            entry.amount,
            entry.image ? 'Yes' : 'No'
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

    openModal() {
        document.getElementById('editModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('show');
        this.currentEditId = null;
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveEntries() {
        try {
            localStorage.setItem('tradingEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error saving entries:', error);
            this.showNotification('Error saving entries', 'error');
        }
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            ${type === 'success' ? 'background: var(--success);' : 'background: var(--danger);'}
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the journal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.journal = new TradingJournal();
});