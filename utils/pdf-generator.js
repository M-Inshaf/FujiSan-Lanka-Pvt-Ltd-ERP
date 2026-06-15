/**
 * HUMMINGBIRD CLOTHING ERP - PDF GENERATION UTILITY
 * utils/pdf-generator.js
 *
 * PDF generation and export system for reports, invoices, and all document types
 * Uses html2canvas for rendering HTML to canvas, then jsPDF for PDF creation
 */

const html2canvas = require('html2canvas');
const jsPDF = require('jspdf');

/**
 * PDF Generator Class
 * Handles all PDF generation, styling, and document creation
 */
class PDFGenerator {
  constructor() {
    this.defaultPageSize = 'a4';
    this.defaultOrientation = 'portrait';
    this.defaultMargins = { top: 15, right: 15, bottom: 15, left: 15 };
    this.defaultFont = 'helvetica';
    this.defaultFontSize = 10;
    this.companyName = 'Hummingbird Clothing - FujiSan Lanka Pvt Ltd';
    this.documentTitle = 'ERP Document';
  }

  /**
   * Generate PDF from HTML element
   * @param {HTMLElement} htmlElement - HTML element to convert
   * @param {Object} options - PDF options (filename, title, author, etc.)
   * @returns {Promise<Blob>} PDF blob
   */
  async generateFromHTML(htmlElement, options = {}) {
    try {
      const {
        filename = 'document.pdf',
        title = this.documentTitle,
        author = this.companyName,
        subject = 'ERP Document Export',
        orientation = this.defaultOrientation,
        pageSize = this.defaultPageSize,
        margins = this.defaultMargins,
        scale = 2,
        useCORS = true,
        allowTaint = true
      } = options;

      // Convert HTML to canvas
      const canvas = await html2canvas(htmlElement, {
        scale: scale,
        useCORS: useCORS,
        allowTaint: allowTaint,
        backgroundColor: '#ffffff',
        windowHeight: htmlElement.scrollHeight,
        windowWidth: htmlElement.scrollWidth
      });

      // Calculate dimensions
      const imgWidth = orientation === 'landscape' ? 297 - (margins.left + margins.right) : 210 - (margins.left + margins.right);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize
      });

