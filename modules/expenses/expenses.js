/**
 * HUMMINGBIRD CLOTHING ERP - EXPENSES MODULE
 * modules/expenses/expenses.js
 * 
 * Complete expense management system following Sub Garments architecture
 * Features: CRUD operations, categorization, filtering, cost analysis, PDF/Excel export
 */

class ExpensesModule {
  constructor() {
    this.storageKey = 'expenses';
    this.categoryKey = 'expenseCategories';
    this.expensesTable = null;
    this.categoryFilter = null;
    this.dateRangeStart = null;
    this.dateRangeEnd = null;
    this.expenses = [];
    this.categories = this.initializeCategories();
    this.init();
  }

  /**
   * Initialize default expense categories based on business model
   */
  initializeCategories() {
    const defaultCategories = [
      { id: 'raw-materials', name: 'Raw Materials', color: '#3B82F6' },
      { id: 'labor', name: 'Labor Costs', color: '#10B981' },
      { id: 'utilities', name: 'Utilities', color: '#F59E0B' },
      { id: 'rent', name: 'Rent & Facilities', color: '#EF4444' },
      { id: 'transport', name: 'Transport & Logistics', color: '#8B5CF6' },
      { id: 'maintenance', name: 'Maintenance & Repairs', color: '#EC4899' },
      { id: 'office', name: 'Office Supplies', color: '#14B8A6' },
      { id: 'marketing', name: 'Marketing & Advertising', color: '#F97316' },
      { id: 'insurance', name: 'Insurance', color: '#06B6D4' },
      { id: 'professional', name: 'Professional Services', color: '#6366F1' },
      { id: 'equipment', name: 'Equipment & Tools', color: '#D946EF' },
      { id: 'other', name: 'Other Expenses', color: '#64748B' }
    ];

    // Load from storage or use defaults
    const stored = localStorage.getItem(this.categoryKey);
    return stored ? JSON.parse(stored) : defaultCategories;
  }

  /**
   * Initialize module on page load
   */
  init() {
    this.loadExpenses();
    this.setupEventListeners();
    this.renderExpensesTable();
    this.renderCategoryFilters();
    this.renderCategoryManagement();
    this.updateDashboard();
  }

