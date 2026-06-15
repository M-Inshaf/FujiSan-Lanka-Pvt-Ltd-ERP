/**
 * HUMMINGBIRD CLOTHING ERP - REPORTS MODULE
 * modules/reports/reports.js
 * 
 * Comprehensive reporting system following Sub Garments architecture
 * Features: Financial reports, inventory analysis, production reports, custom report generation
 */

class ReportsModule {
  constructor() {
    this.reportTypes = [
      { id: 'financial-summary', name: 'Financial Summary', category: 'Financial' },
      { id: 'income-statement', name: 'Income Statement', category: 'Financial' },
      { id: 'expense-breakdown', name: 'Expense Breakdown', category: 'Financial' },
      { id: 'profit-loss', name: 'Profit & Loss Analysis', category: 'Financial' },
      { id: 'inventory-summary', name: 'Inventory Summary', category: 'Inventory' },
      { id: 'low-stock-alert', name: 'Low Stock Alert', category: 'Inventory' },
      { id: 'inventory-value', name: 'Inventory Valuation', category: 'Inventory' },
      { id: 'production-summary', name: 'Production Summary', category: 'Production' },
      { id: 'production-costs', name: 'Production Costs Analysis', category: 'Production' },
      { id: 'garment-performance', name: 'Garment Performance', category: 'Production' },
      { id: 'sales-summary', name: 'Sales Summary', category: 'Sales' },
      { id: 'customer-analysis', name: 'Customer Analysis', category: 'Sales' },
      { id: 'supplier-performance', name: 'Supplier Performance', category: 'Procurement' },
      { id: 'staff-payroll', name: 'Staff & Payroll', category: 'HR' }
    ];
    this.selectedReportType = null;
    this.dateRangeStart = null;
    this.dateRangeEnd = null;
    this.init();
  }

