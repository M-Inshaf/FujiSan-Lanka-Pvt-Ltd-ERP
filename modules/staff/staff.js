/**
 * HUMMINGBIRD CLOTHING ERP - STAFF MODULE
 * modules/staff/staff.js
 * 
 * Complete staff management system following Sub Garments architecture
 * Features: CRUD operations, payroll tracking, attendance, role management, salary calculations
 */

class StaffModule {
  constructor() {
    this.storageKey = 'staff';
    this.payrollKey = 'payroll';
    this.attendanceKey = 'attendance';
    this.rolesKey = 'staffRoles';
    this.staff = [];
    this.payroll = [];
    this.attendance = [];
    this.roles = this.initializeRoles();
    this.init();
  }

  /**
   * Initialize default staff roles
   */
  initializeRoles() {
    const defaultRoles = [
      { id: 'manager', name: 'Manager', level: 5, baseSalary: 50000 },
      { id: 'supervisor', name: 'Supervisor', level: 4, baseSalary: 35000 },
      { id: 'tailor', name: 'Tailor', level: 3, baseSalary: 25000 },
      { id: 'assistant', name: 'Assistant', level: 2, baseSalary: 18000 },
      { id: 'intern', name: 'Intern', level: 1, baseSalary: 10000 },
      { id: 'quality-control', name: 'Quality Control', level: 3, baseSalary: 24000 },
      { id: 'logistics', name: 'Logistics Staff', level: 2, baseSalary: 20000 }
    ];

    const stored = localStorage.getItem(this.rolesKey);
    return stored ? JSON.parse(stored) : defaultRoles;
  }

  /**
   * Initialize module on page load
   */
  init() {
    this.loadStaff();
    this.loadPayroll();
    this.loadAttendance();
    this.setupEventListeners();
    this.renderStaffTable();
    this.renderPayrollTable();
    this.renderAttendanceTable();
    this.updateDashboard();
  }

