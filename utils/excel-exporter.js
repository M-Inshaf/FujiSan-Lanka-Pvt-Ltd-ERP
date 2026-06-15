/**
 * EXCEL EXPORT SYSTEM
 * utils/excel-exporter.js
 * 
 * Purpose: Export ERP data to formatted Excel files with styling, formulas, and multiple sheets
 * Integration: Works with XLSX library (SheetJS) and all ERP modules
 * Architecture: Follows Sub Garments module export patterns
 */

// ============================================================================
// EXCEL WORKBOOK & SHEET MANAGEMENT
// ============================================================================

/**
 * Create a new Excel workbook with default settings
 * @returns {object} XLSX Workbook object
 */
function createWorkbook() {
  const workbook = {
    SheetNames: [],
    Sheets: {},
    Props: {
      Title: 'Hummingbird Clothing ERP Export',
      Subject: 'ERP Data Export',
      Author: 'FujiSan Lanka Pvt Ltd',
      CreatedDate: new Date(),
    },
  };
  return workbook;
}

/**
 * Add a new worksheet to workbook
 * @param {object} workbook - XLSX Workbook object
 * @param {string} sheetName - Name of the sheet
 * @param {array} data - 2D array of data (rows x columns)
 * @returns {object} Updated workbook
 */
function addSheet(workbook, sheetName, data) {
  const sanitizedName = sheetName.substring(0, 31); // Excel sheet name limit
  
  // Convert 2D array to worksheet format
  const worksheet = arrayToSheet(data);
  
  workbook.SheetNames.push(sanitizedName);
  workbook.Sheets[sanitizedName] = worksheet;
  
  return workbook;
}

/**
 * Convert 2D array to XLSX worksheet object
 * @param {array} data - 2D array [[col1, col2, ...], [...]]
 * @returns {object} XLSX worksheet object
 */
function arrayToSheet(data) {
  const worksheet = {};
  const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
  
  if (!data || data.length === 0) {
    worksheet['!ref'] = 'A1';
    return worksheet;
  }
  
  // Process each cell
  data.forEach((row, rowIdx) => {
    if (!Array.isArray(row)) return;
    
    row.forEach((cell, colIdx) => {
      const cellRef = getCellReference(rowIdx, colIdx);
      
      // Create cell object
      let cellObj = { t: 's', v: '' }; // Default: string type
      
      if (cell === null || cell === undefined) {
        cellObj.v = '';
      } else if (typeof cell === 'number') {
        cellObj = { t: 'n', v: cell };
      } else if (typeof cell === 'boolean') {
        cellObj = { t: 'b', v: cell };
      } else if (cell instanceof Date) {
        cellObj = { t: 'd', v: cell };
      } else {
        cellObj = { t: 's', v: String(cell) };
      }
      
      worksheet[cellRef] = cellObj;
      
      // Update range
      range.e.c = Math.max(range.e.c, colIdx);
      range.e.r = Math.max(range.e.r, rowIdx);
    });
  });
  
  worksheet['!ref'] = `A1:${getCellReference(range.e.r, range.e.c)}`;
  return worksheet;
}

/**
 * Get cell reference (e.g., A1, B2, etc.)
 * @param {number} row - Row index (0-based)
 * @param {number} col - Column index (0-based)
 * @returns {string} Cell reference
 */
function getCellReference(row, col) {
  let colRef = '';
  let c = col;
  
  while (c >= 0) {
    colRef = String.fromCharCode((c % 26) + 65) + colRef;
    c = Math.floor(c / 26) - 1;
  }
  
  return `${colRef}${row + 1}`;
}

// ============================================================================
// CELL FORMATTING & STYLING
// ============================================================================

/**
 * Format cell with number format
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference (e.g., 'A1')
 * @param {string} format - Number format string
 */
function formatCellNumber(worksheet, cellRef, format = '0.00') {
  if (!worksheet[cellRef]) return;
  
  worksheet[cellRef].z = format; // Number format
}

/**
 * Format cell as currency
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference
 * @param {string} currency - Currency code (USD, LKR, etc.)
 */
