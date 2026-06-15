class CustomersModule {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindUI();
    this.setupEventListeners();
    this.renderCustomers();
  }

  async loadData() {
    try {
      this.data = await storage.readAll('customers');
      this.filteredData = [...this.data];
    } catch (e) {
      console.error('Load data failed:', e);
    }
  }

  bindUI() {
    const summary = this.calculateSummary();
    document.getElementById('total-customers').textContent = summary.total;
    document.getElementById('total-outstanding').textContent = Formatter.formatCurrency(summary.outstanding);
    document.getElementById('total-credit-limit').textContent = Formatter.formatCurrency(summary.creditLimit);
    document.getElementById('avg-balance').textContent = Formatter.formatCurrency(summary.avgBalance);
  }

  calculateSummary() {
    return {
      total: this.data.length,
      outstanding: this.data.reduce((sum, c) => sum + c.outstandingBalance, 0),
      creditLimit: this.data.reduce((sum, c) => sum + c.creditLimit, 0),
      avgBalance: this.data.length > 0
        ? this.data.reduce((sum, c) => sum + c.outstandingBalance, 0) / this.data.length
        : 0
    };
  }

  renderCustomers() {
    const container = document.getElementById('customers-table');
    if (!container) return;

    container.innerHTML = this.filteredData.map(customer => `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.contactPerson}</td>
        <td>${customer.phone}</td>
        <td>${customer.email}</td>
        <td>${Formatter.formatCurrency(customer.creditLimit)}</td>
        <td>
          <span class="balance-badge ${customer.outstandingBalance > 0 ? 'alert' : 'success'}">
            ${Formatter.formatCurrency(customer.outstandingBalance)}
          </span>
        </td>
        <td>
          <button class="btn-small" onclick="customers.viewStatement('${customer.id}')">Statement</button>
          <button class="btn-small" onclick="customers.editCustomer('${customer.id}')">Edit</button>
          <button class="btn-small btn-danger" onclick="customers.deleteCustomer('${customer.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async createCustomer(formData) {
    try {
      const newCustomer = {
        id: 'CUST' + Date.now(),
        ...formData,
        outstandingBalance: 0,
        transactions: []
      };

      await storage.create('customers', newCustomer);
      await this.loadData();
      this.bindUI();
      this.renderCustomers();
      return true;
    } catch (e) {
      console.error('Create failed:', e);
      return false;
    }
  }

  async updateCustomer(id, formData) {
    try {
      const customer = this.data.find(c => c.id === id);
      if (!customer) return false;

      const updated = {
        ...customer,
        ...formData
      };

      await storage.update('customers', updated);
      await this.loadData();
      this.bindUI();
      this.renderCustomers();
      return true;
    } catch (e) {
      console.error('Update failed:', e);
      return false;
    }
  }

  async deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    try {
      await storage.delete('customers', id);
      await this.loadData();
      this.bindUI();
      this.renderCustomers();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }

  async recordTransaction(customerId, transaction) {
    try {
      const customer = this.data.find(c => c.id === customerId);
      if (!customer) return false;

      customer.transactions.push(transaction);
      
      const balance = Calculations.calculateOutstandingBalance(customer.transactions);
      customer.outstandingBalance = balance;

      await storage.update('customers', customer);
      await this.loadData();
      this.bindUI();
      this.renderCustomers();
      return true;
    } catch (e) {
      console.error('Transaction failed:', e);
      return false;
    }
  }

  async recordInvoice(customerId, amount) {
    const transaction = {
      date: new Date().toISOString().split('T')[0],
      type: 'invoice',
      amount: amount,
      balance: 0
    };
    return this.recordTransaction(customerId, transaction);
  }

  async recordPayment(customerId, amount) {
    const transaction = {
      date: new Date().toISOString().split('T')[0],
      type: 'payment',
      amount: amount,
      balance: 0
    };
    return this.recordTransaction(customerId, transaction);
  }

  viewStatement(id) {
    const customer = this.data.find(c => c.id === id);
    if (!customer) return;

    const modal = document.getElementById('statement-modal');
    if (modal) {
      const content = document.getElementById('statement-content');
      if (content) {
        content.innerHTML = `
          <h3>${customer.name}</h3>
          <p><strong>Contact:</strong> ${customer.contactPerson}</p>
          <p><strong>Phone:</strong> ${customer.phone}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Outstanding Balance:</strong> ${Formatter.formatCurrency(customer.outstandingBalance)}</p>
          <hr/>
          <h4>Transaction History</h4>
          <table class="table-compact">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${customer.transactions.map(tx => `
                <tr>
                  <td>${Formatter.formatDate(tx.date)}</td>
                  <td>${Formatter.formatStatus(tx.type)}</td>
                  <td>${Formatter.formatCurrency(tx.amount)}</td>
                  <td>${Formatter.formatCurrency(tx.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      modal.style.display = 'flex';
    }
  }

  editCustomer(id) {
    const customer = this.data.find(c => c.id === id);
    if (!customer) return;
    const modal = document.getElementById('customer-modal');
    if (modal) {
      document.getElementById('customer-name').value = customer.name;
      document.getElementById('customer-contact').value = customer.contactPerson;
      document.getElementById('customer-phone').value = customer.phone;
      document.getElementById('customer-email').value = customer.email;
      document.getElementById('customer-address').value = customer.address;
      document.getElementById('customer-credit-limit').value = customer.creditLimit;
      modal.dataset.customerId = id;
      modal.style.display = 'flex';
    }
  }

  searchCustomers(query) {
    this.filteredData = this.data.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    );
    this.renderCustomers();
  }

  async generateStatement(customerId) {
    const customer = this.data.find(c => c.id === customerId);
    if (!customer) return;
    await ExportManager.generateCustomerStatement(customer);
  }

  setupEventListeners() {
    const createBtn = document.getElementById('create-customer-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const modal = document.getElementById('customer-modal');
        if (modal) modal.style.display = 'flex';
      });
    }

    const searchInput = document.getElementById('customers-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchCustomers(e.target.value));
    }

    const exportBtn = document.getElementById('export-customers-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {
          'Customers': this.filteredData.map(c => ({
            'Name': c.name,
            'Contact': c.contactPerson,
            'Phone': c.phone,
            'Email': c.email,
            'Credit Limit': `LKR ${c.creditLimit}`,
            'Outstanding': `LKR ${c.outstandingBalance.toFixed(2)}`
          }))
        };
        ExportManager.exportToExcel(data, 'customers-report.xlsx');
      });
    }
  }
}

const customers = new CustomersModule();
