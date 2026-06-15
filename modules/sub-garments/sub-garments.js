class SubGarmentsModule {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.currentTab = 'overview';
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindUI();
    this.setupEventListeners();
    this.renderOverview();
  }

  async loadData() {
    try {
      this.data = await storage.readAll('subGarments');
      this.filteredData = [...this.data];
    } catch (e) {
      console.error('Load data failed:', e);
    }
  }

  bindUI() {
    const summary = this.calculateSummary();
    document.getElementById('total-subgarments').textContent = summary.total;
    document.getElementById('completed-count').textContent = summary.completed;
    document.getElementById('pending-count').textContent = summary.pending;
    document.getElementById('total-amount').textContent = Formatter.formatCurrency(summary.totalAmount);
    document.getElementById('outstanding-amount').textContent = Formatter.formatCurrency(summary.outstanding);
  }

  calculateSummary() {
    return {
      total: this.data.length,
      completed: this.data.filter(sg => sg.status === 'completed').length,
      pending: this.data.filter(sg => sg.status === 'pending').length,
      totalAmount: this.data.reduce((sum, sg) => sum + sg.grossBill, 0),
      outstanding: this.data
        .filter(sg => !sg.paymentReceipt)
        .reduce((sum, sg) => sum + sg.grossBill, 0)
    };
  }

  renderOverview() {
    const container = document.getElementById('subgarments-overview');
    if (!container) return;

    container.innerHTML = this.filteredData.map((sg, idx) => `
      <tr>
        <td><input type="checkbox" class="sg-checkbox" data-id="${sg.id}"></td>
        <td>${sg.invoiceNumber}</td>
        <td>${sg.agentName}</td>
        <td>${Formatter.formatDate(sg.issueDate)}</td>
        <td>${sg.quantity}</td>
        <td>${sg.expectedQty}</td>
        <td>${sg.gradeA}</td>
        <td>${sg.damaged}</td>
        <td>${sg.shortage}</td>
        <td>${Formatter.formatCurrency(sg.grossBill)}</td>
        <td><span class="status-badge">${Formatter.formatStatus(sg.status)}</span></td>
        <td>
          <button class="btn-small" data-id="${sg.id}" onclick="subGarments.editSubGarment('${sg.id}')">Edit</button>
          <button class="btn-small btn-danger" data-id="${sg.id}" onclick="subGarments.deleteSubGarment('${sg.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async createSubGarment(formData) {
    try {
      const expectedQty = Calculations.calculateExpectedQty(
        formData.layers,
        formData.sizesPerLayer,
        formData.quantityPerSize
      );

      const shortage = Calculations.calculateShortage(
        expectedQty,
        formData.gradeA,
        formData.damaged,
        formData.waste || 0
      );

      const grossBill = Calculations.calculateGrossBill(
        formData.gradeA,
        formData.damaged,
        formData.ratePerUnit
      );

      const newSubGarment = {
        id: 'SG' + Date.now(),
        ...formData,
        expectedQty,
        shortage,
        grossBill,
        status: 'pending',
        finishingReceipt: null,
        paymentReceipt: null
      };

      await storage.create('subGarments', newSubGarment);
      await this.loadData();
      this.bindUI();
      this.renderOverview();
      return true;
    } catch (e) {
      console.error('Create failed:', e);
      return false;
    }
  }

  async updateSubGarment(id, formData) {
    try {
      const sg = this.data.find(s => s.id === id);
      if (!sg) return false;

      const expectedQty = Calculations.calculateExpectedQty(
        formData.layers,
        formData.sizesPerLayer,
        formData.quantityPerSize
      );

      const shortage = Calculations.calculateShortage(
        expectedQty,
        formData.gradeA,
        formData.damaged,
        formData.waste || 0
      );

      const grossBill = Calculations.calculateGrossBill(
        formData.gradeA,
        formData.damaged,
        formData.ratePerUnit
      );

      const updated = {
        ...sg,
        ...formData,
        expectedQty,
        shortage,
        grossBill
      };

      await storage.update('subGarments', updated);
      await this.loadData();
      this.bindUI();
      this.renderOverview();
      return true;
    } catch (e) {
      console.error('Update failed:', e);
      return false;
    }
  }

  async deleteSubGarment(id) {
    if (!confirm('Delete this Sub Garment?')) return;
    try {
      await storage.delete('subGarments', id);
      await this.loadData();
      this.bindUI();
      this.renderOverview();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }

  async recordFinishingReceipt(id, receiptData) {
    try {
      const sg = this.data.find(s => s.id === id);
      if (!sg) return false;

      sg.finishingReceipt = {
        receivedDate: receiptData.receivedDate,
        quantity: receiptData.quantity,
        notes: receiptData.notes
      };
      sg.status = 'completed';

      await storage.update('subGarments', sg);
      await this.loadData();
      this.bindUI();
      this.renderOverview();
      return true;
    } catch (e) {
      console.error('Receipt failed:', e);
      return false;
    }
  }

  async recordPayment(id, paymentData) {
    try {
      const sg = this.data.find(s => s.id === id);
      if (!sg) return false;

      sg.paymentReceipt = {
        date: paymentData.date,
        amount: paymentData.amount,
        method: paymentData.method
      };

      await storage.update('subGarments', sg);
      await this.loadData();
      this.bindUI();
      this.renderOverview();
      return true;
    } catch (e) {
      console.error('Payment recording failed:', e);
      return false;
    }
  }

  searchSubGarments(query) {
    this.filteredData = this.data.filter(sg =>
      sg.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
      sg.agentName.toLowerCase().includes(query.toLowerCase())
    );
    this.renderOverview();
  }

  filterByStatus(status) {
    this.filteredData = status === 'all'
      ? [...this.data]
      : this.data.filter(sg => sg.status === status);
    this.renderOverview();
  }

  async generatePDF(id) {
    const sg = this.data.find(s => s.id === id);
    if (!sg) return;
    await ExportManager.generateSubGarmentsPDF(sg);
  }

  async exportToExcel() {
    const data = {
      'Sub Garments': this.filteredData.map(sg => ({
        'Invoice': sg.invoiceNumber,
        'Agent': sg.agentName,
        'Quantity': sg.quantity,
        'Expected': sg.expectedQty,
        'Grade A': sg.gradeA,
        'Damaged': sg.damaged,
        'Shortage': sg.shortage,
        'Amount': `LKR ${sg.grossBill.toFixed(2)}`,
        'Status': sg.status
      }))
    };
    ExportManager.exportToExcel(data, 'sub-garments-report.xlsx');
  }

  setupEventListeners() {
    const createBtn = document.getElementById('create-subgarment-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.openCreateModal());
    }

    const searchInput = document.getElementById('subgarments-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchSubGarments(e.target.value));
    }

    const filterSelect = document.getElementById('status-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => this.filterByStatus(e.target.value));
    }

    const exportBtn = document.getElementById('export-subgarments-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportToExcel());
    }
  }

  openCreateModal() {
    const modal = document.getElementById('subgarment-modal');
    if (modal) modal.style.display = 'flex';
  }

  editSubGarment(id) {
    const sg = this.data.find(s => s.id === id);
    if (!sg) return;
    // Populate form with sg data
    const modal = document.getElementById('subgarment-modal');
    if (modal) modal.style.display = 'flex';
  }
}

const subGarments = new SubGarmentsModule();