  /**
   * Initialize module on page load
   */
  init() {
    this.setupEventListeners();
    this.renderReportTypeSelector();
    this.renderQuickReports();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Report type selection
    const reportTypeButtons = document.querySelectorAll('[data-report-type]');
    reportTypeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reportType = e.currentTarget.getAttribute('data-report-type');
        this.generateReport(reportType);
      });
    });

    // Date range filters
    const dateRangeStart = document.getElementById('reportDateRangeStart');
    const dateRangeEnd = document.getElementById('reportDateRangeEnd');
    
    if (dateRangeStart) {
      dateRangeStart.addEventListener('change', (e) => {
        this.dateRangeStart = e.target.value;
      });
    }
    
    if (dateRangeEnd) {
      dateRangeEnd.addEventListener('change', (e) => {
        this.dateRangeEnd = e.target.value;
      });
    }

    // Generate custom report button
    const generateBtn = document.getElementById('generateCustomReportBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateCustomReport());
    }

    // Export buttons
    const exportPdfBtn = document.getElementById('exportReportPdf');
    const exportExcelBtn = document.getElementById('exportReportExcel');
    
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportCurrentReportPdf());
    }
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => this.exportCurrentReportExcel());
    }

    // Print button
    const printBtn = document.getElementById('printReportBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }
  }

  /**
   * Render report type selector grid
   */
  renderReportTypeSelector() {
    const container = document.getElementById('reportTypesContainer');
    if (!container) return;

    const categories = {};
    this.reportTypes.forEach(report => {
      if (!categories[report.category]) {
        categories[report.category] = [];
      }
      categories[report.category].push(report);
    });

    let html = '';
    Object.entries(categories).forEach(([category, reports]) => {
      html += `<div class="report-category"><h3>${category}</h3><div class="report-grid">`;
      
      reports.forEach(report => {
        html += `
          <button class="report-card" data-report-type="${report.id}" onclick="window.reportsModule.generateReport('${report.id}')">
            <div class="report-icon">📊</div>
            <div class="report-name">${report.name}</div>
          </button>
        `;
      });

      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  /**
   * Render quick access reports
   */
  renderQuickReports() {
    const container = document.getElementById('quickReportsContainer');
    if (!container) return;

    const quickReports = [
      { id: 'financial-summary', name: 'Financial Summary' },
      { id: 'inventory-summary', name: 'Inventory Summary' },
      { id: 'production-summary', name: 'Production Summary' }
    ];

    let html = '<div class="quick-reports">';
    quickReports.forEach(report => {
      html += `
        <div class="quick-report-item" onclick="window.reportsModule.generateReport('${report.id}')">
          <h4>${report.name}</h4>
          <p>Click to generate</p>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  }

  /**
   * Generate report based on type
   */
  generateReport(reportType) {
    this.selectedReportType = reportType;
    const reportContainer = document.getElementById('reportContainer');
    
    if (!reportContainer) return;

    let reportHtml = '';

    switch(reportType) {
      case 'financial-summary':
        reportHtml = this.generateFinancialSummary();
        break;
      case 'income-statement':
        reportHtml = this.generateIncomeStatement();
        break;
      case 'expense-breakdown':
        reportHtml = this.generateExpenseBreakdown();
        break;
      case 'profit-loss':
        reportHtml = this.generateProfitLoss();
        break;
      case 'inventory-summary':
        reportHtml = this.generateInventorySummary();
        break;
      case 'low-stock-alert':
        reportHtml = this.generateLowStockAlert();
        break;
      case 'inventory-value':
        reportHtml = this.generateInventoryValuation();
        break;
      case 'production-summary':
        reportHtml = this.generateProductionSummary();
        break;
      case 'production-costs':
        reportHtml = this.generateProductionCosts();
        break;
      case 'garment-performance':
        reportHtml = this.generateGarmentPerformance();
        break;
      case 'sales-summary':
        reportHtml = this.generateSalesSummary();
        break;
      case 'customer-analysis':
        reportHtml = this.generateCustomerAnalysis();
        break;
      case 'supplier-performance':
        reportHtml = this.generateSupplierPerformance();
        break;
      case 'staff-payroll':
        reportHtml = this.generateStaffPayroll();
        break;
      default:
        reportHtml = '<div class="report-placeholder">Report type not found</div>';
    }

    reportContainer.innerHTML = reportHtml;
  }

  /**
   * Generate Financial Summary Report
   */
  generateFinancialSummary() {
    const expenses = this.getStoredData('expenses') || [];
    const customers = this.getStoredData('customers') || [];
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(2) : 0;

    return `
      <div class="report-header">
        <h2>Financial Summary Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <div class="report-section">
        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Total Revenue</h4>
            <p class="metric-value">${this.formatCurrency(totalRevenue)}</p>
          </div>
          <div class="metric-card">
            <h4>Total Expenses</h4>
            <p class="metric-value">${this.formatCurrency(totalExpenses)}</p>
          </div>
          <div class="metric-card">
            <h4>Net Profit</h4>
            <p class="metric-value">${this.formatCurrency(netProfit)}</p>
          </div>
          <div class="metric-card">
            <h4>Profit Margin</h4>
            <p class="metric-value">${margin}%</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate Income Statement
   */
  generateIncomeStatement() {
    const customers = this.getStoredData('customers') || [];
    const subGarments = this.getStoredData('subGarments') || [];
    
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
    const costOfGoods = subGarments.reduce((sum, sg) => sum + ((sg.productionCost || 0) * (sg.quantity || 0)), 0);
    const grossProfit = totalRevenue - costOfGoods;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue * 100).toFixed(2) : 0;

    return `
      <div class="report-header">
        <h2>Income Statement</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <tr>
          <td><strong>Total Revenue</strong></td>
          <td class="amount">${this.formatCurrency(totalRevenue)}</td>
        </tr>
        <tr class="subtotal">
          <td><strong>Cost of Goods Sold</strong></td>
          <td class="amount">${this.formatCurrency(costOfGoods)}</td>
        </tr>
        <tr class="total">
          <td><strong>Gross Profit</strong></td>
          <td class="amount">${this.formatCurrency(grossProfit)}</td>
        </tr>
        <tr>
          <td><strong>Gross Profit Margin</strong></td>
          <td class="amount">${grossMargin}%</td>
        </tr>
      </table>
    `;
  }

  /**
   * Generate Expense Breakdown
   */
  generateExpenseBreakdown() {
    const expenses = this.getStoredData('expenses') || [];
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const byCategory = {};
    expenses.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += exp.amount;
    });

    let html = `
      <div class="report-header">
        <h2>Expense Breakdown Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount (LKR)</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
    `;

    Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, amount]) => {
        const percentage = (amount / totalExpenses * 100).toFixed(2);
        html += `
          <tr>
            <td>${category}</td>
            <td class="amount">${this.formatCurrency(amount)}</td>
            <td>${percentage}%</td>
          </tr>
        `;
      });

    html += `
        </tbody>
        <tfoot>
          <tr class="total">
            <td><strong>Total Expenses</strong></td>
            <td class="amount"><strong>${this.formatCurrency(totalExpenses)}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    return html;
  }

  /**
   * Generate Profit & Loss Analysis
   */
  generateProfitLoss() {
    const customers = this.getStoredData('customers') || [];
    const expenses = this.getStoredData('expenses') || [];
    
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(2) : 0;

    return `
      <div class="report-header">
        <h2>Profit & Loss Analysis</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <tr>
          <td><strong>Total Revenue</strong></td>
          <td class="amount">${this.formatCurrency(totalRevenue)}</td>
        </tr>
        <tr class="subtotal">
          <td><strong>Less: Total Expenses</strong></td>
          <td class="amount">${this.formatCurrency(totalExpenses)}</td>
        </tr>
        <tr class="total">
          <td><strong>Net Profit/Loss</strong></td>
          <td class="amount ${netProfit >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(netProfit)}</td>
        </tr>
        <tr>
          <td><strong>Profit Margin</strong></td>
          <td class="amount">${profitMargin}%</td>
        </tr>
      </table>
    `;
  }

  /**
   * Generate Inventory Summary
   */
  generateInventorySummary() {
    const inventory = this.getStoredData('inventory') || [];
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    const lowStock = inventory.filter(item => (item.quantity || 0) < (item.minStock || 10)).length;

    return `
      <div class="report-header">
        <h2>Inventory Summary Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total Items</h4>
          <p class="metric-value">${totalItems}</p>
        </div>
        <div class="metric-card">
          <h4>Total Inventory Value</h4>
          <p class="metric-value">${this.formatCurrency(totalValue)}</p>
        </div>
        <div class="metric-card">
          <h4>Low Stock Items</h4>
          <p class="metric-value">${lowStock}</p>
        </div>
        <div class="metric-card">
          <h4>Average Item Value</h4>
          <p class="metric-value">${this.formatCurrency(totalItems > 0 ? totalValue / totalItems : 0)}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate Low Stock Alert
   */
  generateLowStockAlert() {
    const inventory = this.getStoredData('inventory') || [];
    const lowStock = inventory.filter(item => (item.quantity || 0) < (item.minStock || 10));

    let html = `
      <div class="report-header">
        <h2>Low Stock Alert Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
    `;

    if (lowStock.length === 0) {
      html += '<div class="empty-state">All items have adequate stock levels</div>';
      return html;
    }

    html += `
      <table class="report-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Current Stock</th>
            <th>Minimum Stock</th>
            <th>Shortage</th>
          </tr>
        </thead>
        <tbody>
    `;

    lowStock.forEach(item => {
      const shortage = (item.minStock || 10) - (item.quantity || 0);
      html += `
        <tr class="alert-row">
          <td>${item.name || 'Unknown'}</td>
          <td>${item.quantity || 0}</td>
          <td>${item.minStock || 10}</td>
          <td class="alert">${shortage}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }

  /**
   * Generate Inventory Valuation
   */
  generateInventoryValuation() {
    const inventory = this.getStoredData('inventory') || [];
    const totalValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);

    let html = `
      <div class="report-header">
        <h2>Inventory Valuation Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price (LKR)</th>
            <th>Total Value (LKR)</th>
          </tr>
        </thead>
        <tbody>
    `;

    inventory
      .sort((a, b) => ((b.quantity || 0) * (b.unitPrice || 0)) - ((a.quantity || 0) * (a.unitPrice || 0)))
      .forEach(item => {
        const itemValue = (item.quantity || 0) * (item.unitPrice || 0);
        html += `
          <tr>
            <td>${item.name || 'Unknown'}</td>
            <td>${item.quantity || 0}</td>
            <td>${this.formatCurrency(item.unitPrice || 0)}</td>
            <td class="amount">${this.formatCurrency(itemValue)}</td>
          </tr>
        `;
      });

    html += `
        </tbody>
        <tfoot>
          <tr class="total">
            <td colspan="3"><strong>Total Inventory Value</strong></td>
            <td class="amount"><strong>${this.formatCurrency(totalValue)}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    return html;
  }

  /**
   * Generate Production Summary
   */
  generateProductionSummary() {
    const subGarments = this.getStoredData('subGarments') || [];
    const totalProduced = subGarments.reduce((sum, sg) => sum + (sg.quantity || 0), 0);
    const totalCost = subGarments.reduce((sum, sg) => sum + ((sg.productionCost || 0) * (sg.quantity || 0)), 0);
    const avgCost = totalProduced > 0 ? totalCost / totalProduced : 0;

    return `
      <div class="report-header">
        <h2>Production Summary Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total Units Produced</h4>
          <p class="metric-value">${totalProduced}</p>
        </div>
        <div class="metric-card">
          <h4>Total Production Cost</h4>
          <p class="metric-value">${this.formatCurrency(totalCost)}</p>
        </div>
        <div class="metric-card">
          <h4>Average Cost per Unit</h4>
          <p class="metric-value">${this.formatCurrency(avgCost)}</p>
        </div>
        <div class="metric-card">
          <h4>Total Garment Types</h4>
          <p class="metric-value">${subGarments.length}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate Production Costs Report
   */
  generateProductionCosts() {
    const subGarments = this.getStoredData('subGarments') || [];

    let html = `
      <div class="report-header">
        <h2>Production Costs Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <thead>
          <tr>
            <th>Garment Type</th>
            <th>Quantity</th>
            <th>Cost per Unit</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
    `;

    subGarments
      .sort((a, b) => ((b.productionCost || 0) * (b.quantity || 0)) - ((a.productionCost || 0) * (a.quantity || 0)))
      .forEach(garment => {
        const totalCost = (garment.productionCost || 0) * (garment.quantity || 0);
        html += `
          <tr>
            <td>${garment.garmentType || 'Unknown'}</td>
            <td>${garment.quantity || 0}</td>
            <td>${this.formatCurrency(garment.productionCost || 0)}</td>
            <td class="amount">${this.formatCurrency(totalCost)}</td>
          </tr>
        `;
      });

    const totalCost = subGarments.reduce((sum, sg) => sum + ((sg.productionCost || 0) * (sg.quantity || 0)), 0);

    html += `
        </tbody>
        <tfoot>
          <tr class="total">
            <td colspan="3"><strong>Total Production Cost</strong></td>
            <td class="amount"><strong>${this.formatCurrency(totalCost)}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    return html;
  }

  /**
   * Generate Garment Performance
   */
  generateGarmentPerformance() {
    const subGarments = this.getStoredData('subGarments') || [];

    let html = `
      <div class="report-header">
        <h2>Garment Performance Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <thead>
          <tr>
            <th>Garment Type</th>
            <th>Quantity Produced</th>
            <th>Production Status</th>
            <th>Quality Score</th>
          </tr>
        </thead>
        <tbody>
    `;

    subGarments.forEach(garment => {
      html += `
        <tr>
          <td>${garment.garmentType || 'Unknown'}</td>
          <td>${garment.quantity || 0}</td>
          <td>${garment.status || 'Pending'}</td>
          <td>${garment.qualityScore || 0}/100</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }

  /**
   * Generate Sales Summary
   */
  generateSalesSummary() {
    const customers = this.getStoredData('customers') || [];
    const totalSales = customers.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
    const avgSale = customers.length > 0 ? totalSales / customers.length : 0;

    return `
      <div class="report-header">
        <h2>Sales Summary Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total Customers</h4>
          <p class="metric-value">${customers.length}</p>
        </div>
        <div class="metric-card">
          <h4>Total Sales</h4>
          <p class="metric-value">${this.formatCurrency(totalSales)}</p>
        </div>
        <div class="metric-card">
          <h4>Average Sale Value</h4>
          <p class="metric-value">${this.formatCurrency(avgSale)}</p>
        </div>
        <div class="metric-card">
          <h4>Active Customers</h4>
          <p class="metric-value">${customers.filter(c => c.status === 'active').length}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate Customer Analysis
   */
  generateCustomerAnalysis() {
    const customers = this.getStoredData('customers') || [];

    let html = `
      <div class="report-header">
        <h2>Customer Analysis Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Total Sales</th>
            <th>Status</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    customers
      .sort((a, b) => (b.totalPaid || 0) - (a.totalPaid || 0))
      .forEach(customer => {
        html += `
          <tr>
            <td>${customer.name || 'Unknown'}</td>
            <td class="amount">${this.formatCurrency(customer.totalPaid || 0)}</td>
            <td>${customer.status || 'Active'}</td>
            <td>${this.formatDate(customer.createdAt) || 'N/A'}</td>
          </tr>
        `;
      });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }

  /**
   * Generate Supplier Performance
   */
  generateSupplierPerformance() {
    const suppliers = this.getStoredData('suppliers') || [];

    let html = `
      <div class="report-header">
        <h2>Supplier Performance Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <table class="report-table">
        <thead>
          <tr>
            <th>Supplier Name</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Total Purchases</th>
          </tr>
        </thead>
        <tbody>
    `;

    suppliers.forEach(supplier => {
      html += `
        <tr>
          <td>${supplier.name || 'Unknown'}</td>
          <td>${supplier.email || supplier.phone || 'N/A'}</td>
          <td>${supplier.status || 'Active'}</td>
          <td class="amount">${this.formatCurrency(supplier.totalPurchases || 0)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }

  /**
   * Generate Staff & Payroll Report
   */
  generateStaffPayroll() {
    const staff = this.getStoredData('staff') || [];
    const payroll = this.getStoredData('payroll') || [];
    
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.status === 'active').length;
    const totalPayroll = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);

    return `
      <div class="report-header">
        <h2>Staff & Payroll Report</h2>
        <p class="report-date">Generated on ${new Date().toLocaleString('en-LK')}</p>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total Staff</h4>
          <p class="metric-value">${totalStaff}</p>
        </div>
        <div class="metric-card">
          <h4>Active Staff</h4>
          <p class="metric-value">${activeStaff}</p>
        </div>
        <div class="metric-card">
          <h4>Total Payroll</h4>
          <p class="metric-value">${this.formatCurrency(totalPayroll)}</p>
        </div>
        <div class="metric-card">
          <h4>Average Salary</h4>
          <p class="metric-value">${this.formatCurrency(activeStaff > 0 ? totalPayroll / activeStaff : 0)}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate custom report
   */
  generateCustomReport() {
    const reportType = document.getElementById('customReportType')?.value;
    if (reportType) {
      this.generateReport(reportType);
    }
  }

  /**
   * Export current report to PDF
   */
  exportCurrentReportPdf() {
    if (!this.selectedReportType) {
      alert('Please generate a report first');
      return;
    }

    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Report_${this.selectedReportType}_${new Date().toISOString().split('T')[0]}.pdf`;
    const reportContent = document.getElementById('reportContainer')?.innerHTML || '';

    window.exportModule.generateReportPdf(reportContent, filename);
  }

  /**
   * Export current report to Excel
   */
  exportCurrentReportExcel() {
    if (!this.selectedReportType) {
      alert('Please generate a report first');
      return;
    }

    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Report_${this.selectedReportType}_${new Date().toISOString().split('T')[0]}.xlsx`;

    window.exportModule.generateReportExcel({
      reportType: this.selectedReportType,
      generatedAt: new Date().toLocaleString('en-LK')
    }, filename);
  }

  /**
   * Helper: Get stored data from other modules
   */
  getStoredData(key) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return [];
    }
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
    if (!dateString) return '';
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
    window.reportsModule = new ReportsModule();
  });
} else {
  window.reportsModule = new ReportsModule();
}
