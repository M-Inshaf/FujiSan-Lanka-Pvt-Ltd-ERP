class Calculations {
  
  // Sub Garments Calculations
  static calculateExpectedQty(layers, sizesPerLayer, quantityPerSize) {
    return layers * sizesPerLayer * quantityPerSize;
  }

  static calculateShortage(expectedQty, gradeA, damaged, waste) {
    return expectedQty - (gradeA + damaged) - waste;
  }

  static calculateGrossBill(gradeA, damaged, ratePerUnit) {
    return (gradeA + damaged) * ratePerUnit;
  }

  static calculatePayable(grossBill, deductions = 0) {
    return grossBill - deductions;
  }

  static calculateOutstandingBalance(transactions) {
    let balance = 0;
    transactions.forEach(tx => {
      if (tx.type === 'invoice') balance += tx.amount;
      if (tx.type === 'payment') balance -= tx.amount;
    });
    return Math.max(0, balance);
  }

  // Inventory Calculations
  static calculateStockValue(currentStock, unitCost) {
    return currentStock * unitCost;
  }

  static calculateReorderStatus(currentStock, reorderLevel) {
    if (currentStock <= reorderLevel) return 'critical';
    if (currentStock <= reorderLevel * 1.5) return 'low';
    return 'healthy';
  }

  // Production Costing Calculations
  static calculateProductionCost(quantity, ratePerUnit) {
    return quantity * ratePerUnit;
  }

  static calculateTotalProductionCost(processes, quantity) {
    return processes.reduce((total, process) => {
      return total + (quantity * process.ratePerUnit);
    }, 0);
  }

  // Financial Calculations
  static calculateGrossRevenue(transactions) {
    return transactions
      .filter(tx => tx.type === 'invoice')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  static calculateTotalPayments(transactions) {
    return transactions
      .filter(tx => tx.type === 'payment')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  static calculateNetBalance(invoiceAmount, paymentsReceived) {
    return invoiceAmount - paymentsReceived;
  }

  // Damage & Waste Calculations
  static calculateDeficit(expectedQty, gradeA, damaged) {
    return expectedQty - (gradeA + damaged);
  }

  static calculateYieldPercentage(gradeA, expectedQty) {
    return ((gradeA / expectedQty) * 100).toFixed(2);
  }

  static calculateDamagePercentage(damaged, expectedQty) {
    return ((damaged / expectedQty) * 100).toFixed(2);
  }

  // Cheque Calculations
  static calculateChequeStatus(cheques) {
    return {
      total: cheques.length,
      cleared: cheques.filter(c => c.status === 'cleared').length,
      pending: cheques.filter(c => c.status === 'pending').length,
      totalAmount: cheques.reduce((sum, c) => sum + c.amount, 0),
      clearedAmount: cheques
        .filter(c => c.status === 'cleared')
        .reduce((sum, c) => sum + c.amount, 0)
    };
  }

  // Staff Salary Calculations
  static calculateTotalSalary(staffMembers) {
    return staffMembers
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.salary, 0);
  }

  static calculateAverageSalary(staffMembers) {
    const active = staffMembers.filter(s => s.status === 'active');
    if (active.length === 0) return 0;
    return (this.calculateTotalSalary(active) / active.length).toFixed(2);
  }

  // Expense Calculations
  static calculateExpensesByCategory(expenses) {
    const grouped = {};
    expenses.forEach(exp => {
      if (!grouped[exp.category]) grouped[exp.category] = 0;
      grouped[exp.category] += exp.amount;
    });
    return grouped;
  }

  static calculateTotalExpenses(expenses) {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  static calculatePendingExpenses(expenses) {
    return expenses
      .filter(exp => exp.status === 'pending')
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  // Dashboard Summary Calculations
  static calculateDashboardMetrics(data) {
    return {
      totalCustomers: data.customers?.length || 0,
      totalSuppliers: data.suppliers?.length || 0,
      totalInventoryValue: data.inventory?.reduce((sum, inv) => sum + inv.stockValue, 0) || 0,
      totalOutstanding: data.customers?.reduce((sum, cust) => sum + (cust.outstandingBalance || 0), 0) || 0,
      activeStaff: data.staff?.filter(s => s.status === 'active').length || 0,
      totalExpenses: this.calculateTotalExpenses(data.expenses || []),
      pendingCheques: data.cheques?.filter(c => c.status === 'pending').length || 0,
      completedSubGarments: data.subGarments?.filter(sg => sg.status === 'completed').length || 0
    };
  }
}