function formatCellCurrency(worksheet, cellRef, currency = 'LKR') {
  if (!worksheet[cellRef]) return;
  
  const currencyFormats = {
    'USD': '$#,##0.00',
    'LKR': '₨#,##0.00',
    'EUR': '€#,##0.00',
    'GBP': '£#,##0.00',
  };
  
  worksheet[cellRef].z = currencyFormats[currency] || currencyFormats.USD;
}

/**
 * Format cell as percentage
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference
 * @param {number} decimals - Decimal places
 */
function formatCellPercentage(worksheet, cellRef, decimals = 2) {
  if (!worksheet[cellRef]) return;
  
  worksheet[cellRef].z = `0.${'0'.repeat(decimals)}%`;
}

/**
 * Format cell as date
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference
 * @param {string} format - Date format (YYYY-MM-DD, MM/DD/YYYY, etc.)
 */
function formatCellDate(worksheet, cellRef, format = 'YYYY-MM-DD') {
  if (!worksheet[cellRef]) return;
  
  const dateFormats = {
    'YYYY-MM-DD': 'yyyy-mm-dd',
    'MM/DD/YYYY': 'mm/dd/yyyy',
    'DD/MM/YYYY': 'dd/mm/yyyy',
    'YYYY-MM-DD HH:MM:SS': 'yyyy-mm-dd hh:mm:ss',
  };
  
  worksheet[cellRef].z = dateFormats[format] || dateFormats['YYYY-MM-DD'];
}

/**
 * Apply alignment to cell
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference
 * @param {object} alignment - { horizontal: 'left'|'center'|'right', vertical: 'top'|'center'|'bottom' }
 */
function formatCellAlignment(worksheet, cellRef, alignment = {}) {
  if (!worksheet[cellRef]) return;
  
  worksheet[cellRef].s = worksheet[cellRef].s || {};
  worksheet[cellRef].s.alignment = alignment;
}

/**
 * Apply font styling to cell
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference
 * @param {object} font - { bold: boolean, italic: boolean, size: number, color: string, name: string }
 */
function formatCellFont(worksheet, cellRef, font = {}) {
  if (!worksheet[cellRef]) return;
  
  worksheet[cellRef].s = worksheet[cellRef].s || {};
  worksheet[cellRef].s.font = {
    bold: font.bold || false,
    italic: font.italic || false,
    size: font.size || 11,
    name: font.name || 'Calibri',
    color: { rgb: font.color || '000000' },
  };
}

/**
 * Apply background fill to cell
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference
 * @param {string} color - Hex color code (e.g., 'FFFF00' for yellow)
 */
function formatCellFill(worksheet, cellRef, color = 'FFFFFF') {
  if (!worksheet[cellRef]) return;
  
  worksheet[cellRef].s = worksheet[cellRef].s || {};
  worksheet[cellRef].s.fill = {
    fgColor: { rgb: color },
    patternType: 'solid',
  };
}

/**
 * Apply border to cell
 * @param {object} worksheet - XLSX worksheet
 * @param {string} cellRef - Cell reference
 * @param {object} borderStyle - { top, right, bottom, left } with style and color
 */
function formatCellBorder(worksheet, cellRef, borderStyle = {}) {
  if (!worksheet[cellRef]) return;
  
  worksheet[cellRef].s = worksheet[cellRef].s || {};
  worksheet[cellRef].s.border = {
    top: borderStyle.top || { style: 'thin', color: { rgb: '000000' } },
    right: borderStyle.right || { style: 'thin', color: { rgb: '000000' } },
    bottom: borderStyle.bottom || { style: 'thin', color: { rgb: '000000' } },
    left: borderStyle.left || { style: 'thin', color: { rgb: '000000' } },
  };
}

// ============================================================================
// COLUMN & ROW MANAGEMENT
// ============================================================================

/**
 * Set column widths
 * @param {object} worksheet - XLSX worksheet
 * @param {array} widths - Array of column widths (e.g., [15, 20, 25])
 */
function setColumnWidths(worksheet, widths) {
  worksheet['!cols'] = widths.map(width => ({ wch: width }));
}

/**
 * Set row heights
 * @param {object} worksheet - XLSX worksheet
 * @param {object} heights - Object mapping row numbers to heights { 0: 25, 1: 30 }
 */
