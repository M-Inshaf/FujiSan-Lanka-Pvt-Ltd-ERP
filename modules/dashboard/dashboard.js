class DashboardModule {
  constructor() {
    this.data = null;
    this.metrics = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindUI();
    this.setupEventListeners();
    this.renderDashboard();
  }

  async loadData() {
    try {
      const stores = ['subGarments', 'customers', 'suppliers', 'inventory', 
                      'productionCosting', 'expenses', 'staff', 'cheques'];
      this.data = {};
      
      for (const store of stores) {
        this.data[store] = await storage.readAll(store);
      }
    } catch (e) {
      console.error('Load data failed:', e);
    }
  }

  calculateMetrics() {
    this.metrics = Calculations.calculateDashboardMetrics(this.data);
    return this.metrics;
  }

  bindUI() {
    const metrics = this.calculateMetrics();
    
    const bindings = {
      'total-customers': metrics.totalCustomers,
      'total-suppliers': metrics.totalSuppliers,
      'inventory-value': Formatter.formatCurrency(metrics.totalInventoryValue),
      'outstanding-balance': Formatter.formatCurrency(metrics.totalOutstanding),
      'active-staff': metrics.activeStaff,
      'total-expenses': Formatter.formatCurrency(metrics.totalExpenses),
      'pending-cheques': metrics.pendingCheques,
      'completed-subgarments': metrics.completedSubGarments
    };

    Object.keys(bindings).forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = bindings[id];
    });
  }

  renderDashboard() {
    this.renderRecentSubGarments();
    this.renderOutstandingCustomers();
    this.renderLowStockItems();
    this.renderUpcomingPayments();
  }

  renderRecentSubGarments() {
    const container = document.getElementById('recent-subgarments');
    if (!container) return;

    const recent = this.data.subGarments?.slice(-5).reverse() || [];
    container.innerHTML = recent.map(sg => `
      <div class="dashboard-item">
        <div class="item-header">
          <span>${sg.invoiceNumber}</span>
          <span class="status-badge">${Formatter.formatStatus(sg.status)}</span>
        </div>
        <p class="item-detail">Agent: ${sg.agentName}</p>
        <p class="item-detail">Amount: ${Formatter.formatCurrency(sg.grossBill)}</p>
      </div>
    `).join('');
  }

  renderOutstandingCustomers() {
    const container = document.getElementById('outstanding-customers');
    if (!container) return;

    const outstanding = (this.data.customers || [])
      .filter(c => c.outstandingBalance > 0)
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
      .slice(0, 5);

    container.innerHTML = outstanding.map(c => `
      <div class="dashboard-item">
        <div class="item-header">
          <span>${c.name}</span>
        </div>
        <p class="item-detail">Balance: ${Formatter.formatCurrency(c.outstandingBalance)}</p>
        <p class="item-detail">Contact: ${c.phone}</p>
      </div>
    `).join('');
  }

  renderLowStockItems() {
    const container = document.getElementById('low-stock-items');
    if (!container) return;

    const lowStock = (this.data.inventory || [])
      .filter(inv => inv.currentStock <= inv.reorderLevel)
      .slice(0, 5);

    container.innerHTML = lowStock.map(item => `
      <div class="dashboard-item alert-warning">
        <div class="item-header">
          <span>${item.itemName}</span>
        </div>
        <p class="item-detail">Stock: ${item.currentStock} (Reorder: ${item.reorderLevel})</p>
        <p class="item-detail">Category: ${item.category}</p>
      </div>
    `).join('');
  }

  renderUpcomingPayments() {
    const container = document.getElementById('upcoming-payments');
    if (!container) return;

    const pending = (this.data.cheques || [])
      .filter(c => c.status === 'pending')
      .slice(0, 5);

    container.innerHTML = pending.map(cheque => `
      <div class="dashboard-item">
        <div class="item-header">
          <span>Cheque #${cheque.chequeNumber}</span>
        </div>
        <p class="item-detail">Amount: ${Formatter.formatCurrency(cheque.amount)}</p>
        <p class="item-detail">Payee: ${cheque.payee}</p>
        <p class="item-detail">Date: ${Formatter.formatDate(cheque.issueDate)}</p>
      </div>
    `).join('');
  }

  setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.init();
      });
    }

    const exportBtn = document.getElementById('export-dashboard');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        ExportManager.exportToExcel(this.data, 'dashboard-export.xlsx');
      });
    }
  }

  async refreshData() {
    await this.loadData();
    this.bindUI();
    this.renderDashboard();
  }
}

const dashboard = new DashboardModule();
