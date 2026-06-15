class ExportManager {

  static async exportToPDF(title, htmlContent, filename) {
    try {
      const canvas = await html2canvas(htmlContent, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename || 'export.pdf');
      return true;
    } catch (e) {
      console.error('PDF export failed:', e);
      return false;
    }
  }

  static generateSubGarmentsPDF(subGarment) {
    const html = `
      <div style="padding: 20px; font-family: Arial;">
        <h1>Sub Garment Invoice</h1>
        <p><strong>Invoice:</strong> ${subGarment.invoiceNumber}</p>
        <p><strong>Agent:</strong> ${subGarment.agentName}</p>
        <p><strong>Issue Date:</strong> ${subGarment.issueDate}</p>
        <hr/>
        <h3>Production Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Quantity</strong></td>
            <td style="padding: 8px;">${subGarment.quantity}</td>
          </tr>
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Expected Qty</strong></td>
            <td style="padding: 8px;">${subGarment.expectedQty}</td>
          </tr>
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Grade A</strong></td>
            <td style="padding: 8px;">${subGarment.gradeA}</td>
          </tr>
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Damaged</strong></td>
            <td style="padding: 8px;">${subGarment.damaged}</td>
          </tr>
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 8px;"><strong>Shortage</strong></td>
            <td style="padding: 8px;">${subGarment.shortage}</td>
          </tr>
          <tr style="border: 1px solid #ddd; background: #f5f5f5;">
            <td style="padding: 8px;"><strong>Gross Bill</strong></td>
            <td style="padding: 8px;"><strong>LKR ${subGarment.grossBill.toFixed(2)}</strong></td>
          </tr>
        </table>
        <h3>Payment</h3>
        ${subGarment.paymentReceipt ? `
          <p><strong>Payment Date:</strong> ${subGarment.paymentReceipt.date}</p>
          <p><strong>Amount Paid:</strong> LKR ${subGarment.paymentReceipt.amount.toFixed(2)}</p>
          <p><strong>Method:</strong> ${subGarment.paymentReceipt.method}</p>
        ` : '<p>Payment Pending</p>'}
      </div>
    `;
    return this.exportToPDF('Sub Garment Invoice', html, `invoice-${subGarment.invoiceNumber}.pdf`);
  }

  static exportToExcel(data, filename) {
    try {
      const wb = XLSX.utils.book_new();
      
      Object.keys(data).forEach(sheetName => {
        const ws = XLSX.utils.json_to_sheet(data[sheetName]);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      XLSX.writeFile(wb, filename || 'export.xlsx');
      return true;
    } catch (e) {
      console.error('Excel export failed:', e);
      return false;
    }
  }

  static generateCustomerStatement(customer) {
    const data = {
      'Customer Statement': [
        {
          'Customer Name': customer.name,
          'Contact Person': customer.contactPerson,
          'Email': customer.email,
          'Phone': customer.phone,
          'Outstanding Balance': customer.outstandingBalance
        }
      ],
      'Transactions': customer.transactions.map(tx => ({
        'Date': tx.date,
        'Type': tx.type,
        'Amount': `LKR ${tx.amount.toFixed(2)}`,
        'Balance': `LKR ${tx.balance.toFixed(2)}`
      }))
    };
    return this.exportToExcel(data, `statement-${customer.id}.xlsx`);
  }

  static generateInventoryReport(inventory) {
    const data = {
      'Inventory Report': inventory.map(item => ({
        'Item Name': item.itemName,
        'Category': item.category,
        'Current Stock': item.currentStock,
        'Unit Cost': `LKR ${item.unitCost.toFixed(2)}`,
        'Stock Value': `LKR ${item.stockValue.toFixed(2)}`,
        'Location': item.location,
        'Reorder Level': item.reorderLevel
      }))
    };
    return this.exportToExcel(data, 'inventory-report.xlsx');
  }

  static generatePayrollReport(staff, expenses) {
    const totalSalary = Calculations.calculateTotalSalary(staff);
    const data = {
      'Payroll': staff
        .filter(s => s.status === 'active')
        .map(s => ({
          'Employee Name': s.name,
          'Position': s.position,
          'Monthly Salary': `LKR ${s.salary.toFixed(2)}`
        })),
      'Summary': [
        {
          'Metric': 'Total Salary',
          'Amount': `LKR ${totalSalary.toFixed(2)}`
        }
      ]
    };
    return this.exportToExcel(data, 'payroll-report.xlsx');
  }

  static generateChequeTrackerReport(cheques) {
    const status = Calculations.calculateChequeStatus(cheques);
    const data = {
      'Cheque Details': cheques.map(c => ({
        'Cheque Number': c.chequeNumber,
        'Issue Date': c.issueDate,
        'Amount': `LKR ${c.amount.toFixed(2)}`,
        'Status': c.status,
        'Payee': c.payee
      })),
      'Summary': [
        {
          'Total Cheques': status.total,
          'Cleared': status.cleared,
          'Pending': status.pending,
          'Total Amount': `LKR ${status.totalAmount.toFixed(2)}`
        }
      ]
    };
    return this.exportToExcel(data, 'cheque-tracker-report.xlsx');
  }

  static generateExpenseReport(expenses) {
    const byCategory = Calculations.calculateExpensesByCategory(expenses);
    const data = {
      'Expenses': expenses.map(exp => ({
        'Date': exp.date,
        'Category': exp.category,
        'Description': exp.description,
        'Amount': `LKR ${exp.amount.toFixed(2)}`,
        'Status': exp.status
      })),
      'By Category': Object.keys(byCategory).map(cat => ({
        'Category': cat,
        'Total': `LKR ${byCategory[cat].toFixed(2)}`
      }))
    };
    return this.exportToExcel(data, 'expense-report.xlsx');
  }
}
