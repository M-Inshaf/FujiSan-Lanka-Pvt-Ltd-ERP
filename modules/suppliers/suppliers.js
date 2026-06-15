class SuppliersModule {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindUI();
    this.setupEventListeners();
    this.renderSuppliers();
  }

  async loadData() {
    try {
      this.data = await storage.readAll('suppliers');
      this.filteredData = [...this.data];
    } catch (e) {
      console.error('Load data failed:', e);
    }
  }

  bindUI() {
    const summary = this.calculateSummary();
    document.getElementById('total-suppliers').textContent = summary.total;
    document.getElementById('total-pending-orders').textContent = summary.pendingOrders;
    document.getElementById('total-order-value').textContent = Formatter.formatCurrency(summary.totalValue);
  }

  calculateSummary() {
    const allOrders = this.data.flatMap(s => s.orders || []);
    return {
      total: this.data.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      totalValue: allOrders.reduce((sum, o) => sum + o.amount, 0)
    };
  }

  renderSuppliers() {
    const container = document.getElementById('suppliers-table');
    if (!container) return;

    container.innerHTML = this.filteredData.map(supplier => {
      const orders = supplier.orders || [];
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      return `
        <tr>
          <td>${supplier.name}</td>
          <td>${supplier.contactPerson}</td>
          <td>${supplier.phone}</td>
          <td>${supplier.paymentTerms}</td>
          <td>${orders.length}</td>
          <td>
            <span class="order-badge ${pendingOrders > 0 ? 'alert' : 'success'}">
              ${pendingOrders} Pending
            </span>
          </td>
          <td>
            <button class="btn-small" onclick="suppliers.viewOrders('${supplier.id}')">Orders</button>
            <button class="btn-small" onclick="suppliers.editSupplier('${supplier.id}')">Edit</button>
            <button class="btn-small btn-danger" onclick="suppliers.deleteSupplier('${supplier.id}')">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async createSupplier(formData) {
    try {
      const newSupplier = {
        id: 'SUP' + Date.now(),
        ...formData,
        orders: []
      };

      await storage.create('suppliers', newSupplier);
      await this.loadData();
      this.bindUI();
      this.renderSuppliers();
      return true;
    } catch (e) {
      console.error('Create failed:', e);
      return false;
    }
  }

  async updateSupplier(id, formData) {
    try {
      const supplier = this.data.find(s => s.id === id);
      if (!supplier) return false;

      const updated = {
        ...supplier,
        ...formData
      };

      await storage.update('suppliers', updated);
      await this.loadData();
      this.bindUI();
      this.renderSuppliers();
      return true;
    } catch (e) {
      console.error('Update failed:', e);
      return false;
    }
  }

  async deleteSupplier(id) {
    if (!confirm('Delete this supplier?')) return;
    try {
      await storage.delete('suppliers', id);
      await this.loadData();
      this.bindUI();
      this.renderSuppliers();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }

  async createOrder(supplierId, orderData) {
    try {
      const supplier = this.data.find(s => s.id === supplierId);
      if (!supplier) return false;

      if (!supplier.orders) supplier.orders = [];

      const newOrder = {
        id: 'ORD' + Date.now(),
        date: orderData.date,
        amount: orderData.amount,
        status: 'pending',
        items: orderData.items || []
      };

      supplier.orders.push(newOrder);
      await storage.update('suppliers', supplier);
      await this.loadData();
      this.bindUI();
      this.renderSuppliers();
      return true;
    } catch (e) {
      console.error('Order creation failed:', e);
      return false;
    }
  }

  async updateOrderStatus(supplierId, orderId, status) {
    try {
      const supplier = this.data.find(s => s.id === supplierId);
      if (!supplier) return false;

      const order = supplier.orders.find(o => o.id === orderId);
      if (!order) return false;

      order.status = status;
      await storage.update('suppliers', supplier);
      await this.loadData();
      this.bindUI();
      this.renderSuppliers();
      return true;
    } catch (e) {
      console.error('Status update failed:', e);
      return false;
    }
  }

  viewOrders(id) {
    const supplier = this.data.find(s => s.id === id);
    if (!supplier) return;

    const modal = document.getElementById('orders-modal');
    if (modal) {
      const content = document.getElementById('orders-content');
      if (content) {
        const orders = supplier.orders || [];
        content.innerHTML = `
          <h3>${supplier.name} - Orders</h3>
          <table class="table-compact">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.id}</td>
                  <td>${Formatter.formatDate(order.date)}</td>
                  <td>${Formatter.formatCurrency(order.amount)}</td>
                  <td><span class="status-badge">${Formatter.formatStatus(order.status)}</span></td>
                  <td>
                    ${order.status === 'pending' ? `
                      <button class="btn-small" onclick="suppliers.updateOrderStatus('${supplier.id}', '${order.id}', 'delivered')">Mark Delivered</button>
                    ` : '✓ Delivered'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      modal.style.display = 'flex';
    }
  }

  editSupplier(id) {
    const supplier = this.data.find(s => s.id === id);
    if (!supplier) return;

    const modal = document.getElementById('supplier-modal');
    if (modal) {
      document.getElementById('supplier-name').value = supplier.name;
      document.getElementById('supplier-contact').value = supplier.contactPerson;
      document.getElementById('supplier-phone').value = supplier.phone;
      document.getElementById('supplier-email').value = supplier.email;
      document.getElementById('supplier-address').value = supplier.address;
      document.getElementById('supplier-payment-terms').value = supplier.paymentTerms;
      modal.dataset.supplierId = id;
      modal.style.display = 'flex';
    }
  }

  searchSuppliers(query) {
    this.filteredData = this.data.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.phone.includes(query) ||
      s.email.toLowerCase().includes(query.toLowerCase())
    );
    this.renderSuppliers();
  }

  setupEventListeners() {
    const createBtn = document.getElementById('create-supplier-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const modal = document.getElementById('supplier-modal');
        if (modal) modal.style.display = 'flex';
      });
    }

    const searchInput = document.getElementById('suppliers-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchSuppliers(e.target.value));
    }

    const exportBtn = document.getElementById('export-suppliers-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {
          'Suppliers': this.filteredData.map(s => ({
            'Name': s.name,
            'Contact': s.contactPerson,
            'Phone': s.phone,
            'Email': s.email,
            'Payment Terms': s.paymentTerms,
            'Orders': (s.orders || []).length
          }))
        };
        ExportManager.exportToExcel(data, 'suppliers-report.xlsx');
      });
    }
  }
}

const suppliers = new SuppliersModule();