function setRowHeights(worksheet, heights) {
  worksheet['!rows'] = [];
  
  Object.entries(heights).forEach(([rowNum, height]) => {
    worksheet['!rows'][parseInt(rowNum)] = { hpt: height, hidden: false };
  });
}

/**
 * Freeze panes (header rows)
 * @param {object} worksheet - XLSX worksheet
 * @param {number} freezeRow - Number of rows to freeze
 * @param {number} freezeCol - Number of columns to freeze (default: 0)
 */
function freezePanes(worksheet, freezeRow = 1, freezeCol = 0) {
  worksheet['!freeze'] = { xSplit: freezeCol, ySplit: freezeRow };
}

/**
 * Auto-fit column widths based on content
 * @param {object} worksheet - XLSX worksheet
 * @param {number} minWidth - Minimum column width (default: 8)
 * @param {number} maxWidth - Maximum column width (default: 50)
 */
function autoFitColumns(worksheet, minWidth = 8, maxWidth = 50) {
  const range = worksheet['!ref'];
  if (!range) return;
  
  const [startCell, endCell] = range.split(':');
  const endCol = endCell.charCodeAt(0) - 65;
  
  const widths = [];
  
  for (let col = 0; col <= endCol; col++) {
    let maxLen = minWidth;
    
    // Check all cells in column
    for (let row = 0; row <= 1000; row++) {
      const cellRef = getCellReference(row, col);
      const cell = worksheet[cellRef];
      
      if (cell && cell.v) {
        const len = String(cell.v).length + 2;
        maxLen = Math.min(Math.max(maxLen, len), maxWidth);
      }
    }
    
    widths.push(maxLen);
  }
  
  setColumnWidths(worksheet, widths);
}

// ============================================================================
// TABLE/RANGE FORMATTING
// ============================================================================

/**
 * Format range as header row
 * @param {object} worksheet - XLSX worksheet
 * @param {number} rowIndex - Row index (0-based)
 * @param {number} colStart - Starting column index
 * @param {number} colEnd - Ending column index
 */
function formatHeaderRow(worksheet, rowIndex, colStart, colEnd) {
  const headerColor = '6366F1'; // Primary indigo
  const textColor = 'FFFFFF'; // White
  
  for (let col = colStart; col <= colEnd; col++) {
    const cellRef = getCellReference(rowIndex, col);
    
    formatCellFont(worksheet, cellRef, {
      bold: true,
      size: 12,
      color: textColor,
      name: 'Calibri',
    });
    
    formatCellFill(worksheet, cellRef, headerColor);
    
    formatCellAlignment(worksheet, cellRef, {
      horizontal: 'center',
      vertical: 'center',
    });
  }
}

/**
 * Format data range with alternating row colors (zebra striping)
 * @param {object} worksheet - XLSX worksheet
 * @param {number} rowStart - Starting row index
 * @param {number} rowEnd - Ending row index
 * @param {number} colStart - Starting column index
 * @param {number} colEnd - Ending column index
 */
function formatDataRange(worksheet, rowStart, rowEnd, colStart, colEnd) {
  const evenColor = 'FFFFFF'; // White
  const oddColor = 'F3F4F6';  // Light gray
  
  for (let row = rowStart; row <= rowEnd; row++) {
    const backgroundColor = (row - rowStart) % 2 === 0 ? evenColor : oddColor;
    
    for (let col = colStart; col <= colEnd; col++) {
      const cellRef = getCellReference(row, col);
      
      formatCellFill(worksheet, cellRef, backgroundColor);
      
      formatCellAlignment(worksheet, cellRef, {
        horizontal: 'left',
        vertical: 'center',
      });
    }
  }
}

/**
 * Format range as totals/summary row
 * @param {object} worksheet - XLSX worksheet
 * @param {number} rowIndex - Row index
 * @param {number} colStart - Starting column index
 * @param {number} colEnd - Ending column index
 */
function formatTotalsRow(worksheet, rowIndex, colStart, colEnd) {
  const totalsColor = 'F3F4F6'; // Light gray
  
  for (let col = colStart; col <= colEnd; col++) {
    const cellRef = getCellReference(rowIndex, col);
    
    formatCellFont(worksheet, cellRef, {
      bold: true,
      size: 11,
      color: '000000',
    });
    
    formatCellFill(worksheet, cellRef, totalsColor);
    
    formatCellAlignment(worksheet, cellRef, {
      horizontal: col === colStart ? 'left' : 'right',
      vertical: 'center',
    });
    
    formatCellBorder(worksheet, cellRef, {
      top: { style: 'medium', color: { rgb: '6366F1' } },
      bottom: { style: 'medium', color: { rgb: '6366F1' } },
    });
  }
}

