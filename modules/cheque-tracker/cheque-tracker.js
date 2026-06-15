/**
 * HUMMINGBIRD CLOTHING ERP - CHEQUE TRACKER MODULE
 * modules/cheque-tracker/cheque-tracker.js
 * 
 * Complete cheque tracking system following Sub Garments architecture
 * Features: CRUD operations, status tracking, payment reconciliation, bounce alerts, financial analysis
 */

class ChequeTrackerModule {
  constructor() {
    this.storageKey = 'cheques';
    this.cheques = [];
    this.chequeStatuses = ['pending', 'cleared', 'bounced', 'cancelled'];
    this.chequeTypes = ['received', 'issued'];
    this.init();
  }

  /**
   * Initialize module on page load
   */
  init() {
    this.loadCheques();
    this.setupEventListeners();
    this.renderChequesTable();
    this.renderStatusBreakdown();
    this.updateDashboard();
  }

  /**
   * Load cheques from storage
   */
  loadCheques() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.cheques = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cheques:', error);
      this.cheques = [];
    }
  }

  /**
   * Save cheques to storage
   */
  saveCheques() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cheques));
      return true;
    } catch (error) {
      console.error('Error saving cheques:', error);
      return false;
    }
  }

  /**
   * Setup event listeners for all interactive elements
   */
  setupEventListeners() {
    // Add cheque button
    const addChequeBtn = document.getElementById('addChequeBtn');
    if (addChequeBtn) {
      addChequeBtn.addEventListener('click', () => this.showAddChequeModal());
    }

    // Cheque form submission
    const chequeForm = document.getElementById('chequeForm');
    if (chequeForm) {
      chequeForm.addEventListener('submit', (e) => this.handleChequeSubmit(e));
    }

    // Type filter
    const typeFilter = document.getElementById('chequeTypeFilter');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => this.renderChequesTable());
    }

    // Status filter
    const statusFilter = document.getElementById('chequeStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.renderChequesTable());
    }

    // Date range filters
    const dateRangeStart = document.getElementById('chequeDateRangeStart');
    const dateRangeEnd = document.getElementById('chequeDateRangeEnd');
    
    if (dateRangeStart) {
      dateRangeStart.addEventListener('change', () => this.renderChequesTable());
    }
    if (dateRangeEnd) {
      dateRangeEnd.addEventListener('change', () => this.renderChequesTable());
    }

    // Search
    const searchInput = document.getElementById('chequeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderChequesTable(e.target.value.toLowerCase());
      });
    }

    // Export buttons
    const exportPdfBtn = document.getElementById('exportChequesPdf');
    const exportExcelBtn = document.getElementById('exportChequesExcel');
    
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportToPdf());
    }
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => this.exportToExcel());
    }

    // Reconciliation button
    const reconcileBtn = document.getElementById('reconcileChequeBtn');
    if (reconcileBtn) {
      reconcileBtn.addEventListener('click', () => this.showReconciliationModal());
    }
  }

  /**
   * Show add cheque modal
   */
  showAddChequeModal() {
    const modal = document.getElementById('chequeModal');
    const form = document.getElementById('chequeForm');
    
    if (modal && form) {
      form.reset();
      document.getElementById('chequeModalTitle').textContent = 'Add New Cheque';
      document.getElementById('chequeId').value = '';
      document.getElementById('chequeDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('chequeType').value = 'received';
      document.getElementById('chequeStatus').value = 'pending';
      modal.style.display = 'block';
    }
  }

  /**
   * Show edit cheque modal
   */
  showEditChequeModal(id) {
    const cheque = this.cheques.find(c => c.id === id);
    if (!cheque) return;

    const modal = document.getElementById('chequeModal');
    const form = document.getElementById('chequeForm');
    
    if (modal && form) {
      document.getElementById('chequeModalTitle').textContent = 'Edit Cheque';
      document.getElementById('chequeId').value = cheque.id;
      document.getElementById('chequeNumber').value = cheque.number;
      document.getElementById('chequeDate').value = cheque.date;
      document.getElementById('chequeAmount').value = cheque.amount;
      document.getElementById('chequeType').value = cheque.type;
      document.getElementById('chequeStatus').value = cheque.status;
      document.getElementById('chequeBankName').value = cheque.bankName || '';
      document.getElementById('chequeAccountHolder').value = cheque.accountHolder || '';
      document.getElementById('chequeDrawer').value = cheque.drawer || '';
      document.getElementById('chequeDueDate').value = cheque.dueDate || '';
      document.getElementById('chequeNotes').value = cheque.notes || '';
      modal.style.display = 'block';
    }
  }

  /**
   * Handle cheque form submission
   */
  handleChequeSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('chequeId').value;
    const number = document.getElementById('chequeNumber').value;
    const date = document.getElementById('chequeDate').value;
    const amount = parseFloat(document.getElementById('chequeAmount').value);
    const type = document.getElementById('chequeType').value;
    const status = document.getElementById('chequeStatus').value;
    const bankName = document.getElementById('chequeBankName').value;
    const accountHolder = document.getElementById('chequeAccountHolder').value;
    const drawer = document.getElementById('chequeDrawer').value;
    const dueDate = document.getElementById('chequeDueDate').value;
    const notes = document.getElementById('chequeNotes').value;

    if (!number || !date || !amount || amount <= 0 || !type || !status) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate cheque number
    const duplicateExists = this.cheques.some(c => c.number === number && c.id !== id);
    if (duplicateExists) {
      alert('A cheque with this number already exists');
      return;
    }

    if (id) {
      // Update existing cheque
      const index = this.cheques.findIndex(c => c.id === id);
      if (index !== -1) {
        this.cheques[index] = {
          id,
          number,
          date,
          amount,
          type,
          status,
          bankName,
          accountHolder,
          drawer,
          dueDate,
          notes,
          createdAt: this.cheques[index].createdAt,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // Create new cheque
      const newCheque = {
        id: this.generateId(),
        number,
        date,
        amount,
        type,
        status,
        bankName,
        accountHolder,
        drawer,
        dueDate,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.cheques.push(newCheque);
    }

    this.saveCheques();
    this.renderChequesTable();
    this.renderStatusBreakdown();
    this.updateDashboard();
    
    const modal = document.getElementById('chequeModal');
    if (modal) modal.style.display = 'none';
  }

  /**
   * Delete cheque
   */
  deleteCheque(id) {
    if (!confirm('Are you sure you want to delete this cheque record?')) return;

    this.cheques = this.cheques.filter(c => c.id !== id);
    this.saveCheques();
    this.renderChequesTable();
    this.renderStatusBreakdown();
    this.updateDashboard();
  }

  /**
   * Update cheque status
   */
  updateChequeStatus(id, newStatus) {
    const cheque = this.cheques.find(c => c.id === id);
    if (cheque) {
      cheque.status = newStatus;
      cheque.updatedAt = new Date().toISOString();
      
      if (newStatus === 'cleared') {
        cheque.clearedDate = new Date().toISOString();
      }
      
      this.saveCheques();
      this.renderChequesTable();
      this.renderStatusBreakdown();
      this.updateDashboard();
    }
  }

  /**
   * Render cheques table with filtering
   */
  renderChequesTable(searchTerm = '') {
    const container = document.getElementById('chequesTableContainer');
    if (!container) return;

    const typeFilter = document.getElementById('chequeTypeFilter')?.value || '';
    const statusFilter = document.getElementById('chequeStatusFilter')?.value || '';
    const dateRangeStart = document.getElementById('chequeDateRangeStart')?.value || '';
    const dateRangeEnd = document.getElementById('chequeDateRangeEnd')?.value || '';

    let filtered = this.cheques.filter(cheque => {
      const matchesType = !typeFilter || cheque.type === typeFilter;
      const matchesStatus = !statusFilter || cheque.status === statusFilter;
      const matchesDateStart = !dateRangeStart || cheque.date >= dateRangeStart;
      const matchesDateEnd = !dateRangeEnd || cheque.date <= dateRangeEnd;
      const matchesSearch = !searchTerm || 
                           cheque.number.toLowerCase().includes(searchTerm) ||
                           cheque.drawer.toLowerCase().includes(searchTerm) ||
                           cheque.accountHolder.toLowerCase().includes(searchTerm);
      
      return matchesType && matchesStatus && matchesDateStart && matchesDateEnd && matchesSearch;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">No cheques found</div>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Cheque #</th>
            <th>Date</th>
            <th>Amount (LKR)</th>
            <th>Type</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.forEach(cheque => {
      const statusColor = this.getStatusColor(cheque.status);
      const statusText = cheque.status.charAt(0).toUpperCase() + cheque.status.slice(1);
      const typeText = cheque.type === 'received' ? 'Received' : 'Issued';
      const formattedDate = this.formatDate(cheque.date);
      const formattedDueDate = cheque.dueDate ? this.formatDate(cheque.dueDate) : '-';
      const formattedAmount = this.formatCurrency(cheque.amount);

      html += `
        <tr class="cheque-row ${cheque.status}">
          <td><strong>${cheque.number}</strong></td>
          <td>${formattedDate}</td>
          <td class="amount">${formattedAmount}</td>
          <td>${typeText}</td>
          <td>
            <span class="badge" style="background-color: ${statusColor}20; color: ${statusColor}">
              ${statusText}
            </span>
          </td>
          <td>${formattedDueDate}</td>
          <td class="actions">
            <button class="btn-icon" onclick="window.chequeTrackerModule.showEditChequeModal('${cheque.id}')" title="Edit">
              <i class="icon-edit"></i>
            </button>
            ${cheque.status === 'pending' ? `
              <button class="btn-icon" onclick="window.chequeTrackerModule.updateChequeStatus('${cheque.id}', 'cleared')" title="Mark as Cleared">
                <i class="icon-check"></i>
              </button>
            ` : ''}
            ${cheque.status === 'pending' ? `
              <button class="btn-icon warning" onclick="window.chequeTrackerModule.updateChequeStatus('${cheque.id}', 'bounced')" title="Mark as Bounced">
                <i class="icon-alert"></i>
              </button>
            ` : ''}
            <button class="btn-icon delete" onclick="window.chequeTrackerModule.deleteCheque('${cheque.id}')" title="Delete">
              <i class="icon-delete"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  /**
   * Render status breakdown chart
   */
  renderStatusBreakdown() {
    const container = document.getElementById('chequeStatusBreakdown');
    if (!container) return;

    const breakdown = this.calculateStatusBreakdown();
    
    let html = '<div class="status-breakdown">';
    
    Object.entries(breakdown).forEach(([status, data]) => {
      const percentage = this.calculateTotalAmount() > 0 ? (data.amount / this.calculateTotalAmount() * 100).toFixed(1) : 0;
      const statusColor = this.getStatusColor(status);
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);

      html += `
        <div class="breakdown-item">
          <div class="breakdown-label">
            <span class="dot" style="background-color: ${statusColor}"></span>
            ${statusText}
          </div>
          <div class="breakdown-value">${this.formatCurrency(data.amount)}</div>
          <div class="breakdown-count">${data.count} cheques</div>
          <div class="breakdown-percentage">${percentage}%</div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Show reconciliation modal
   */
  showReconciliationModal() {
    const modal = document.getElementById('reconciliationModal');
    if (modal) {
      this.renderReconciliationReport();
      modal.style.display = 'block';
    }
  }

  /**
   * Render reconciliation report
   */
  renderReconciliationReport() {
    const container = document.getElementById('reconciliationReport');
    if (!container) return;

    const received = this.cheques.filter(c => c.type === 'received');
    const issued = this.cheques.filter(c => c.type === 'issued');
    
    const receivedCleared = received.filter(c => c.status === 'cleared');
    const issuedCleared = issued.filter(c => c.status === 'cleared');
    
    const receivedPending = received.filter(c => c.status === 'pending');
    const issuedPending = issued.filter(c => c.status === 'pending');
    
    const receivedBounced = received.filter(c => c.status === 'bounced');
    const issuedBounced = issued.filter(c => c.status === 'bounced');

    const receivedTotal = received.reduce((sum, c) => sum + c.amount, 0);
    const issuedTotal = issued.reduce((sum, c) => sum + c.amount, 0);
    
    const receivedClearedAmount = receivedCleared.reduce((sum, c) => sum + c.amount, 0);
    const issuedClearedAmount = issuedCleared.reduce((sum, c) => sum + c.amount, 0);
    
    const receivedPendingAmount = receivedPending.reduce((sum, c) => sum + c.amount, 0);
    const issuedPendingAmount = issuedPending.reduce((sum, c) => sum + c.amount, 0);
    
    const receivedBouncedAmount = receivedBounced.reduce((sum, c) => sum + c.amount, 0);
    const issuedBouncedAmount = issuedBounced.reduce((sum, c) => sum + c.amount, 0);

    let html = `
      <div class="reconciliation-report">
        <h3>Cheque Reconciliation Report</h3>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
        
        <div class="reconciliation-section">
          <h4>Cheques Received</h4>
          <table class="reconciliation-table">
            <tr>
              <td>Total Received Cheques</td>
              <td class="amount">${this.formatCurrency(receivedTotal)}</td>
            </tr>
            <tr class="highlight">
              <td>Cleared</td>
              <td class="amount">${this.formatCurrency(receivedClearedAmount)}</td>
            </tr>
            <tr>
              <td>Pending</td>
              <td class="amount">${this.formatCurrency(receivedPendingAmount)}</td>
            </tr>
            <tr class="alert">
              <td>Bounced</td>
              <td class="amount">${this.formatCurrency(receivedBouncedAmount)}</td>
            </tr>
          </table>
        </div>

        <div class="reconciliation-section">
          <h4>Cheques Issued</h4>
          <table class="reconciliation-table">
            <tr>
              <td>Total Issued Cheques</td>
              <td class="amount">${this.formatCurrency(issuedTotal)}</td>
            </tr>
            <tr class="highlight">
              <td>Cleared</td>
              <td class="amount">${this.formatCurrency(issuedClearedAmount)}</td>
            </tr>
            <tr>
              <td>Pending</td>
              <td class="amount">${this.formatCurrency(issuedPendingAmount)}</td>
            </tr>
            <tr class="alert">
              <td>Bounced</td>
              <td class="amount">${this.formatCurrency(issuedBouncedAmount)}</td>
            </tr>
          </table>
        </div>

        <div class="reconciliation-section">
          <h4>Summary</h4>
          <table class="reconciliation-table">
            <tr class="total">
              <td>Net Position</td>
              <td class="amount">${this.formatCurrency(receivedTotal - issuedTotal)}</td>
            </tr>
            <tr>
              <td>Outstanding Amount (Pending + Bounced)</td>
              <td class="amount">${this.formatCurrency((receivedPendingAmount + receivedBouncedAmount) - (issuedPendingAmount + issuedBouncedAmount))}</td>
            </tr>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Calculate total amount
   */
  calculateTotalAmount() {
    return this.cheques.reduce((sum, cheque) => sum + cheque.amount, 0);
  }

  /**
   * Calculate status breakdown
   */
  calculateStatusBreakdown() {
    const breakdown = {
      pending: { amount: 0, count: 0 },
      cleared: { amount: 0, count: 0 },
      bounced: { amount: 0, count: 0 },
      cancelled: { amount: 0, count: 0 }
    };

    this.cheques.forEach(cheque => {
      if (breakdown[cheque.status]) {
        breakdown[cheque.status].amount += cheque.amount;
        breakdown[cheque.status].count += 1;
      }
    });

    return breakdown;
  }

  /**
   * Calculate overdue cheques
   */
  calculateOverdueCheques() {
    const today = new Date().toISOString().split('T')[0];
    return this.cheques.filter(c => 
      c.dueDate && c.dueDate < today && c.status === 'pending'
    );
  }

  /**
   * Update dashboard with cheque metrics
   */
  updateDashboard() {
    const totalChequesElem = document.getElementById('totalCheques');
    const pendingChequesElem = document.getElementById('pendingCheques');
    const clearedChequesElem = document.getElementById('clearedCheques');
    const bouncedChequesElem = document.getElementById('bouncedCheques');
    const pendingAmountElem = document.getElementById('pendingAmount');
    const overdueElem = document.getElementById('overdueCheques');

    const breakdown = this.calculateStatusBreakdown();
    const overdue = this.calculateOverdueCheques();

    if (totalChequesElem) {
      totalChequesElem.textContent = this.cheques.length;
    }

    if (pendingChequesElem) {
      pendingChequesElem.textContent = breakdown.pending.count;
    }

    if (clearedChequesElem) {
      clearedChequesElem.textContent = breakdown.cleared.count;
    }

    if (bouncedChequesElem) {
      bouncedChequesElem.textContent = breakdown.bounced.count;
    }

    if (pendingAmountElem) {
      pendingAmountElem.textContent = this.formatCurrency(breakdown.pending.amount);
    }

    if (overdueElem) {
      overdueElem.textContent = overdue.length;
      if (overdue.length > 0) {
        overdueElem.parentElement?.classList.add('alert-badge');
      }
    }
  }

  /**
   * Get status color
   */
  getStatusColor(status) {
    const colors = {
      'pending': '#F59E0B',
      'cleared': '#10B981',
      'bounced': '#EF4444',
      'cancelled': '#6B7280'
    };
    return colors[status] || '#6B7280';
  }

  /**
   * Export cheques to PDF
   */
  exportToPdf() {
    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Cheque_Tracker_${new Date().toISOString().split('T')[0]}.pdf`;
    const breakdown = this.calculateStatusBreakdown();
    const data = {
      title: 'Cheque Tracker Report',
      cheques: this.cheques,
      breakdown: breakdown,
      totalAmount: this.calculateTotalAmount(),
      overdue: this.calculateOverdueCheques(),
      generatedAt: new Date().toLocaleString('en-LK')
    };

    window.exportModule.generateChequeTrackerPdf(data, filename);
  }

  /**
   * Export cheques to Excel
   */
  exportToExcel() {
    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Cheque_Tracker_${new Date().toISOString().split('T')[0]}.xlsx`;
    const breakdown = this.calculateStatusBreakdown();
    const data = {
      cheques: this.cheques,
      summary: {
        totalCheques: this.cheques.length,
        totalAmount: this.calculateTotalAmount(),
        breakdown: breakdown,
        overdue: this.calculateOverdueCheques()
      }
    };

    window.exportModule.generateChequeTrackerExcel(data, filename);
  }

  /**
   * Helper: Generate unique ID
   */
  generateId() {
    return 'chq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Helper: Format currency (LKR)
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Helper: Format date
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Initialize module when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chequeTrackerModule = new ChequeTrackerModule();
  });
} else {
  window.chequeTrackerModule = new ChequeTrackerModule();
}