      // Set PDF metadata
      pdf.setProperties({
        title: title,
        subject: subject,
        author: author,
        keywords: 'ERP, Report, Document',
        creator: 'Hummingbird Clothing ERP'
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      let yPosition = margins.top;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Handle multi-page documents
      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft >= 0) {
        const pageAvailable = pageHeight - margins.top - margins.bottom;
        const heightOnPage = Math.min(heightLeft, pageAvailable);

        pdf.addImage(
          imgData,
          'PNG',
          margins.left,
          yPosition,
          imgWidth,
          (heightOnPage * imgWidth) / imgWidth
        );

        heightLeft -= pageAvailable;

        if (heightLeft > 0) {
          pdf.addPage();
          yPosition = margins.top;
        }
      }

      // Add footer with timestamp
      this.addFooter(pdf, margins);

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF Generation Failed: ${error.message}`);
    }
  }

  /**
   * Generate Report PDF with structured layout
   * @param {Object} reportData - Report data object
   * @param {Object} options - PDF options
   * @returns {Promise<Blob>} PDF blob
   */
  async generateReport(reportData, options = {}) {
    try {
      const {
        filename = 'report.pdf',
        title = reportData.reportTitle || 'Report',
        reportType = 'General Report',
        includeHeader = true,
        includeFooter = true,
        includePageNumbers = true,
        columns = [],
        data = [],
        totals = null,
        dateRange = null
      } = options;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margins = { top: 15, right: 15, bottom: 15, left: 15 };
      let yPosition = margins.top;

      // Set PDF metadata
      pdf.setProperties({
        title: title,
        subject: reportType,
        author: this.companyName,
        keywords: 'Report, ERP',
        creator: 'Hummingbird Clothing ERP'
      });

      // Add header
      if (includeHeader) {
        yPosition = this.addHeader(pdf, title, reportType, margins, yPosition);
      }

      // Add date range if provided
      if (dateRange) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const dateText = `${dateRange.from} to ${dateRange.to}`;
        pdf.text(dateText, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
      }

      // Add table
      if (columns.length > 0 && data.length > 0) {
        yPosition = this.addTable(pdf, columns, data, margins, yPosition);
      }

      // Add totals
      if (totals) {
        yPosition = this.addTotals(pdf, totals, margins, yPosition);
      }

      // Add footer
      if (includeFooter) {
        this.addFooter(pdf, margins);
      }

      // Add page numbers
      if (includePageNumbers) {
        this.addPageNumbers(pdf);
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating report PDF:', error);
      throw new Error(`Report PDF Generation Failed: ${error.message}`);
    }
  }

  /**
   * Generate Invoice PDF
   * @param {Object} invoiceData - Invoice details
   * @param {Object} options - PDF options
   * @returns {Promise<Blob>} PDF blob
   */
  async generateInvoice(invoiceData, options = {}) {
    try {
      const {
        filename = 'invoice.pdf',
        includeHeader = true,
        includeFooter = true
      } = options;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margins = { top: 15, right: 15, bottom: 15, left: 15 };
      let yPosition = margins.top;

      // Set metadata
      pdf.setProperties({
        title: `Invoice ${invoiceData.invoiceNumber}`,
        subject: 'Invoice',
        author: this.companyName,
        creator: 'Hummingbird Clothing ERP'
      });

      // Header
      if (includeHeader) {
        yPosition = this.addInvoiceHeader(pdf, invoiceData, margins, yPosition);
      }

      // Invoice details
      yPosition = this.addInvoiceDetails(pdf, invoiceData, margins, yPosition);

      // Items table
      if (invoiceData.items && invoiceData.items.length > 0) {
        yPosition = this.addInvoiceItems(pdf, invoiceData.items, margins, yPosition);
      }

      // Summary
      yPosition = this.addInvoiceSummary(pdf, invoiceData, margins, yPosition);

      // Footer
      if (includeFooter) {
        this.addInvoiceFooter(pdf, invoiceData, margins);
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error(`Invoice PDF Generation Failed: ${error.message}`);
    }
  }

  /**
   * Add header to document
   */
  addHeader(pdf, title, subtitle, margins, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Company name
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(20, 100, 150);
    pdf.text(this.companyName, margins.left, yPosition);
    yPosition += 8;

    // Document title
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    pdf.text(title, margins.left, yPosition);
    yPosition += 8;

    // Subtitle
    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(subtitle, margins.left, yPosition);
    yPosition += 10;

    // Separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 5;

    return yPosition;
  }

  /**
   * Add invoice header with logo/company info
   */
  addInvoiceHeader(pdf, invoiceData, margins, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Company info (left side)
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(20, 100, 150);
    pdf.text('Hummingbird Clothing', margins.left, yPosition);
    yPosition += 6;

    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('FujiSan Lanka Pvt Ltd', margins.left, yPosition);
    yPosition += 5;
    pdf.text('Colombo, Sri Lanka', margins.left, yPosition);
    yPosition += 10;

    // Invoice number and date (right side)
    const invoiceY = yPosition - 10;
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Invoice #${invoiceData.invoiceNumber}`, pageWidth - margins.right, invoiceY, { align: 'right' });

    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const dateStr = new Date(invoiceData.date).toLocaleDateString();
    pdf.text(`Date: ${dateStr}`, pageWidth - margins.right, invoiceY + 6, { align: 'right' });

    // Separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margins.left, yPosition, pageWidth - margins.right, yPosition);