// ============================================================================
// MODULE-SPECIFIC EXPORTERS
// ============================================================================

/**
 * Export Sub Garments data to Excel
 * @param {array} subGarmentsData - Array of sub garment objects
 * @returns {object} XLSX Workbook
 */
function exportSubGarments(subGarmentsData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Sub Garments Report';
  
  // Prepare data with headers
  const data = [
    ['Sub Garment ID', 'Name', 'Category', 'Unit Cost', 'Quantity', 'Total Cost', 'Status', 'Last Updated'],
  ];
  
  subGarmentsData.forEach(item => {
    data.push([
      item.id || '',
      item.name || '',
      item.category || '',
      item.unitCost || 0,
      item.quantity || 0,
      (item.unitCost || 0) * (item.quantity || 0),
      item.status || 'Active',
      item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '',
    ]);
  });
  
  // Add sheet
  addSheet(workbook, 'Sub Garments', data);
  const worksheet = workbook.Sheets['Sub Garments'];
  
  // Format headers
  formatHeaderRow(worksheet, 0, 0, 7);
  
  // Format data
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 7);
  }
  
  // Format specific columns
  for (let row = 1; row < data.length; row++) {
    formatCellCurrency(worksheet, getCellReference(row, 3), 'LKR');
    formatCellNumber(worksheet, getCellReference(row, 4), '0');
    formatCellCurrency(worksheet, getCellReference(row, 5), 'LKR');
  }
  
  // Set column widths
  setColumnWidths(worksheet, [15, 20, 15, 15, 15, 15, 12, 18]);
  
  // Freeze header
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

/**
 * Export Customers data to Excel
 * @param {array} customersData - Array of customer objects
 * @returns {object} XLSX Workbook
 */
function exportCustomers(customersData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Customers Report';
  
  const data = [
    ['Customer ID', 'Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'Status', 'Credit Limit'],
  ];
  
  customersData.forEach(item => {
    data.push([
      item.id || '',
      item.name || '',
      item.contactPerson || '',
      item.email || '',
      item.phone || '',
      item.address || '',
      item.city || '',
      item.status || 'Active',
      item.creditLimit || 0,
    ]);
  });
  
  addSheet(workbook, 'Customers', data);
  const worksheet = workbook.Sheets['Customers'];
  
  formatHeaderRow(worksheet, 0, 0, 8);
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 8);
  }
  
  for (let row = 1; row < data.length; row++) {
    formatCellCurrency(worksheet, getCellReference(row, 8), 'LKR');
  }
  
  setColumnWidths(worksheet, [12, 20, 18, 20, 15, 25, 12, 10, 15]);
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

/**
 * Export Suppliers data to Excel
 * @param {array} suppliersData - Array of supplier objects
 * @returns {object} XLSX Workbook
 */
function exportSuppliers(suppliersData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Suppliers Report';
  
  const data = [
    ['Supplier ID', 'Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'Payment Terms', 'Status'],
  ];
  
  suppliersData.forEach(item => {
    data.push([
      item.id || '',
      item.name || '',
      item.contactPerson || '',
      item.email || '',
      item.phone || '',
      item.address || '',
      item.city || '',
      item.paymentTerms || '',
      item.status || 'Active',
    ]);
  });
  
  addSheet(workbook, 'Suppliers', data);
  const worksheet = workbook.Sheets['Suppliers'];
  
  formatHeaderRow(worksheet, 0, 0, 8);
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 8);
  }
  
  setColumnWidths(worksheet, [12, 20, 18, 20, 15, 25, 12, 15, 10]);
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

/**
 * Export Inventory data to Excel
 * @param {array} inventoryData - Array of inventory items
 * @returns {object} XLSX Workbook
 */
