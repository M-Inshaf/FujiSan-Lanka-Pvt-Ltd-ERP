class InventoryModule {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindUI();
    this.setupEventListeners();
    this.renderInventory();
  }

  async loadData() {
    try {
      this.data = await storage.readAll('inventory');
      this.filteredData = [...this.data];
    } catch (e) {
      console.error('Load data failed:', e);
    }
  }

  bindUI() {
    const summary = this.calculateSummary();
    document.getElementById('total-items').textContent = summary.totalItems;
    document.getElementById('total-stock-value').textContent = Formatter.formatCurrency(summary.totalValue);
    document.getElementById('critical-stock').textContent = summary.criticalCount;
    document.getElementById('low-stock').textContent = summary.lowCount;
  }

  calculateSummary() {
    let totalValue = 0;
    let criticalCount = 0;
    let lowCount = 0;

    this.data.forEach(item => {
      totalValue += item.stockValue || 0;
      const status = Calculations.calculateReorderStatus(item.currentStock, item.reorderLevel);
      if (status === 'critical') criticalCount++;
      if (status === 'low') lowCount++;
    });

    return {
      totalItems: this.data.length,
      totalValue,
      criticalCount,
      lowCount
    };
  }

  renderInventory() {
    const container = document.getElementById('inventory-table');
    if (!container) return;

    container.innerHTML = this.filteredData.map(item => {
      const status = Calculations.calculateReorderStatus(item.currentStock, item.reorderLevel);
      const statusClass = status === 'critical' ? 'alert-danger' : status === 'low' ? 'alert-warning' : 'success';

      return `
        <tr class="inventory-row ${statusClass}">
          <td>${item.itemName}</td>
          <td>${item.category}</td>
          <td>${item.currentStock}</td>
          <td>${item.reorderLevel}</td>
          <td>${Formatter.formatCurrency(item.unitCost)}</td>
          <td>${Formatter.formatCurrency(item.stockValue)}</td>
          <td>${item.location}</td>
          <td>
            <span class="status-badge">${Formatter.formatStatus(status)}</span>
          </td>
          <td>
            <button class="btn-small" onclick="inventory.editItem('${item.id}')">Edit</button>
            <button class="btn-small btn-danger" onclick="inventory.deleteItem('${item.id}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async createItem(formData) {
    try {
      const stockValue = Calculations.calculateStockValue(
        formData.currentStock,
        formData.unitCost
      );

      const newItem = {
        id: 'INV' + Date.now(),
        ...formData,
        stockValue,
        lastRestocked: new Date().toISOString().split('T')[0]
      };

      await storage.create('inventory', newItem);
      await this.loadData();
      this.bindUI();
      this.renderInventory();
      return true;
    } catch (e) {
      console.error('Create failed:', e);
      return false;
    }
  }

  async updateItem(id, formData) {
    try {
      const item = this.data.find(i => i.id === id);
      if (!item) return false;

      const stockValue = Calculations.calculateStockValue(
        formData.currentStock,
        formData.unitCost
      );

      const updated = {
        ...item,
        ...formData,
        stockValue
      };

      await storage.update('inventory', updated);
      await this.loadData();
      this.bindUI();
      this.renderInventory();
      return true;
    } catch (e) {
      console.error('Update failed:', e);
      return false;
    }
  }

  async deleteItem(id) {
    if (!confirm('Delete this inventory item?')) return;
    try {
      await storage.delete('inventory', id);
      await this.loadData();
      this.bindUI();
      this.renderInventory();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }

  async adjustStock(id, quantityChange, reason) {
    try {
      const item = this.data.find(i => i.id === id);
      if (!item) return false;

      item.currentStock += quantityChange;
      item.stockValue = Calculations.calculateStockValue(item.currentStock, item.unitCost);

      if (!item.adjustmentHistory) item.adjustmentHistory = [];
      item.adjustmentHistory.push({
        date: new Date().toISOString().split('T')[0],
        change: quantityChange,
        reason: reason,
        newStock: item.currentStock
      });

      await storage.update('inventory', item);
      await this.loadData();
      this.bindUI();
      this.renderInventory();
      return true;
    } catch (e) {
      console.error('Adjustment failed:', e);
      return false;
    }
  }

  async recordRestock(id, newStock) {
    try {
      const item = this.data.find(i => i.id === id);
      if (!item) return false;

      const quantityChange = newStock - item.currentStock;
      return this.adjustStock(id, quantityChange, 'Restock');
    } catch (e) {
      console.error('Restock failed:', e);
      return false;
    }
  }

  getCriticalItems() {
    return this.data.filter(item => {
      const status = Calculations.calculateReorderStatus(item.currentStock, item.reorderLevel);
      return status === 'critical';
    });
  }

  getLowStockItems() {
    return this.data.filter(item => {
      const status = Calculations.calculateReorderStatus(item.currentStock, item.reorderLevel);
      return status === 'low';
    });
  }

  editItem(id) {
    const item = this.data.find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('inventory-modal');
    if (modal) {
      document.getElementById('item-name').value = item.itemName;
      document.getElementById('item-category').value = item.category;
      document.getElementById('item-stock').value = item.currentStock;
      document.getElementById('item-cost').value = item.unitCost;
      document.getElementById('item-location').value = item.location;
      document.getElementById('item-reorder').value = item.reorderLevel;
      modal.dataset.itemId = id;
      modal.style.display = 'flex';
    }
  }

  searchInventory(query) {
    this.filteredData = this.data.filter(item =>
      item.itemName.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase())
    );
    this.renderInventory();
  }

  filterByCategory(category) {
    this.filteredData = category === 'all'
      ? [...this.data]
      : this.data.filter(item => item.category === category);
    this.renderInventory();
  }

  filterByStatus(status) {
    if (status === 'critical') {
      this.filteredData = this.getCriticalItems();
    } else if (status === 'low') {
      this.filteredData = this.getLowStockItems();
    } else {
      this.filteredData = [...this.data];
    }
    this.renderInventory();
  }

  setupEventListeners() {
    const createBtn = document.getElementById('create-inventory-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const modal = document.getElementById('inventory-modal');
        if (modal) modal.style.display = 'flex';
      });
    }

    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchInventory(e.target.value));
    }

    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => this.filterByCategory(e.target.value));
    }

    const statusFilter = document.getElementById('inventory-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => this.filterByStatus(e.target.value));
    }

    const exportBtn = document.getElementById('export-inventory-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        ExportManager.generateInventoryReport(this.filteredData);
      });
    }
  }
}

const inventory = new InventoryModule();
