class ProductionCostingModule {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindUI();
    this.setupEventListeners();
    this.renderCosting();
  }

  async loadData() {
    try {
      this.data = await storage.readAll('productionCosting');
      this.filteredData = [...this.data];
    } catch (e) {
      console.error('Load data failed:', e);
    }
  }

  bindUI() {
    const summary = this.calculateSummary();
    document.getElementById('total-processes').textContent = summary.totalProcesses;
    document.getElementById('avg-rate').textContent = Formatter.formatCurrency(summary.avgRate);
    document.getElementById('total-cost').textContent = Formatter.formatCurrency(summary.totalCost);
  }

  calculateSummary() {
    const totalProcesses = this.data.length;
    const totalRate = this.data.reduce((sum, p) => sum + p.ratePerUnit, 0);
    const avgRate = totalProcesses > 0 ? totalRate / totalProcesses : 0;
    const totalCost = totalRate;

    return {
      totalProcesses,
      avgRate,
      totalCost
    };
  }

  renderCosting() {
    const container = document.getElementById('costing-table');
    if (!container) return;

    container.innerHTML = this.filteredData.map(process => `
      <tr>
        <td>${process.process}</td>
        <td>${Formatter.formatCurrency(process.ratePerUnit)}</td>
        <td>${Formatter.formatDate(process.applicableFrom)}</td>
        <td>
          <button class="btn-small" onclick="productionCosting.editProcess('${process.id}')">Edit</button>
          <button class="btn-small btn-danger" onclick="productionCosting.deleteProcess('${process.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async createProcess(formData) {
    try {
      const newProcess = {
        id: 'PC' + Date.now(),
        ...formData,
        applicableFrom: formData.applicableFrom || new Date().toISOString().split('T')[0]
      };

      await storage.create('productionCosting', newProcess);
      await this.loadData();
      this.bindUI();
      this.renderCosting();
      return true;
    } catch (e) {
      console.error('Create failed:', e);
      return false;
    }
  }

  async updateProcess(id, formData) {
    try {
      const process = this.data.find(p => p.id === id);
      if (!process) return false;

      const updated = {
        ...process,
        ...formData
      };

      await storage.update('productionCosting', updated);
      await this.loadData();
      this.bindUI();
      this.renderCosting();
      return true;
    } catch (e) {
      console.error('Update failed:', e);
      return false;
    }
  }

  async deleteProcess(id) {
    if (!confirm('Delete this process?')) return;
    try {
      await storage.delete('productionCosting', id);
      await this.loadData();
      this.bindUI();
      this.renderCosting();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }

  calculateProductionCost(quantity, processId) {
    const process = this.data.find(p => p.id === processId);
    if (!process) return 0;
    return Calculations.calculateProductionCost(quantity, process.ratePerUnit);
  }

  calculateTotalCost(quantity) {
    const total = this.data.reduce((sum, process) => {
      return sum + Calculations.calculateProductionCost(quantity, process.ratePerUnit);
    }, 0);
    return total;
  }

  getCostBreakdown(quantity) {
    return this.data.map(process => ({
      process: process.process,
      ratePerUnit: process.ratePerUnit,
      quantity: quantity,
      totalCost: Calculations.calculateProductionCost(quantity, process.ratePerUnit)
    }));
  }

  editProcess(id) {
    const process = this.data.find(p => p.id === id);
    if (!process) return;

    const modal = document.getElementById('costing-modal');
    if (modal) {
      document.getElementById('process-name').value = process.process;
      document.getElementById('process-rate').value = process.ratePerUnit;
      document.getElementById('process-date').value = process.applicableFrom;
      modal.dataset.processId = id;
      modal.style.display = 'flex';
    }
  }

  searchCosting(query) {
    this.filteredData = this.data.filter(p =>
      p.process.toLowerCase().includes(query.toLowerCase())
    );
    this.renderCosting();
  }

  sortByRate(ascending = true) {
    this.filteredData = [...this.filteredData].sort((a, b) =>
      ascending ? a.ratePerUnit - b.ratePerUnit : b.ratePerUnit - a.ratePerUnit
    );
    this.renderCosting();
  }

  generateCostCalculator() {
    const container = document.getElementById('cost-calculator');
    if (!container) return;

    container.innerHTML = `
      <div class="cost-calculator-form">
        <label>Quantity:</label>
        <input type="number" id="calc-quantity" placeholder="Enter quantity" min="1" />
        <button onclick="productionCosting.calculateAndDisplay()">Calculate</button>
      </div>
      <div id="cost-breakdown" style="margin-top: 20px;"></div>
    `;
  }

  calculateAndDisplay() {
    const quantityInput = document.getElementById('calc-quantity');
    if (!quantityInput) return;

    const quantity = parseInt(quantityInput.value);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const breakdown = this.getCostBreakdown(quantity);
    const total = this.calculateTotalCost(quantity);

    const container = document.getElementById('cost-breakdown');
    if (container) {
      container.innerHTML = `
        <table class="table-compact">
          <thead>
            <tr>
              <th>Process</th>
              <th>Rate/Unit</th>
              <th>Quantity</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${breakdown.map(item => `
              <tr>
                <td>${item.process}</td>
                <td>${Formatter.formatCurrency(item.ratePerUnit)}</td>
                <td>${item.quantity}</td>
                <td>${Formatter.formatCurrency(item.totalCost)}</td>
              </tr>
            `).join('')}
            <tr style="background: #f5f5f5; font-weight: bold;">
              <td colspan="3">Total Production Cost:</td>
              <td>${Formatter.formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      `;
    }
  }

  setupEventListeners() {
    const createBtn = document.getElementById('create-costing-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const modal = document.getElementById('costing-modal');
        if (modal) modal.style.display = 'flex';
      });
    }

    const searchInput = document.getElementById('costing-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchCosting(e.target.value));
    }

    const calculatorBtn = document.getElementById('open-calculator-btn');
    if (calculatorBtn) {
      calculatorBtn.addEventListener('click', () => this.generateCostCalculator());
    }

    const exportBtn = document.getElementById('export-costing-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {
          'Production Costing': this.filteredData.map(p => ({
            'Process': p.process,
            'Rate Per Unit': `LKR ${p.ratePerUnit.toFixed(2)}`,
            'Applicable From': Formatter.formatDate(p.applicableFrom)
          }))
        };
        ExportManager.exportToExcel(data, 'production-costing-report.xlsx');
      });
    }
  }
}

const productionCosting = new ProductionCostingModule();