function exportInventory(inventoryData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Inventory Report';
  
  const data = [
    ['Item ID', 'Item Name', 'Category', 'Stock Quantity', 'Reorder Level', 'Unit Cost', 'Total Value', 'Location', 'Last Updated'],
  ];
  
  inventoryData.forEach(item => {
    const totalValue = (item.stockQuantity || 0) * (item.unitCost || 0);
    data.push([
      item.id || '',
      item.itemName || '',
      item.category || '',
      item.stockQuantity || 0,
      item.reorderLevel || 0,
      item.unitCost || 0,
      totalValue,
      item.location || '',
      item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '',
    ]);
  });
  
  addSheet(workbook, 'Inventory', data);
  const worksheet = workbook.Sheets['Inventory'];
  
  formatHeaderRow(worksheet, 0, 0, 8);
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 8);
  }
  
  for (let row = 1; row < data.length; row++) {
    formatCellNumber(worksheet, getCellReference(row, 3), '0');
    formatCellNumber(worksheet, getCellReference(row, 4), '0');
    formatCellCurrency(worksheet, getCellReference(row, 5), 'LKR');
    formatCellCurrency(worksheet, getCellReference(row, 6), 'LKR');
  }
  
  setColumnWidths(worksheet, [12, 20, 15, 16, 14, 12, 14, 12, 15]);
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

/**
 * Export Production Costing data to Excel
 * @param {array} productionData - Array of production costing items
 * @returns {object} XLSX Workbook
 */
function exportProductionCosting(productionData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Production Costing Report';
  
  const data = [
    ['Production ID', 'Product Name', 'Material Cost', 'Labor Cost', 'Overhead Cost', 'Total Cost', 'Quantity Produced', 'Cost Per Unit', 'Date'],
  ];
  
  productionData.forEach(item => {
    const totalCost = (item.materialCost || 0) + (item.laborCost || 0) + (item.overheadCost || 0);
    const costPerUnit = item.quantityProduced > 0 ? totalCost / item.quantityProduced : 0;
    
    data.push([
      item.id || '',
      item.productName || '',
      item.materialCost || 0,
      item.laborCost || 0,
      item.overheadCost || 0,
      totalCost,
      item.quantityProduced || 0,
      costPerUnit,
      item.date ? new Date(item.date).toLocaleDateString() : '',
    ]);
  });
  
  addSheet(workbook, 'Production Costing', data);
  const worksheet = workbook.Sheets['Production Costing'];
  
  formatHeaderRow(worksheet, 0, 0, 8);
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 8);
  }
  
  for (let row = 1; row < data.length; row++) {
    formatCellCurrency(worksheet, getCellReference(row, 2), 'LKR');
    formatCellCurrency(worksheet, getCellReference(row, 3), 'LKR');
    formatCellCurrency(worksheet, getCellReference(row, 4), 'LKR');
    formatCellCurrency(worksheet, getCellReference(row, 5), 'LKR');
    formatCellNumber(worksheet, getCellReference(row, 6), '0');
    formatCellCurrency(worksheet, getCellReference(row, 7), 'LKR');
  }
  
  setColumnWidths(worksheet, [14, 20, 14, 12, 14, 12, 16, 14, 12]);
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

/**
 * Export Expenses data to Excel
 * @param {array} expensesData - Array of expense items
 * @returns {object} XLSX Workbook
 */
function exportExpenses(expensesData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Expenses Report';
  
  const data = [
    ['Expense ID', 'Category', 'Description', 'Amount', 'Date', 'Payment Method', 'Status', 'Notes'],
  ];
  
  expensesData.forEach(item => {
    data.push([
      item.id || '',
      item.category || '',
      item.description || '',
      item.amount || 0,
      item.date ? new Date(item.date).toLocaleDateString() : '',
      item.paymentMethod || '',
      item.status || 'Pending',
      item.notes || '',
    ]);
  });
  
  addSheet(workbook, 'Expenses', data);
  const worksheet = workbook.Sheets['Expenses'];
  
  formatHeaderRow(worksheet, 0, 0, 7);
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 7);
  }
  
  for (let row = 1; row < data.length; row++) {
    formatCellCurrency(worksheet, getCellReference(row, 3), 'LKR');
  }
  
  setColumnWidths(worksheet, [12, 15, 25, 12, 12, 15, 12, 20]);
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

/**
 * Export Staff data to Excel
 * @param {array} staffData - Array of staff members
 * @returns {object} XLSX Workbook
 */