    return yPosition + 5;
  }

  /**
   * Add invoice details (customer, payment terms, etc.)
   */
  addInvoiceDetails(pdf, invoiceData, margins, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const columnWidth = (pageWidth - margins.left - margins.right) / 2;

    // Bill To (left)
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Bill To:', margins.left, yPosition);
    yPosition += 5;

    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    if (invoiceData.customer) {
      pdf.text(invoiceData.customer.name, margins.left, yPosition);
      yPosition += 4;
      if (invoiceData.customer.address) pdf.text(invoiceData.customer.address, margins.left, yPosition), yPosition += 4;
      if (invoiceData.customer.phone) pdf.text(`Phone: ${invoiceData.customer.phone}`, margins.left, yPosition), yPosition += 4;
    }

    // Payment terms (right)
    const rightX = margins.left + columnWidth + 5;
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Payment Terms:', rightX, yPosition - (yPosition - (invoiceData.customer ? 14 : 5)));

    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    if (invoiceData.paymentTerms) {
      pdf.text(invoiceData.paymentTerms, rightX, yPosition - (yPosition - (invoiceData.customer ? 9 : 0)));
    }

    yPosition += 8;
    return yPosition;
  }

  /**
   * Add invoice items table
   */
  addInvoiceItems(pdf, items, margins, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const tableWidth = pageWidth - margins.left - margins.right;
    const colWidths = [tableWidth * 0.4, tableWidth * 0.15, tableWidth * 0.15, tableWidth * 0.3];

    // Header
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(20, 100, 150);

    const headers = ['Description', 'Quantity', 'Unit Price', 'Total'];
    let xPos = margins.left;
    headers.forEach((header, i) => {
      pdf.rect(xPos, yPosition - 4, colWidths[i], 6, 'F');
      pdf.text(header, xPos + 1, yPosition + 1, { maxWidth: colWidths[i] - 2 });
      xPos += colWidths[i];
    });

    yPosition += 7;

    // Items
    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    pdf.setFillColor(245, 245, 245);

    items.forEach((item, index) => {
      const rowHeight = 6;
      if (index % 2 === 0) {
        xPos = margins.left;
        pdf.rect(xPos, yPosition - 4, tableWidth, rowHeight, 'F');
      }

      xPos = margins.left;
      pdf.text(item.description || '', xPos + 1, yPosition + 1, { maxWidth: colWidths[0] - 2 });
      xPos += colWidths[0];

      pdf.text(String(item.quantity || 0), xPos + 1, yPosition + 1, { align: 'right' });
      xPos += colWidths[1];

      pdf.text(String(item.unitPrice || 0), xPos + 1, yPosition + 1, { align: 'right' });
      xPos += colWidths[2];

      pdf.text(String(item.total || 0), xPos + 1, yPosition + 1, { align: 'right' });

      yPosition += rowHeight;
    });

    return yPosition + 2;
  }

  /**
   * Add invoice summary (subtotal, tax, total)
   */
  addInvoiceSummary(pdf, invoiceData, margins, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const summaryX = pageWidth - margins.right - 60;

    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);

    // Subtotal
    pdf.text('Subtotal:', summaryX, yPosition);
    pdf.text(String(invoiceData.subtotal || 0), pageWidth - margins.right - 5, yPosition, { align: 'right' });
    yPosition += 6;

    // Tax
    if (invoiceData.tax) {
      pdf.text('Tax:', summaryX, yPosition);
      pdf.text(String(invoiceData.tax), pageWidth - margins.right - 5, yPosition, { align: 'right' });
      yPosition += 6;
    }

    // Total
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(20, 100, 150);
    pdf.text('Total:', summaryX, yPosition);
    pdf.text(String(invoiceData.total || 0), pageWidth - margins.right - 5, yPosition, { align: 'right' });

    return yPosition + 8;
  }

  /**
   * Add footer to document
   */
  addFooter(pdf, margins) {
    const pageSize = pdf.internal.pageSize;
    const pageHeight = pageSize.getHeight();
    const pageWidth = pageSize.getWidth();

    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);

    const timestamp = new Date().toLocaleString();
    pdf.text(
      `Generated: ${timestamp} | Hummingbird Clothing ERP v1.0.0`,
      margins.left,
      pageHeight - margins.bottom + 3
    );
  }

  /**
   * Add invoice footer with bank details/notes
   */
  addInvoiceFooter(pdf, invoiceData, margins) {
    const pageSize = pdf.internal.pageSize;
    const pageHeight = pageSize.getHeight();
    const pageWidth = pageSize.getWidth();

    // Notes
    if (invoiceData.notes) {
      pdf.setFont(this.defaultFont, 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Notes:', margins.left, pageHeight - 25);

      pdf.setFont(this.defaultFont, 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const noteLines = pdf.splitTextToSize(invoiceData.notes, pageWidth - margins.left - margins.right);
      pdf.text(noteLines, margins.left, pageHeight - 21);
    }

    // Standard footer
    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);

    const timestamp = new Date().toLocaleString();
    pdf.text(
      `Generated: ${timestamp} | Hummingbird Clothing ERP v1.0.0`,
      margins.left,
      pageHeight - margins.bottom + 3
    );
  }

  /**
   * Add table to PDF
   */
  addTable(pdf, columns, data, margins, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const tableWidth = pageWidth - margins.left - margins.right;
    const columnWidth = tableWidth / columns.length;

    // Header
    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(20, 100, 150);

    let xPos = margins.left;
    columns.forEach((col) => {
      pdf.rect(xPos, yPosition - 4, columnWidth, 6, 'F');
      pdf.text(col.label || col, xPos + 1, yPosition + 1, { maxWidth: columnWidth - 2 });
      xPos += columnWidth;
    });

    yPosition += 7;

    // Data rows
    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);
    pdf.setFillColor(245, 245, 245);

    data.forEach((row, rowIndex) => {
      const rowHeight = 5;
      if (rowIndex % 2 === 0) {
        xPos = margins.left;
        pdf.rect(xPos, yPosition - 3, tableWidth, rowHeight, 'F');
      }

      xPos = margins.left;
      columns.forEach((col) => {
        const colKey = col.key || col;
        const value = String(row[colKey] || '');
        pdf.text(value, xPos + 1, yPosition, { maxWidth: columnWidth - 2 });
        xPos += columnWidth;
      });

      yPosition += rowHeight;
    });

    return yPosition + 3;
  }

  /**
   * Add totals section
   */
  addTotals(pdf, totals, margins, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const totalX = pageWidth - margins.right - 50;

    pdf.setDrawColor(200, 200, 200);
    pdf.line(totalX, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 4;

    pdf.setFont(this.defaultFont, 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);

    Object.entries(totals).forEach(([key, value]) => {
      pdf.text(`${key}:`, totalX, yPosition);
      pdf.text(String(value), pageWidth - margins.right - 2, yPosition, { align: 'right' });
      yPosition += 6;
    });

    return yPosition;
  }

  /**
   * Add page numbers to PDF
   */
  addPageNumbers(pdf) {
    const pageCount = pdf.internal.pages.length - 1;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFont(this.defaultFont, 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
  }

  /**
   * Save PDF to file via Electron IPC
   * @param {Blob} pdfBlob - PDF blob to save
   * @param {string} filename - Default filename
   * @returns {Promise<string>} File path
   */
  async savePDF(pdfBlob, filename = 'document.pdf') {
    try {
      const buffer = await pdfBlob.arrayBuffer();
      const result = await window.api.file.savePdf(filename, buffer);
      return result;
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error(`Failed to save PDF: ${error.message}`);
    }
  }

  /**
   * Download PDF directly in browser
   * @param {Blob} pdfBlob - PDF blob to download
   * @param {string} filename - Filename for download
   */
  downloadPDF(pdfBlob, filename = 'document.pdf') {
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
  }
}

/**
 * Export singleton instance
 */
const pdfGenerator = new PDFGenerator();
module.exports = pdfGenerator;