  /**
   * Load expenses from storage
   */
  loadExpenses() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.expenses = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      this.expenses = [];
    }
  }

  /**
   * Save expenses to storage
   */
  saveExpenses() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.expenses));
      return true;
    } catch (error) {
      console.error('Error saving expenses:', error);
      return false;
    }
  }

  /**
   * Save categories to storage
   */
  saveCategories() {
    try {
      localStorage.setItem(this.categoryKey, JSON.stringify(this.categories));
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  }

  /**
   * Setup event listeners for all interactive elements
   */
  setupEventListeners() {
    // Add expense button
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) {
      addExpenseBtn.addEventListener('click', () => this.showAddExpenseModal());
    }

    // Expense form submission
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
      expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
    }

    // Category filter
    const categoryFilter = document.getElementById('expenseCategoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.renderExpensesTable();
      });
    }

    // Date range filters
    const dateRangeStart = document.getElementById('expenseDateRangeStart');
    const dateRangeEnd = document.getElementById('expenseDateRangeEnd');
    if (dateRangeStart) {
      dateRangeStart.addEventListener('change', (e) => {
        this.dateRangeStart = e.target.value;
        this.renderExpensesTable();
      });
    }
    if (dateRangeEnd) {
      dateRangeEnd.addEventListener('change', (e) => {
        this.dateRangeEnd = e.target.value;
        this.renderExpensesTable();
      });
    }

    // Search functionality
    const searchInput = document.getElementById('expenseSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderExpensesTable(e.target.value.toLowerCase());
      });
    }

    // Export buttons
    const exportPdfBtn = document.getElementById('exportExpensesPdf');
    const exportExcelBtn = document.getElementById('exportExpensesExcel');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportToPdf());
    }
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => this.exportToExcel());
    }

    // Add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => this.showAddCategoryModal());
    }

    // Category form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
      categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
    }
  }

  /**
   * Show add expense modal
   */
  showAddExpenseModal() {
    const modal = document.getElementById('expenseModal');
    const form = document.getElementById('expenseForm');
    
    if (modal && form) {
      // Reset form
      form.reset();
      document.getElementById('expenseModalTitle').textContent = 'Add New Expense';
      document.getElementById('expenseId').value = '';
      
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('expenseDate').value = today;
      
      modal.style.display = 'block';
    }
  }

  /**
   * Show edit expense modal
   */
  showEditExpenseModal(id) {
    const expense = this.expenses.find(e => e.id === id);
    if (!expense) return;

    const modal = document.getElementById('expenseModal');
    const form = document.getElementById('expenseForm');
    
    if (modal && form) {
      document.getElementById('expenseModalTitle').textContent = 'Edit Expense';
      document.getElementById('expenseId').value = expense.id;
      document.getElementById('expenseDate').value = expense.date;
      document.getElementById('expenseCategory').value = expense.category;
      document.getElementById('expenseDescription').value = expense.description;
      document.getElementById('expenseAmount').value = expense.amount;
      document.getElementById('expenseNotes').value = expense.notes || '';
      document.getElementById('expensePaymentMethod').value = expense.paymentMethod || 'cash';
      
      modal.style.display = 'block';
    }
  }

  /**
   * Handle expense form submission
   */
  handleExpenseSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('expenseId').value;
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const notes = document.getElementById('expenseNotes').value;
    const paymentMethod = document.getElementById('expensePaymentMethod').value;

    if (!date || !category || !description || !amount || amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (id) {
      // Update existing expense
      const index = this.expenses.findIndex(e => e.id === id);
      if (index !== -1) {
        this.expenses[index] = {
          id,
          date,
          category,
          description,
          amount,
          notes,
          paymentMethod,
          createdAt: this.expenses[index].createdAt,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // Create new expense
      const newExpense = {
        id: this.generateId(),
        date,
        category,
        description,
        amount,
        notes,
        paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.expenses.push(newExpense);
    }

    this.saveExpenses();
    this.renderExpensesTable();
    this.updateDashboard();
    
    const modal = document.getElementById('expenseModal');
    if (modal) modal.style.display = 'none';
  }

  /**
   * Delete expense
   */
  deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    this.expenses = this.expenses.filter(e => e.id !== id);
    this.saveExpenses();
    this.renderExpensesTable();
    this.updateDashboard();
  }

  /**
   * Render expenses table with filtering and sorting
   */
  renderExpensesTable(searchTerm = '') {
    const container = document.getElementById('expensesTableContainer');
    if (!container) return;

    // Filter expenses
    let filtered = this.expenses.filter(expense => {
      const matchesCategory = !this.categoryFilter || expense.category === this.categoryFilter;
      const matchesDate = (!this.dateRangeStart || expense.date >= this.dateRangeStart) &&
                         (!this.dateRangeEnd || expense.date <= this.dateRangeEnd);
      const matchesSearch = !searchTerm || 
                           expense.description.toLowerCase().includes(searchTerm) ||
                           expense.notes.toLowerCase().includes(searchTerm);
      
      return matchesCategory && matchesDate && matchesSearch;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">No expenses found</div>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount (LKR)</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.forEach(expense => {
      const category = this.categories.find(c => c.id === expense.category);
      const categoryName = category ? category.name : 'Unknown';
      const categoryColor = category ? category.color : '#666';
      const formattedAmount = this.formatCurrency(expense.amount);
      const formattedDate = this.formatDate(expense.date);

      html += `
        <tr>
          <td>${formattedDate}</td>
          <td>
            <span class="badge" style="background-color: ${categoryColor}20; color: ${categoryColor}; border: 1px solid ${categoryColor}">
              ${categoryName}
            </span>
          </td>
          <td>${expense.description}</td>
          <td class="amount">${formattedAmount}</td>
          <td>${this.formatPaymentMethod(expense.paymentMethod)}</td>
          <td class="actions">
            <button class="btn-icon" onclick="window.expensesModule.showEditExpenseModal('${expense.id}')" title="Edit">
              <i class="icon-edit"></i>
            </button>
            <button class="btn-icon delete" onclick="window.expensesModule.deleteExpense('${expense.id}')" title="Delete">
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
   * Render category filter dropdown
   */
  renderCategoryFilters() {
    const filterSelect = document.getElementById('expenseCategoryFilter');
    if (!filterSelect) return;

    let html = '<option value="">All Categories</option>';
    this.categories.forEach(category => {
      html += `<option value="${category.id}">${category.name}</option>`;
    });

    filterSelect.innerHTML = html;
  }

  /**
   * Render category management section
   */
  renderCategoryManagement() {
    const container = document.getElementById('categoryManagementContainer');
    if (!container) return;

    let html = '<div class="category-grid">';
    
    this.categories.forEach(category => {
      html += `
        <div class="category-card" style="border-left: 4px solid ${category.color}">
          <div class="category-header">
            <h4>${category.name}</h4>
            <button class="btn-icon delete" onclick="window.expensesModule.deleteCategory('${category.id}')" title="Delete">
              <i class="icon-delete"></i>
            </button>
          </div>
          <div class="category-color" style="background-color: ${category.color}"></div>
          <p class="category-id">ID: ${category.id}</p>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Show add category modal
   */
  showAddCategoryModal() {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    
    if (modal && form) {
      form.reset();
      document.getElementById('categoryModalTitle').textContent = 'Add New Category';
      document.getElementById('categoryId').value = '';
      document.getElementById('categoryColorInput').value = '#3B82F6';
      modal.style.display = 'block';
    }
  }

  /**
   * Handle category form submission
   */
  handleCategorySubmit(e) {
    e.preventDefault();

    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const color = document.getElementById('categoryColorInput').value;

    if (!name || !color) {
      alert('Please fill in all fields');
      return;
    }

    if (id) {
      // Update existing category
      const index = this.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        this.categories[index] = { id, name, color };
      }
    } else {
      // Create new category
      const categoryId = name.toLowerCase().replace(/\s+/g, '-');
      const newCategory = { id: categoryId, name, color };
      this.categories.push(newCategory);
    }

    this.saveCategories();
    this.renderCategoryFilters();
    this.renderCategoryManagement();
    
    const modal = document.getElementById('categoryModal');
    if (modal) modal.style.display = 'none';
  }

  /**
   * Delete category
   */
  deleteCategory(id) {
    // Prevent deletion of default categories
    if (['raw-materials', 'labor', 'utilities', 'rent', 'transport', 'maintenance', 'office', 'marketing', 'insurance', 'professional', 'equipment', 'other'].includes(id)) {
      alert('Cannot delete default categories');
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    this.categories = this.categories.filter(c => c.id !== id);
    this.saveCategories();
    this.renderCategoryFilters();
    this.renderCategoryManagement();
  }

  /**
   * Calculate total expenses
   */
  calculateTotalExpenses(expenses = this.expenses) {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Calculate expenses by category
   */
  calculateExpensesByCategory() {
    const byCategory = {};
    
    this.categories.forEach(category => {
      byCategory[category.id] = {
        name: category.name,
        color: category.color,
        total: 0,
        count: 0
      };
    });

    this.expenses.forEach(expense => {
      if (byCategory[expense.category]) {
        byCategory[expense.category].total += expense.amount;
        byCategory[expense.category].count += 1;
      }
    });

    return byCategory;
  }

  /**
   * Calculate monthly expenses
   */
  calculateMonthlyExpenses() {
    const byMonth = {};

    this.expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM format
      if (!byMonth[month]) {
        byMonth[month] = 0;
      }
      byMonth[month] += expense.amount;
    });

    return byMonth;
  }

  /**
   * Update dashboard with expense metrics
   */
  updateDashboard() {
    const totalExpensesElem = document.getElementById('totalExpenses');
    const monthlyExpensesElem = document.getElementById('monthlyExpenses');
    const categoryBreakdownElem = document.getElementById('expenseCategoryBreakdown');

    if (totalExpensesElem) {
      const total = this.calculateTotalExpenses();
      totalExpensesElem.textContent = this.formatCurrency(total);
    }

    if (monthlyExpensesElem) {
      const monthly = this.calculateMonthlyExpenses();
      const currentMonth = new Date().toISOString().substring(0, 7);
      const monthlyTotal = monthly[currentMonth] || 0;
      monthlyExpensesElem.textContent = this.formatCurrency(monthlyTotal);
    }

    if (categoryBreakdownElem) {
      const byCategory = this.calculateExpensesByCategory();
      let html = '<div class="category-breakdown">';
      
      Object.values(byCategory)
        .filter(cat => cat.count > 0)
        .sort((a, b) => b.total - a.total)
        .forEach(cat => {
          const percentage = (cat.total / this.calculateTotalExpenses() * 100).toFixed(1);
          html += `
            <div class="breakdown-item">
              <div class="breakdown-label">
                <span class="dot" style="background-color: ${cat.color}"></span>
                ${cat.name}
              </div>
              <div class="breakdown-value">${this.formatCurrency(cat.total)}</div>
              <div class="breakdown-percentage">${percentage}%</div>
            </div>
          `;
        });

      html += '</div>';
      categoryBreakdownElem.innerHTML = html;
    }
  }

  /**
   * Export expenses to PDF
   */
  exportToPdf() {
    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Expenses_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    const data = {
      title: 'Expenses Report',
      expenses: this.expenses,
      categories: this.categories,
      totalExpenses: this.calculateTotalExpenses(),
      byCategory: this.calculateExpensesByCategory(),
      generatedAt: new Date().toLocaleString()
    };

    window.exportModule.generateExpensesPdf(data, filename);
  }

  /**
   * Export expenses to Excel
   */
  exportToExcel() {
    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Expenses_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    const data = {
      expenses: this.expenses,
      categories: this.categories,
      summary: {
        total: this.calculateTotalExpenses(),
        byCategory: this.calculateExpensesByCategory(),
        byMonth: this.calculateMonthlyExpenses()
      }
    };

    window.exportModule.generateExpensesExcel(data, filename);
  }

  /**
   * Helper: Generate unique ID
   */
  generateId() {
    return 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

  /**
   * Helper: Format payment method
   */
  formatPaymentMethod(method) {
    const methods = {
      'cash': 'Cash',
      'cheque': 'Cheque',
      'bank-transfer': 'Bank Transfer',
      'credit-card': 'Credit Card',
      'other': 'Other'
    };
    return methods[method] || 'Unknown';
  }
}

// Initialize module when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.expensesModule = new ExpensesModule();
  });
} else {
  window.expensesModule = new ExpensesModule();
}