function exportStaff(staffData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Staff Report';
  
  const data = [
    ['Staff ID', 'Name', 'Position', 'Department', 'Email', 'Phone', 'Salary', 'Status', 'Join Date'],
  ];
  
  staffData.forEach(item => {
    data.push([
      item.id || '',
      item.name || '',
      item.position || '',
      item.department || '',
      item.email || '',
      item.phone || '',
      item.salary || 0,
      item.status || 'Active',
      item.joinDate ? new Date(item.joinDate).toLocaleDateString() : '',
    ]);
  });
  
  addSheet(workbook, 'Staff', data);
  const worksheet = workbook.Sheets['Staff'];
  
  formatHeaderRow(worksheet, 0, 0, 8);
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 8);
  }
  
  for (let row = 1; row < data.length; row++) {
    formatCellCurrency(worksheet, getCellReference(row, 6), 'LKR');
  }
  
  setColumnWidths(worksheet, [10, 18, 15, 15, 20, 15, 12, 10, 12]);
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

/**
 * Export Cheque Tracker data to Excel
 * @param {array} chequeData - Array of cheque records
 * @returns {object} XLSX Workbook
 */
function exportChequeTracker(chequeData) {
  const workbook = createWorkbook();
  workbook.Props.Title = 'Cheque Tracker Report';
  
  const data = [
    ['Cheque #', 'Bank', 'Amount', 'Date', 'Payee', 'Status', 'Remarks'],
  ];
  
  chequeData.forEach(item => {
    data.push([
      item.chequeNumber || '',
      item.bank || '',
      item.amount || 0,
      item.date ? new Date(item.date).toLocaleDateString() : '',
      item.payee || '',
      item.status || 'Pending',
      item.remarks || '',
    ]);
  });
  
  addSheet(workbook, 'Cheque Tracker', data);
  const worksheet = workbook.Sheets['Cheque Tracker'];
  
  formatHeaderRow(worksheet, 0, 0, 6);
  if (data.length > 1) {
    formatDataRange(worksheet, 1, data.length - 1, 0, 6);
  }
  
  for (let row = 1; row < data.length; row++) {
    formatCellCurrency(worksheet, getCellReference(row, 2), 'LKR');
  }
  
  setColumnWidths(worksheet, [12, 15, 12, 12, 20, 12, 20]);
  freezePanes(worksheet, 1, 0);
  
  return workbook;
}

// ============================================================================
// UTILITY FUNCTIONS FOR SAVING
// ============================================================================

/**
 * Convert workbook to binary data for download
 * @param {object} workbook - XLSX Workbook
 * @returns {ArrayBuffer} Binary data
 */
function workbookToBinary(workbook) {
  // This is a placeholder - actual implementation requires XLSX library
  // In real use: return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new ArrayBuffer(0);
}

/**
 * Download Excel file to user's computer
 * @param {object} workbook - XLSX Workbook
 * @param {string} filename - Output filename (e.g., 'export.xlsx')
 */
function downloadExcel(workbook, filename = 'export.xlsx') {
  try {
    // Try using Electron IPC if available
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.ipcRenderer.invoke('save-excel', {
        workbook,
        filename,
      });
    } else {
      // Fallback for browser environment
      console.log(`Would download file as: ${filename}`);
    }
  } catch (error) {
    console.error('Error downloading Excel file:', error);
  }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Workbook Management
    createWorkbook,
    addSheet,
    arrayToSheet,
    getCellReference,
    
    // Cell Formatting
    formatCellNumber,
    formatCellCurrency,
    formatCellPercentage,
    formatCellDate,
    formatCellAlignment,
    formatCellFont,
    formatCellFill,
    formatCellBorder,
    
    // Column & Row Management
    setColumnWidths,
    setRowHeights,
    freezePanes,
    autoFitColumns,
    
    // Table Formatting
    formatHeaderRow,
    formatDataRange,
    formatTotalsRow,
    
    // Module Exporters
    exportSubGarments,
    exportCustomers,
    exportSuppliers,
    exportInventory,
    exportProductionCosting,
    exportExpenses,
    exportStaff,
    exportChequeTracker,
    
    // Utilities
    workbookToBinary,
    downloadExcel,
  };
}