  /**
   * Load staff from storage
   */
  loadStaff() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.staff = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading staff:', error);
      this.staff = [];
    }
  }

  /**
   * Load payroll from storage
   */
  loadPayroll() {
    try {
      const stored = localStorage.getItem(this.payrollKey);
      this.payroll = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading payroll:', error);
      this.payroll = [];
    }
  }

  /**
   * Load attendance from storage
   */
  loadAttendance() {
    try {
      const stored = localStorage.getItem(this.attendanceKey);
      this.attendance = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading attendance:', error);
      this.attendance = [];
    }
  }

  /**
   * Save staff to storage
   */
  saveStaff() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.staff));
      return true;
    } catch (error) {
      console.error('Error saving staff:', error);
      return false;
    }
  }

  /**
   * Save payroll to storage
   */
  savePayroll() {
    try {
      localStorage.setItem(this.payrollKey, JSON.stringify(this.payroll));
      return true;
    } catch (error) {
      console.error('Error saving payroll:', error);
      return false;
    }
  }

  /**
   * Save attendance to storage
   */
  saveAttendance() {
    try {
      localStorage.setItem(this.attendanceKey, JSON.stringify(this.attendance));
      return true;
    } catch (error) {
      console.error('Error saving attendance:', error);
      return false;
    }
  }

  /**
   * Setup event listeners for all interactive elements
   */
  setupEventListeners() {
    // Add staff button
    const addStaffBtn = document.getElementById('addStaffBtn');
    if (addStaffBtn) {
      addStaffBtn.addEventListener('click', () => this.showAddStaffModal());
    }

    // Staff form submission
    const staffForm = document.getElementById('staffForm');
    if (staffForm) {
      staffForm.addEventListener('submit', (e) => this.handleStaffSubmit(e));
    }

    // Role filter
    const roleFilter = document.getElementById('staffRoleFilter');
    if (roleFilter) {
      this.populateRoleFilter();
      roleFilter.addEventListener('change', () => this.renderStaffTable());
    }

    // Status filter
    const statusFilter = document.getElementById('staffStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.renderStaffTable());
    }

    // Search
    const searchInput = document.getElementById('staffSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderStaffTable(e.target.value.toLowerCase());
      });
    }

    // Generate payroll button
    const generatePayrollBtn = document.getElementById('generatePayrollBtn');
    if (generatePayrollBtn) {
      generatePayrollBtn.addEventListener('click', () => this.showGeneratePayrollModal());
    }

    // Payroll form
    const payrollForm = document.getElementById('payrollForm');
    if (payrollForm) {
      payrollForm.addEventListener('submit', (e) => this.handlePayrollSubmit(e));
    }

    // Attendance tracking
    const attendanceForm = document.getElementById('attendanceForm');
    if (attendanceForm) {
      attendanceForm.addEventListener('submit', (e) => this.handleAttendanceSubmit(e));
    }

    // Export buttons
    const exportPdfBtn = document.getElementById('exportStaffPdf');
    const exportExcelBtn = document.getElementById('exportStaffExcel');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportToPdf());
    }
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => this.exportToExcel());
    }
  }

  /**
   * Populate role filter dropdown
   */
  populateRoleFilter() {
    const roleFilter = document.getElementById('staffRoleFilter');
    if (!roleFilter) return;

    let html = '<option value="">All Roles</option>';
    this.roles.forEach(role => {
      html += `<option value="${role.id}">${role.name}</option>`;
    });

    roleFilter.innerHTML = html;
  }

  /**
   * Show add staff modal
   */
  showAddStaffModal() {
    const modal = document.getElementById('staffModal');
    const form = document.getElementById('staffForm');
    
    if (modal && form) {
      form.reset();
      document.getElementById('staffModalTitle').textContent = 'Add New Staff Member';
      document.getElementById('staffId').value = '';
      document.getElementById('staffStatus').value = 'active';
      document.getElementById('staffJoinDate').value = new Date().toISOString().split('T')[0];
      this.populateRoleSelect();
      modal.style.display = 'block';
    }
  }

  /**
   * Show edit staff modal
   */
  showEditStaffModal(id) {
    const member = this.staff.find(s => s.id === id);
    if (!member) return;

    const modal = document.getElementById('staffModal');
    const form = document.getElementById('staffForm');
    
    if (modal && form) {
      document.getElementById('staffModalTitle').textContent = 'Edit Staff Member';
      document.getElementById('staffId').value = member.id;
      document.getElementById('staffName').value = member.name;
      document.getElementById('staffPhone').value = member.phone || '';
      document.getElementById('staffEmail').value = member.email || '';
      document.getElementById('staffRole').value = member.role;
      document.getElementById('staffStatus').value = member.status;
      document.getElementById('staffJoinDate').value = member.joinDate;
      document.getElementById('staffNationalId').value = member.nationalId || '';
      document.getElementById('staffAddress').value = member.address || '';
      this.populateRoleSelect();
      modal.style.display = 'block';
    }
  }

  /**
   * Populate role select dropdown
   */
  populateRoleSelect() {
    const roleSelect = document.getElementById('staffRole');
    if (!roleSelect) return;

    let html = '<option value="">Select Role</option>';
    this.roles.forEach(role => {
      html += `<option value="${role.id}">${role.name} (LKR ${this.formatCurrency(role.baseSalary).replace('LKR ', '')})</option>`;
    });

    roleSelect.innerHTML = html;
  }

  /**
   * Handle staff form submission
   */
  handleStaffSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('staffId').value;
    const name = document.getElementById('staffName').value;
    const phone = document.getElementById('staffPhone').value;
    const email = document.getElementById('staffEmail').value;
    const role = document.getElementById('staffRole').value;
    const status = document.getElementById('staffStatus').value;
    const joinDate = document.getElementById('staffJoinDate').value;
    const nationalId = document.getElementById('staffNationalId').value;
    const address = document.getElementById('staffAddress').value;

    if (!name || !role || !status || !joinDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (id) {
      // Update existing staff
      const index = this.staff.findIndex(s => s.id === id);
      if (index !== -1) {
        this.staff[index] = {
          id,
          name,
          phone,
          email,
          role,
          status,
          joinDate,
          nationalId,
          address,
          createdAt: this.staff[index].createdAt,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // Create new staff member
      const newMember = {
        id: this.generateId(),
        name,
        phone,
        email,
        role,
        status,
        joinDate,
        nationalId,
        address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.staff.push(newMember);
    }

    this.saveStaff();
    this.renderStaffTable();
    this.updateDashboard();
    
    const modal = document.getElementById('staffModal');
    if (modal) modal.style.display = 'none';
  }

  /**
   * Delete staff member
   */
  deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    this.staff = this.staff.filter(s => s.id !== id);
    this.saveStaff();
    this.renderStaffTable();
    this.updateDashboard();
  }

  /**
   * Render staff table with filtering
   */
  renderStaffTable(searchTerm = '') {
    const container = document.getElementById('staffTableContainer');
    if (!container) return;

    const roleFilter = document.getElementById('staffRoleFilter')?.value || '';
    const statusFilter = document.getElementById('staffStatusFilter')?.value || '';

    let filtered = this.staff.filter(member => {
      const matchesRole = !roleFilter || member.role === roleFilter;
      const matchesStatus = !statusFilter || member.status === statusFilter;
      const matchesSearch = !searchTerm || 
                           member.name.toLowerCase().includes(searchTerm) ||
                           member.email.toLowerCase().includes(searchTerm) ||
                           member.phone.includes(searchTerm);
      
      return matchesRole && matchesStatus && matchesSearch;
    });

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">No staff members found</div>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Join Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.forEach(member => {
      const role = this.roles.find(r => r.id === member.role);
      const roleName = role ? role.name : 'Unknown';
      const statusColor = member.status === 'active' ? '#10B981' : '#EF4444';
      const statusText = member.status === 'active' ? 'Active' : 'Inactive';
      const joinDate = this.formatDate(member.joinDate);

      html += `
        <tr>
          <td><strong>${member.name}</strong></td>
          <td>${roleName}</td>
          <td>${member.phone || '-'}</td>
          <td>${member.email || '-'}</td>
          <td>${joinDate}</td>
          <td>
            <span class="badge" style="background-color: ${statusColor}20; color: ${statusColor}">
              ${statusText}
            </span>
          </td>
          <td class="actions">
            <button class="btn-icon" onclick="window.staffModule.showEditStaffModal('${member.id}')" title="Edit">
              <i class="icon-edit"></i>
            </button>
            <button class="btn-icon" onclick="window.staffModule.showAttendanceModal('${member.id}')" title="Mark Attendance">
              <i class="icon-attendance"></i>
            </button>
            <button class="btn-icon delete" onclick="window.staffModule.deleteStaff('${member.id}')" title="Delete">
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
   * Show generate payroll modal
   */
  showGeneratePayrollModal() {
    const modal = document.getElementById('payrollModal');
    const form = document.getElementById('payrollForm');
    
    if (modal && form) {
      form.reset();
      document.getElementById('payrollModalTitle').textContent = 'Generate Payroll';
      document.getElementById('payrollMonth').value = new Date().toISOString().substring(0, 7);
      this.populateStaffSelect();
      modal.style.display = 'block';
    }
  }

  /**
   * Populate staff select dropdown
   */
  populateStaffSelect() {
    const staffSelect = document.getElementById('payrollStaff');
    if (!staffSelect) return;

    let html = '<option value="">Select Staff Member</option>';
    this.staff.filter(s => s.status === 'active').forEach(member => {
      html += `<option value="${member.id}">${member.name}</option>`;
    });

    staffSelect.innerHTML = html;
  }

  /**
   * Handle payroll form submission
   */
  handlePayrollSubmit(e) {
    e.preventDefault();

    const staffId = document.getElementById('payrollStaff').value;
    const month = document.getElementById('payrollMonth').value;
    const baseSalary = parseFloat(document.getElementById('payrollBaseSalary').value);
    const bonus = parseFloat(document.getElementById('payrollBonus').value) || 0;
    const deductions = parseFloat(document.getElementById('payrollDeductions').value) || 0;
    const advances = parseFloat(document.getElementById('payrollAdvances').value) || 0;

    if (!staffId || !month || !baseSalary || baseSalary <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const netSalary = baseSalary + bonus - deductions - advances;

    const payrollEntry = {
      id: this.generateId(),
      staffId,
      month,
      baseSalary,
      bonus,
      deductions,
      advances,
      netSalary,
      status: 'pending',
      paidDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.payroll.push(payrollEntry);
    this.savePayroll();
    this.renderPayrollTable();
    this.updateDashboard();
    
    const modal = document.getElementById('payrollModal');
    if (modal) modal.style.display = 'none';
  }

  /**
   * Mark payroll as paid
   */
  markPayrollAsPaid(id) {
    const entry = this.payroll.find(p => p.id === id);
    if (entry) {
      entry.status = 'paid';
      entry.paidDate = new Date().toISOString();
      entry.updatedAt = new Date().toISOString();
      this.savePayroll();
      this.renderPayrollTable();
      this.updateDashboard();
    }
  }

  /**
   * Delete payroll entry
   */
  deletePayrollEntry(id) {
    if (!confirm('Are you sure you want to delete this payroll entry?')) return;

    this.payroll = this.payroll.filter(p => p.id !== id);
    this.savePayroll();
    this.renderPayrollTable();
    this.updateDashboard();
  }

  /**
   * Render payroll table
   */
  renderPayrollTable() {
    const container = document.getElementById('payrollTableContainer');
    if (!container) return;

    if (this.payroll.length === 0) {
      container.innerHTML = '<div class="empty-state">No payroll records found</div>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Staff Member</th>
            <th>Month</th>
            <th>Base Salary</th>
            <th>Bonus</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.payroll.forEach(entry => {
      const member = this.staff.find(s => s.id === entry.staffId);
      const memberName = member ? member.name : 'Unknown';
      const statusColor = entry.status === 'paid' ? '#10B981' : '#F59E0B';
      const statusText = entry.status === 'paid' ? 'Paid' : 'Pending';

      html += `
        <tr>
          <td>${memberName}</td>
          <td>${entry.month}</td>
          <td>${this.formatCurrency(entry.baseSalary)}</td>
          <td>${this.formatCurrency(entry.bonus)}</td>
          <td>${this.formatCurrency(entry.deductions)}</td>
          <td><strong>${this.formatCurrency(entry.netSalary)}</strong></td>
          <td>
            <span class="badge" style="background-color: ${statusColor}20; color: ${statusColor}">
              ${statusText}
            </span>
          </td>
          <td class="actions">
            ${entry.status === 'pending' ? `
              <button class="btn-icon" onclick="window.staffModule.markPayrollAsPaid('${entry.id}')" title="Mark as Paid">
                <i class="icon-check"></i>
              </button>
            ` : ''}
            <button class="btn-icon delete" onclick="window.staffModule.deletePayrollEntry('${entry.id}')" title="Delete">
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
   * Show attendance modal
   */
  showAttendanceModal(staffId) {
    const modal = document.getElementById('attendanceModal');
    const form = document.getElementById('attendanceForm');
    
    if (modal && form) {
      const member = this.staff.find(s => s.id === staffId);
      if (!member) return;

      form.reset();
      document.getElementById('attendanceStaffId').value = staffId;
      document.getElementById('attendanceStaffName').textContent = member.name;
      document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
      modal.style.display = 'block';
    }
  }

  /**
   * Handle attendance submission
   */
  handleAttendanceSubmit(e) {
    e.preventDefault();

    const staffId = document.getElementById('attendanceStaffId').value;
    const date = document.getElementById('attendanceDate').value;
    const status = document.getElementById('attendanceStatus').value;
    const notes = document.getElementById('attendanceNotes').value;

    if (!staffId || !date || !status) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if attendance already exists for this date
    const existing = this.attendance.find(a => a.staffId === staffId && a.date === date);
    
    if (existing) {
      existing.status = status;
      existing.notes = notes;
      existing.updatedAt = new Date().toISOString();
    } else {
      this.attendance.push({
        id: this.generateId(),
        staffId,
        date,
        status,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    this.saveAttendance();
    this.renderAttendanceTable();
    this.updateDashboard();
    
    const modal = document.getElementById('attendanceModal');
    if (modal) modal.style.display = 'none';
  }

  /**
   * Render attendance table
   */
  renderAttendanceTable() {
    const container = document.getElementById('attendanceTableContainer');
    if (!container) return;

    if (this.attendance.length === 0) {
      container.innerHTML = '<div class="empty-state">No attendance records found</div>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Staff Member</th>
            <th>Date</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.attendance
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50)
      .forEach(record => {
        const member = this.staff.find(s => s.id === record.staffId);
        const memberName = member ? member.name : 'Unknown';
        const statusColor = record.status === 'present' ? '#10B981' : record.status === 'absent' ? '#EF4444' : '#F59E0B';
        const statusText = record.status.charAt(0).toUpperCase() + record.status.slice(1);
        const date = this.formatDate(record.date);

        html += `
          <tr>
            <td>${memberName}</td>
            <td>${date}</td>
            <td>
              <span class="badge" style="background-color: ${statusColor}20; color: ${statusColor}">
                ${statusText}
              </span>
            </td>
            <td>${record.notes || '-'}</td>
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
   * Calculate total staff count
   */
  calculateTotalStaff() {
    return this.staff.length;
  }

  /**
   * Calculate active staff count
   */
  calculateActiveStaff() {
    return this.staff.filter(s => s.status === 'active').length;
  }

  /**
   * Calculate total payroll
   */
  calculateTotalPayroll() {
    return this.payroll.reduce((sum, entry) => sum + entry.netSalary, 0);
  }

  /**
   * Calculate monthly payroll
   */
  calculateMonthlyPayroll() {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return this.payroll
      .filter(entry => entry.month === currentMonth)
      .reduce((sum, entry) => sum + entry.netSalary, 0);
  }

  /**
   * Calculate attendance rate
   */
  calculateAttendanceRate(staffId) {
    const records = this.attendance.filter(a => a.staffId === staffId);
    if (records.length === 0) return 0;

    const presentCount = records.filter(a => a.status === 'present').length;
    return (presentCount / records.length * 100).toFixed(1);
  }

  /**
   * Update dashboard with staff metrics
   */
  updateDashboard() {
    const totalStaffElem = document.getElementById('totalStaff');
    const activeStaffElem = document.getElementById('activeStaff');
    const monthlyPayrollElem = document.getElementById('monthlyPayroll');

    if (totalStaffElem) {
      totalStaffElem.textContent = this.calculateTotalStaff();
    }

    if (activeStaffElem) {
      activeStaffElem.textContent = this.calculateActiveStaff();
    }

    if (monthlyPayrollElem) {
      monthlyPayrollElem.textContent = this.formatCurrency(this.calculateMonthlyPayroll());
    }
  }

  /**
   * Export staff to PDF
   */
  exportToPdf() {
    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Staff_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    const data = {
      title: 'Staff Report',
      staff: this.staff,
      roles: this.roles,
      totalStaff: this.calculateTotalStaff(),
      activeStaff: this.calculateActiveStaff(),
      generatedAt: new Date().toLocaleString()
    };

    window.exportModule.generateStaffPdf(data, filename);
  }

  /**
   * Export staff to Excel
   */
  exportToExcel() {
    if (typeof window.exportModule === 'undefined') {
      alert('Export module not available');
      return;
    }

    const filename = `Staff_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    const data = {
      staff: this.staff,
      payroll: this.payroll,
      attendance: this.attendance,
      summary: {
        totalStaff: this.calculateTotalStaff(),
        activeStaff: this.calculateActiveStaff(),
        totalPayroll: this.calculateTotalPayroll(),
        monthlyPayroll: this.calculateMonthlyPayroll()
      }
    };

    window.exportModule.generateStaffExcel(data, filename);
  }

  /**
   * Helper: Generate unique ID
   */
  generateId() {
    return 'stf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
}

// Initialize module when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.staffModule = new StaffModule();
  });
} else {
  window.staffModule = new StaffModule();
}
