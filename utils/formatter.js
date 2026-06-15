class Formatter {

  // Date Formatting
  static formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch(format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'short':
        return `${day}/${month}/${year}`;
      case 'long':
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      default:
        return `${day}/${month}/${year}`;
    }
  }

  static formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  static formatDateTime(date) {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  // Currency Formatting
  static formatCurrency(amount, currency = 'LKR') {
    if (amount === null || amount === undefined) return `${currency} 0.00`;
    const formatted = parseFloat(amount).toFixed(2);
    return `${currency} ${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  static formatCurrencyNumeric(amount) {
    if (amount === null || amount === undefined) return '0.00';
    return parseFloat(amount).toFixed(2);
  }

  // Number Formatting
  static formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toFixed(decimals);
  }

  static formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return '0%';
    return `${parseFloat(value).toFixed(decimals)}%`;
  }

  static formatQuantity(qty) {
    if (qty === null || qty === undefined) return '0';
    return Math.floor(qty).toString();
  }

  // Text Formatting
  static capitalizeFirst(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static capitalizeFull(text) {
    if (!text) return '';
    return text.split(' ').map(word => this.capitalizeFirst(word)).join(' ');
  }

  static truncate(text, length = 50) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  // Status Formatting
  static formatStatus(status) {
    const statusMap = {
      'completed': '✅ Completed',
      'pending': '⏳ Pending',
      'in-progress': '🔄 In Progress',
      'cancelled': '❌ Cancelled',
      'cleared': '✅ Cleared',
      'active': '✅ Active',
      'inactive': '❌ Inactive',
      'paid': '✅ Paid',
      'unpaid': '❌ Unpaid'
    };
    return statusMap[status.toLowerCase()] || this.capitalizeFirst(status);
  }

  static getStatusColor(status) {
    const colorMap = {
      'completed': '#10b981',
      'pending': '#f59e0b',
      'in-progress': '#3b82f6',
      'cancelled': '#ef4444',
      'cleared': '#10b981',
      'active': '#10b981',
      'inactive': '#6b7280',
      'paid': '#10b981',
      'unpaid': '#ef4444'
    };
    return colorMap[status.toLowerCase()] || '#6b7280';
  }

  // Phone Formatting
  static formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
    return phone;
  }

  // Email Validation
  static formatEmail(email) {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Address Formatting
  static formatAddress(address) {
    if (!address) return '';
    return address.trim();
  }

  // File Size Formatting
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Array Formatting
  static formatList(items, separator = ', ') {
    if (!Array.isArray(items)) return '';
    return items.join(separator);
  }

  static formatJsonPretty(obj) {
    return JSON.stringify(obj, null, 2);
  }

  // Highlight Text
  static highlightMatches(text, query) {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Badge Formatting
  static formatBadge(text, type = 'default') {
    const badges = {
      'success': '🟢',
      'warning': '🟡',
      'danger': '🔴',
      'info': '🔵',
      'default': '⚪'
    };
    return `${badges[type] || badges.default} ${text}`;
  }

  // Currency Symbol by Code
  static getCurrencySymbol(code = 'LKR') {
    const symbols = {
      'LKR': 'LKR',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹'
    };
    return symbols[code] || code;
  }
}
