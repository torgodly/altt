/* ==========================================================================
   DENTAL CLINIC SYSTEM - CORE JAVASCRIPT ENGINE
   Includes: State Manager, Validation, Auth & Hashing, i18n (AR/EN),
   IndexedDB Attachment Storage, Interactive Odontogram, Audit Logs,
   Backup/Restore, PDF Export & Print Engine
   ========================================================================== */

(function () {
  'use strict';

  /* --- 1. i18n Translation Dictionary --- */
  const I18N = {
    ar: {
      clinicTitle: "المركز التخصصي لطب وزراعة الاسنان",
      clinicSubtitle: "نظام تسجيل وحفظ ملفات المرضى الإلكتروني",
      darkTheme: "الوضع الداكن",
      lightTheme: "الوضع الفاتح",
      langSwitch: "English",
      fileNumberLabel: "رقم الملف التلقائي",
      fileDateLabel: "تاريخ فتح الملف",

      // Section Titles
      secPersonal: "المعلومات الشخصية",
      secPersonalSub: "بيانات الهوية والتواصل للمريض",
      secMedical: "التاريخ الطبي والصحي",
      secMedicalSub: "الأسئلة الطبية الهامة لسلامة العلاج",
      secInsurance: "معلومات التأمين الصحي",
      secInsuranceSub: "تفاصيل التغطية التأمينية إن وجدت",

      // Personal Fields
      fullName: "الاسم الكامل (رباعي)",
      fullNamePlaceholder: "مثال: أحمد محمد علي حسن",
      nationalId: "رقم الهوية / الجواز",
      nationalIdPlaceholder: "رقم الهوية الوطنية أو جواز السفر",
      nationalNumber: "الرقم الوطني (اختياري)",
      nationalNumberPlaceholder: "أدخل 12 رقماً فقط بدون حروف (اختياري)",
      dob: "تاريخ الميلاد",
      gender: "الجنس",
      male: "ذكر",
      female: "أنثى",
      address: "العنوان الكامل (مع أقرب نقطة دالة)",
      addressPlaceholder: "المدينة، الحي، اسم الشارع، القرب من landmark",
      phone: "رقم الهاتف ",
      phonePlaceholder: "09XXXXXXXX",
      additionalPhone: "رقم هاتف إضافي ",
      additionalPhonePlaceholder: "09XXXXXXXX",
      emergencyName: "اسم شخص للتواصل وقت الطوارئ",
      emergencyPhone: "رقم هاتف الطوارئ ",
      maritalStatus: "الحالة الاجتماعية",
      eduStatus: "المستوى التعليمي",
      bloodType: "فصيلة الدم",
      patientNotes: "ملاحظات المريض / إضافات",
      patientNotesPlaceholder: "اكتب أي ملاحظات إضافية، أعراض خاصة، أو تفاصيل يود المريض كتابتها...",

      quadrantUR: "العلوي الأيمن (UR)",
      quadrantUL: "العلوي الأيسر (UL)",
      quadrantLR: "السفلي الأيمن (LR)",
      quadrantLL: "السفلي الأيسر (LL)",

      // Select Options
      single: "أعزب / عزباء",
      married: "متزوج / متزوجة",
      divorced: "مطلق / مطلقة",
      widowed: "أرمل / أرملة",

      primaryEdu: "ابتدائي",
      secondaryEdu: "ثانوي",
      universityEdu: "جامعي / دراسات عليا",

      // Medical Questions
      qChronic: "هل تشتكي من أي أمراض مزمنة؟",
      qMeds: "هل تتناول أي أدوية بانتظام في الوقت الحالي؟",
      qAllergies: "هل لديك حساسيه تجاه أي نوع من الأدوية؟",
      qRegularTreatment: "هل تتلقى علاجاً دورياً لأمراض مزمنة؟",
      qSurgeries: "هل أجريت أي عمليات جراحية سابقة؟",
      qExtraction: "هل خضعت لخلع أسنان سابقاً؟",
      qThyroid: "هل تعاني من أمراض الغدة الدرقية؟",
      qPressure: "هل تعاني من ارتفاع أو انخفاض ضغط الدم؟",
      qDiabetes: "هل تعاني من مرض السكري؟",
      qHeart: "هل تعاني من أمراض القلب أو سبق لك الإصابة بجلطة؟",
      qKidneyLiver: "هل تعاني من أمراض الكبد أو الكلى؟",
      qBloodThinner: "هل تتناول أدوية مسيلة للدم (مثل الأسبرين أو الوارفارين)؟",
      qAnesthesiaAllergy: "هل تعرضت سابقاً لحساسية أو مضاعفات من البنج الموضعي؟",
      qPregnancy: "(خاص بالإناث) هل أنتِ حامل أو مرضعة؟",

      yes: "نعم",
      no: "لا",

      // Insurance Fields
      hasInsurance: "هل لديك تأمين صحي؟",
      insuranceCompany: "اسم شركة التأمين",
      insuranceCardNo: "رقم بطاقة التأمين",

      // Buttons
      submitForm: "حفظ وتسجيل ملف المريض",
      resetForm: "إعادة ضبط",
      adminPanelLogin: "دخول لوحة التحكم",
      adminDashboard: "لوحة التحكم الرئيسية",
      logout: "تسجيل الخروج",

      // Validation Errors
      valRequired: "هذا الحقل مطلوب ولا يمكن تركه فارغاً",
      valNationalNum: "الرقم الوطني (إذا أُدخل) يجب أن يتكون من 12 رقماً بالضبط (أرقام فقط)",
      valPhone: "رقم الهاتف يجب أن يتكون من 10 أرقام ويبدأ بـ 09",
      valAdditionalPhone: "رقم الهاتف الإضافي يجب أن يتكون من 10 أرقام ويبدأ بـ 09",
      valFullName: "يرجى كتابة الاسم الرباعي كاملاً",

      // Modal & Receipt
      successTitle: "تم حفظ الملف بنجاح!",
      successMsg: "تم إنشاء رقم ملف المريض وإرسال البيانات للوحة التحكم.",
      printReceipt: "طباعة بطاقة المريض",
      closeModal: "إغلاق",

      // Dashboard
      followUpsTitle: "المتابعات",
      allPatients: "جميع المرضى",
      followupsOnly: "المتابعات فقط",
      nextVisitHeader: "موعد الزيارة القادم",
      followUpBtn: "المتابعة",
      printSelectedFollowups: "طباعة المتابعات المحددة",
      totalPatients: "إجمالي المرضى",
      todayRegistrations: "تسجيلات اليوم",
      monthlyRegistrations: "تسجيلات الشهر",
      recentPatients: "المرضى المضافون مؤخراً",
      searchPlaceholder: "بحث برقم الملف، الاسم، الهاتف، أو الرقم الوطني...",
      allGenders: "جميع الأجناس",
      allInsurance: "حالة التأمين",
      actions: "الإجراءات",
      viewFile: "عرض الملف",
      editFile: "تعديل",
      deleteFile: "حذف",
      printFile: "طباعة",
      exportPdf: "تصدير PDF",
      odontogramTitle: "مخطط الأسنان التفاعلي (32 سن)",
      attachmentsTitle: "المرفقات والتقارير والأشعة",
      auditLogTitle: "سجل العمليات والتدقيق",
      backupRestore: "نسخ احتياطي واستعادة",
      noData: "لا توجد سجلات مرضى حالياً"
    },
    en: {
      clinicTitle: "Advanced Dental Clinic",
      clinicSubtitle: "Digital Patient Registration & EHR System",
      darkTheme: "Dark Mode",
      lightTheme: "Light Mode",
      langSwitch: "العربية",
      fileNumberLabel: "Auto File Number",
      fileDateLabel: "File Date",

      secPersonal: "Personal Information",
      secPersonalSub: "Identity & Contact Details",
      secMedical: "Medical History",
      secMedicalSub: "Crucial medical background for safe treatment",
      secInsurance: "Medical Insurance",
      secInsuranceSub: "Insurance policy details if applicable",

      fullName: "Full Name (4-Parts)",
      fullNamePlaceholder: "e.g., Ahmed Mohamed Ali Hassan",
      nationalId: "National ID / Passport No.",
      nationalIdPlaceholder: "Enter National ID or Passport Number",
      nationalNumber: "National Number (Optional)",
      nationalNumberPlaceholder: "Enter 12 numeric digits only (Optional)",
      dob: "Date of Birth",
      gender: "Gender",
      male: "Male",
      female: "Female",
      address: "Full Address & Nearest Landmark",
      addressPlaceholder: "City, District, Street name, Landmark",
      phone: "Phone Number (10 Digits starting with 09)",
      phonePlaceholder: "09XXXXXXXX",
      additionalPhone: "Additional Phone Number (10 Digits starting with 09)",
      additionalPhonePlaceholder: "09XXXXXXXX",
      emergencyName: "Emergency Contact Name",
      emergencyPhone: "Emergency Phone (10 Digits starting with 09)",
      maritalStatus: "Marital Status",
      eduStatus: "Education Level",
      bloodType: "Blood Type",

      single: "Single",
      married: "Married",
      divorced: "Divorced",
      widowed: "Widowed",

      primaryEdu: "Primary",
      secondaryEdu: "Secondary",
      universityEdu: "University / Higher",

      qChronic: "Do you suffer from any chronic diseases?",
      qMeds: "Are you currently taking any regular medications?",
      qAllergies: "Do you have allergies to any medications?",
      qRegularTreatment: "Do you receive regular treatment for chronic illness?",
      qSurgeries: "Have you undergone previous surgeries?",
      qExtraction: "Have you had a tooth extraction before?",
      qThyroid: "Do you have thyroid gland disease?",
      qPressure: "Do you suffer from high/low blood pressure?",
      qDiabetes: "Do you have diabetes?",
      qHeart: "Do you have heart disease or history of stroke?",
      qKidneyLiver: "Do you have liver or kidney disease?",
      qBloodThinner: "Are you taking blood thinners (e.g. Aspirin, Warfarin)?",
      qAnesthesiaAllergy: "Have you had allergic reactions to local anesthesia?",
      qPregnancy: "(Female patients) Are you pregnant or breastfeeding?",

      yes: "Yes",
      no: "No",

      hasInsurance: "Do you have medical insurance?",
      insuranceCompany: "Insurance Company Name",
      insuranceCardNo: "Insurance Card Number",

      submitForm: "Save & Register Patient File",
      resetForm: "Reset Form",
      adminPanelLogin: "Admin Login",
      adminDashboard: "Admin Dashboard",
      logout: "Logout",

      valRequired: "This field is required",
      valNationalNum: "National Number must be exactly 12 digits if provided",
      valPhone: "Phone number must be exactly 10 digits starting with 09",
      valAdditionalPhone: "Additional phone number must be exactly 10 digits starting with 09",
      valFullName: "Please enter full 4-part name",

      successTitle: "Patient Saved Successfully!",
      successMsg: "File number generated and record sent to Admin Dashboard.",
      printReceipt: "Print Patient Card",
      closeModal: "Close",

      followUpsTitle: "Follow-ups",
      allPatients: "All Patients",
      followupsOnly: "Follow-ups Only",
      nextVisitHeader: "Next Visit",
      followUpBtn: "Follow-up",
      printSelectedFollowups: "Print Selected Follow-ups",
      totalPatients: "Total Patients",
      todayRegistrations: "Today's Registrations",
      monthlyRegistrations: "Monthly Registrations",
      recentPatients: "Recently Added",
      searchPlaceholder: "Search by file #, name, phone, national ID...",
      allGenders: "All Genders",
      allInsurance: "Insurance Status",
      actions: "Actions",
      viewFile: "View Record",
      editFile: "Edit",
      deleteFile: "Delete",
      printFile: "Print",
      exportPdf: "Export PDF",
      odontogramTitle: "Interactive 32-Tooth Odontogram",
      attachmentsTitle: "Attachments & X-Rays",
      auditLogTitle: "Audit Log & History",
      backupRestore: "Backup & Restore",
      noData: "No patient records found"
    }
  };

  /* --- 2. IndexedDB Engine for Attachments --- */
  class AttachmentDB {
    constructor() {
      this.dbName = 'DentalClinicFilesDB';
      this.dbVersion = 1;
      this.db = null;
    }

    async init() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName, this.dbVersion);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(this.db);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    }

    async saveFile(patientId, fileObj) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        const record = {
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          patientId: patientId,
          name: fileObj.name,
          type: fileObj.type,
          size: fileObj.size,
          dataUrl: fileObj.dataUrl,
          uploadedAt: new Date().toISOString()
        };
        const req = store.put(record);
        req.onsuccess = () => resolve(record);
        req.onerror = (e) => reject(e.target.error);
      });
    }

    async getFilesByPatient(patientId) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const req = store.getAll();
        req.onsuccess = (e) => {
          const all = e.target.result || [];
          resolve(all.filter(f => f.patientId === patientId));
        };
        req.onerror = (e) => reject(e.target.error);
      });
    }

    async deleteFile(fileId) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        const req = store.delete(fileId);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
      });
    }
  }

  const attachmentStorage = new AttachmentDB();

  /* --- 3. App Core State & Helper Utilities --- */
  window.DentalApp = {
    currentLang: localStorage.getItem('dental_lang') || 'ar',
    currentTheme: localStorage.getItem('dental_theme') || 'dark',

    // Local Storage Keys
    STORAGE_KEY_PATIENTS: 'dental_patients_db',
    STORAGE_KEY_SEQ: 'dental_next_file_seq',
    STORAGE_KEY_AUDIT: 'dental_audit_logs',
    STORAGE_KEY_USERS: 'dental_admin_users',

    // --- User Management ---
    getAdminUsers: function () {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_USERS)) || [];
      } catch (e) { return []; }
    },

    saveAdminUsers: function (usersArr) {
      localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(usersArr));
    },

    init: function () {
      this.applyTheme(this.currentTheme);
      this.applyLanguage(this.currentLang);
      this.bindGlobalEvents();
      this.initAutoFileNumber();
    },

    getPatients: function () {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_PATIENTS)) || [];
      } catch (e) {
        return [];
      }
    },

    savePatients: function (patientsArr) {
      localStorage.setItem(this.STORAGE_KEY_PATIENTS, JSON.stringify(patientsArr));
    },

    getNextFileNumber: function () {
      let seq = parseInt(localStorage.getItem(this.STORAGE_KEY_SEQ) || '1001', 10);
      const year = new Date().getFullYear();
      return `DENT-${year}-${seq}`;
    },

    incrementFileSeq: function () {
      let seq = parseInt(localStorage.getItem(this.STORAGE_KEY_SEQ) || '1001', 10);
      localStorage.setItem(this.STORAGE_KEY_SEQ, (seq + 1).toString());
    },

    addAuditLog: function (action, patientId, details, actionType) {
      const logs = JSON.parse(localStorage.getItem(this.STORAGE_KEY_AUDIT)) || [];
      const sessionUser = sessionStorage.getItem('dental_admin_user') || 'مريض / نظام';
      const now = new Date();
      // Determine actionType icon automatically if not provided
      const typeMap = {
        'register': { icon: '➕', label: 'تسجيل', color: '#10b981' },
        'edit': { icon: '✏️', label: 'تعديل', color: '#f59e0b' },
        'delete': { icon: '🗑️', label: 'حذف', color: '#ef4444' },
        'followup': { icon: '📅', label: 'متابعة', color: '#3b82f6' },
        'print': { icon: '🖨️', label: 'طباعة', color: '#8b5cf6' },
        'view': { icon: '👁️', label: 'عرض', color: '#64748b' },
        'login': { icon: '🔐', label: 'دخول', color: '#06b6d4' },
        'logout': { icon: '🚪', label: 'خروج', color: '#94a3b8' },
        'backup': { icon: '💾', label: 'نسخ', color: '#a855f7' },
        'restore': { icon: '📥', label: 'استعادة', color: '#f97316' },
        'tooth': { icon: '🦷', label: 'أسنان', color: '#14b8a6' },
        'attach': { icon: '📎', label: 'مرفق', color: '#ec4899' },
        'system': { icon: '⚙️', label: 'نظام', color: '#64748b' }
      };
      // Auto-detect actionType from action string if not given
      if (!actionType) {
        const a = action.toLowerCase();
        if (a.includes('register') || a.includes('new patient')) actionType = 'register';
        else if (a.includes('edit') || a.includes('updated')) actionType = 'edit';
        else if (a.includes('delete') || a.includes('deleted')) actionType = 'delete';
        else if (a.includes('follow-up') || a.includes('followup')) actionType = 'followup';
        else if (a.includes('print') || a.includes('طباعة')) actionType = 'print';
        else if (a.includes('view') || a.includes('opened')) actionType = 'view';
        else if (a.includes('login') || a.includes('logged in')) actionType = 'login';
        else if (a.includes('logout') || a.includes('logged out')) actionType = 'logout';
        else if (a.includes('backup') || a.includes('export')) actionType = 'backup';
        else if (a.includes('restore') || a.includes('import')) actionType = 'restore';
        else if (a.includes('tooth') || a.includes('odontogram')) actionType = 'tooth';
        else if (a.includes('attachment') || a.includes('uploaded')) actionType = 'attach';
        else actionType = 'system';
      }
      const meta = typeMap[actionType] || typeMap['system'];
      const logItem = {
        id: 'log_' + Date.now(),
        isoTimestamp: now.toISOString(),
        timestamp: now.toLocaleString('ar-EG', {
          weekday: 'long', year: 'numeric', month: 'long',
          day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        user: sessionUser,
        action: action,
        actionType: actionType,
        icon: meta.icon,
        label: meta.label,
        color: meta.color,
        patientId: patientId || 'N/A',
        details: details || '',
        page: window.location.pathname.split('/').pop() || 'unknown'
      };
      logs.unshift(logItem);
      // Keep max 500 logs
      localStorage.setItem(this.STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 500)));
    },

    getAuditLogs: function () {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY_AUDIT)) || [];
    },

    // --- Theme Switcher ---
    applyTheme: function (theme) {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('dental_theme', theme);

      const btnText = document.getElementById('theme-btn-text');
      if (btnText) {
        btnText.textContent = theme === 'dark'
          ? I18N[this.currentLang].lightTheme
          : I18N[this.currentLang].darkTheme;
      }
    },

    toggleTheme: function () {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(newTheme);
    },

    // --- i18n Switcher ---
    applyLanguage: function (lang) {
      this.currentLang = lang;
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
      localStorage.setItem('dental_lang', lang);

      // Update text nodes with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[lang] && I18N[lang][key]) {
          el.textContent = I18N[lang][key];
        }
      });

      // Update placeholders
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (I18N[lang] && I18N[lang][key]) {
          el.setAttribute('placeholder', I18N[lang][key]);
        }
      });

      // Update Theme button text
      this.applyTheme(this.currentTheme);
    },

    toggleLanguage: function () {
      const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
      this.applyLanguage(newLang);
    },

    bindGlobalEvents: function () {
      const themeBtn = document.getElementById('theme-toggle-btn');
      if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

      const langBtn = document.getElementById('lang-toggle-btn');
      if (langBtn) langBtn.addEventListener('click', () => this.toggleLanguage());
    },

    initAutoFileNumber: function () {
      const fileNumInput = document.getElementById('fileNumber');
      const fileDateInput = document.getElementById('fileDate');
      const fileBadgeEl = document.getElementById('file-number-badge');

      if (fileNumInput) {
        const fileNum = this.getNextFileNumber();
        fileNumInput.value = fileNum;
        if (fileBadgeEl) fileBadgeEl.textContent = fileNum;
      }

      if (fileDateInput) {
        const today = new Date().toISOString().split('T')[0];
        fileDateInput.value = today;
      }
    },

    // --- Toast Engine ---
    showToast: function (message, type = 'info') {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast-item ${type}`;
      toast.innerHTML = `
        <span style="font-size:1.2rem;">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <div>${message}</div>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    },

    // --- SHA-256 Hashing ---
    hashPassword: async function (password) {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  };

  /* --- 4. Patient Registration Form Validation & Submission --- */
  function initPatientRegistrationForm() {
    const form = document.getElementById('patient-registration-form');
    if (!form) return;

    // Female specific conditional question toggle
    const genderSelect = document.getElementById('gender');
    const pregnancyGroup = document.getElementById('pregnancy-question-wrapper');

    if (genderSelect && pregnancyGroup) {
      genderSelect.addEventListener('change', function () {
        if (this.value === 'Female') {
          pregnancyGroup.style.display = 'flex';
        } else {
          pregnancyGroup.style.display = 'none';
          // Reset female radio
          const femaleRadios = pregnancyGroup.querySelectorAll('input[type="radio"]');
          femaleRadios.forEach(r => r.checked = false);
        }
      });
    }

    // Insurance conditional input toggle
    const insuranceRadios = document.querySelectorAll('input[name="hasInsurance"]');
    const insuranceFields = document.getElementById('insurance-details-wrapper');

    insuranceRadios.forEach(radio => {
      radio.addEventListener('change', function () {
        if (this.value === 'Yes') {
          insuranceFields.style.display = 'grid';
        } else {
          insuranceFields.style.display = 'none';
        }
      });
    });

    // Inline field validation listeners
    const nationalNumberInput = document.getElementById('nationalNumber');
    const phoneInput = document.getElementById('phone');
    const additionalPhoneInput = document.getElementById('additionalPhone');
    const emergencyPhoneInput = document.getElementById('emergencyPhone');
    const fullNameInput = document.getElementById('fullName');

    function validateField(input, conditionFn) {
      const group = input ? input.closest('.form-group') : null;

      if (!input) return true; // optional field not found → pass

      const val = input.value.trim();
      const isValid = conditionFn(val);

      if (group) {
        if (isValid) {
          group.classList.remove('error');
          group.classList.add('valid');
        } else {
          group.classList.add('error');
          group.classList.remove('valid');
        }
      }
      return isValid;
    }

    // Input Restrictions (Numbers Only)
    [nationalNumberInput, phoneInput, additionalPhoneInput, emergencyPhoneInput].forEach(inp => {
      if (!inp) return;
      inp.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, ''); // Numbers only
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const lang = DentalApp.currentLang;

      // Validate National Number (optional — empty is OK, if filled must be exact 12 digits)
      const isNatValid = nationalNumberInput && nationalNumberInput.value.trim() === ''
        ? (nationalNumberInput.closest('.form-group')?.classList.remove('error', 'valid'), true)
        : validateField(nationalNumberInput, val => /^\d{12}$/.test(val));

      // Validate Phone: exact 10 digits starting with 09
      const isPhoneValid = validateField(
        phoneInput,
        val => /^09\d{8}$/.test(val)
      );

      // Validate Additional Phone: exact 10 digits starting with 09 (mandatory)
      const isAdditionalPhoneValid = validateField(
        additionalPhoneInput,
        val => /^09\d{8}$/.test(val)
      );

      // Validate Emergency Phone (optional — empty is OK)
      const isEmergValid = emergencyPhoneInput && emergencyPhoneInput.value.trim() === ''
        ? true
        : validateField(emergencyPhoneInput, val => /^09\d{8}$/.test(val));

      // Validate Full Name
      const isNameValid = validateField(
        fullNameInput,
        val => val.trim().length >= 4 && val.trim().split(/\s+/).length >= 2
      );

      if (!isNatValid || !isPhoneValid || !isAdditionalPhoneValid || !isEmergValid || !isNameValid) {
        DentalApp.showToast(
          lang === 'ar' ? 'يرجى تصحيح الأخطاء في النموذج قبل الحفظ' : 'Please fix form validation errors before saving',
          'error'
        );
        return;
      }

      // Collect Medical History Questions
      const medicalAnswers = {};
      const medicalKeys = [
        'qChronic', 'qMeds', 'qAllergies', 'qRegularTreatment',
        'qSurgeries', 'qExtraction', 'qThyroid', 'qPressure',
        'qDiabetes', 'qHeart', 'qKidneyLiver', 'qBloodThinner',
        'qAnesthesiaAllergy', 'qPregnancy'
      ];

      medicalKeys.forEach(key => {
        const checked = form.querySelector(`input[name="${key}"]:checked`);
        medicalAnswers[key] = checked ? checked.value : 'No';
      });

      // Construct Patient Record
      const fileNum = DentalApp.getNextFileNumber();
      const newPatient = {
        id: 'patient_' + Date.now(),
        fileNumber: fileNum,
        fileDate: document.getElementById('fileDate').value || new Date().toISOString().split('T')[0],
        fullName: fullNameInput.value.trim(),
        nationalId: document.getElementById('nationalId').value.trim(),
        nationalNumber: nationalNumberInput.value.trim(),
        dob: document.getElementById('dob').value,
        gender: genderSelect.value,
        address: document.getElementById('address').value.trim(),
        patientNotes: document.getElementById('patientNotes')?.value.trim() || '',
        phone: phoneInput.value.trim(),
        additionalPhone: additionalPhoneInput ? additionalPhoneInput.value.trim() : '',
        emergencyName: document.getElementById('emergencyName').value.trim(),
        emergencyPhone: emergencyPhoneInput.value.trim(),
        maritalStatus: document.getElementById('maritalStatus').value,
        eduStatus: document.getElementById('eduStatus').value,
        bloodType: document.getElementById('bloodType').value,
        medicalHistory: medicalAnswers,
        hasInsurance: form.querySelector('input[name="hasInsurance"]:checked')?.value || 'No',
        insuranceCompany: document.getElementById('insuranceCompany')?.value.trim() || '',
        insuranceCardNo: document.getElementById('insuranceCardNo')?.value.trim() || '',
        odontogram: {}, // Teeth condition map
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const patients = DentalApp.getPatients();
      patients.unshift(newPatient);
      DentalApp.savePatients(patients);
      DentalApp.incrementFileSeq();

      // Log action
      DentalApp.addAuditLog('Registered New Patient', newPatient.fileNumber, `Patient: ${newPatient.fullName}`);

      // Show Confirmation Modal
      showConfirmationModal(newPatient);
    });
  }

  function showConfirmationModal(patient) {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) return;

    document.getElementById('modal-file-num').textContent = patient.fileNumber;
    document.getElementById('modal-patient-name').textContent = patient.fullName;
    document.getElementById('modal-patient-phone').textContent = patient.phone;
    const addPhoneEl = document.getElementById('modal-patient-additionalPhone');
    if (addPhoneEl) addPhoneEl.textContent = patient.additionalPhone || '-';
    document.getElementById('modal-patient-nat').textContent = patient.nationalNumber || '-';
    document.getElementById('modal-patient-date').textContent = patient.fileDate;

    modal.classList.add('active');

    const closeBtnHeader = document.getElementById('btn-close-modal');
    const closeBtnFooter = document.getElementById('btn-close-modal-footer');

    const closeModalHandler = function () {
      modal.classList.remove('active');
      window.location.reload();
    };

    if (closeBtnHeader) closeBtnHeader.onclick = closeModalHandler;
    if (closeBtnFooter) closeBtnFooter.onclick = closeModalHandler;
  }

  /* --- 5. Admin Authentication Manager --- */

  // ╔══════════════════════════════════════════════════════════╗
  // ║          ★ إعدادات المستخدم الرئيسي (Super Admin)          ★  ║
  // ╠══════════════════════════════════════════════════════════╣
  // ║  لتغيير اسم المستخدم أو كلمة المرور: عدّل السطرين أدناه فقط     ║
  // ╚══════════════════════════════════════════════════════════╝
  const SUPER_ADMIN_USERNAME = 'Assad matoug';   // ← عدّل اسم المستخدم هنا
  const SUPER_ADMIN_PASSWORD = 'Assad5202320';   // ← عدّل كلمة المرور هنا

  function initAdminLogin() {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    // Check if already logged in
    if (sessionStorage.getItem('dental_admin_session')) {
      window.location.href = 'dashboard.html';
      return;
    }

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value;

      // --- Super Admin account (full privileges including user management) ---
      const isSuperAdmin =
        usernameInput === SUPER_ADMIN_USERNAME &&
        passwordInput === SUPER_ADMIN_PASSWORD;

      // --- Dynamic accounts from localStorage ---
      const dynamicUsers = DentalApp.getAdminUsers();
      const matchedDynamic = dynamicUsers.find(
        u => u.username === usernameInput && u.password === passwordInput
      );

      if (isSuperAdmin || matchedDynamic) {
        sessionStorage.setItem('dental_admin_session', 'token_' + Date.now());
        sessionStorage.setItem('dental_admin_user', usernameInput);
        // Mark super-admin flag so dashboard can restrict features
        sessionStorage.setItem('dental_is_super_admin', isSuperAdmin ? '1' : '0');
        DentalApp.addAuditLog('Admin Login', 'N/A', `User logged in: ${usernameInput}`, 'login');
        window.location.href = 'dashboard.html';
      } else {
        DentalApp.showToast(
          DentalApp.currentLang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password',
          'error'
        );
      }
    });
  }

  function checkAdminAuth() {
    if (window.location.pathname.includes('/admin/dashboard.html')) {
      if (!sessionStorage.getItem('dental_admin_session')) {
        window.location.href = 'login.html';
      }
    }
  }

  /* --- 6. Helper Functions for Date & Time (12h format & Arabic Day) --- */
  function formatTimeTo12Hour(timeStr) {
    if (!timeStr) return '-';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    if (isNaN(h)) return timeStr;

    const lang = DentalApp ? DentalApp.currentLang : 'ar';
    const ampm = h >= 12 ? (lang === 'ar' ? 'مساءً' : 'PM') : (lang === 'ar' ? 'صباحاً' : 'AM');
    h = h % 12;
    if (h === 0) h = 12;
    const hStr = h < 10 ? '0' + h : '' + h;
    return `${hStr}:${m} ${ampm}`;
  }

  function getDayNameFromDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const lang = DentalApp ? DentalApp.currentLang : 'ar';
      if (lang === 'ar') {
        const arDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return arDays[d.getDay()] || '';
      } else {
        const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return enDays[d.getDay()] || '';
      }
    } catch (e) {
      return '';
    }
  }

  /* --- 7. Admin Dashboard Engine --- */
  function initAdminDashboard() {
    if (!document.getElementById('dashboard-app')) return;

    checkAdminAuth();

    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        DentalApp.addAuditLog('Admin Logout', 'N/A', 'User logged out');
        sessionStorage.removeItem('dental_admin_session');
        sessionStorage.removeItem('dental_admin_user');
        window.location.href = 'login.html';
      });
    }

    renderDashboardStats();
    renderPatientTable();

    // Search and filter listeners
    const searchInput = document.getElementById('search-input');
    const genderFilter = document.getElementById('gender-filter');
    const insuranceFilter = document.getElementById('insurance-filter');
    const followupFilter = document.getElementById('followup-filter');
    const selectAllCb = document.getElementById('select-all-checkbox');

    if (searchInput) searchInput.addEventListener('input', renderPatientTable);
    if (genderFilter) genderFilter.addEventListener('change', renderPatientTable);
    if (insuranceFilter) insuranceFilter.addEventListener('change', renderPatientTable);
    if (followupFilter) followupFilter.addEventListener('change', renderPatientTable);

    if (selectAllCb) {
      selectAllCb.addEventListener('change', function () {
        const cbs = document.querySelectorAll('.patient-select-cb');
        cbs.forEach(cb => cb.checked = this.checked);
        DentalApp.updateBatchPrintButton();
      });
    }

    // Stat card follow-up click listener (filters to follow-ups only)
    const statCardFollowups = document.getElementById('stat-card-followups');
    if (statCardFollowups) {
      statCardFollowups.addEventListener('click', function () {
        const filterSelect = document.getElementById('followup-filter');
        if (filterSelect) {
          filterSelect.value = 'followups_only';
          renderPatientTable();
        }
      });
    }

    // Audit Log Modal Trigger
    const auditBtn = document.getElementById('view-audit-logs-btn');
    if (auditBtn) {
      auditBtn.addEventListener('click', openAuditLogsModal);
    }

    // Backup & Restore Trigger
    const backupBtn = document.getElementById('export-backup-btn');
    const restoreInput = document.getElementById('restore-backup-file');

    if (backupBtn) {
      backupBtn.addEventListener('click', exportBackupJSON);
    }
    if (restoreInput) {
      restoreInput.addEventListener('change', importBackupJSON);
    }

    // User Management — only visible to Super Admin
    const manageUsersBtn = document.getElementById('manage-users-btn');
    if (manageUsersBtn) {
      const isSuperAdmin = sessionStorage.getItem('dental_is_super_admin') === '1';
      if (isSuperAdmin) {
        manageUsersBtn.style.display = 'inline-flex';
        manageUsersBtn.addEventListener('click', function () {
          renderUsersList();
          document.getElementById('user-management-modal').classList.add('active');
        });
      } else {
        manageUsersBtn.style.display = 'none';
      }
    }

    initUserManagement();
  }

  /* --- 7b. User Management --- */
  function initUserManagement() {
    const addUserForm = document.getElementById('add-user-form');
    if (!addUserForm) return;

    addUserForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const usernameVal = document.getElementById('new-username').value.trim();
      const passwordVal = document.getElementById('new-password').value;

      if (!usernameVal || !passwordVal) {
        DentalApp.showToast('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
        return;
      }

      // Prevent using the super-admin name as a new user
      if (usernameVal === SUPER_ADMIN_USERNAME) {
        DentalApp.showToast('لا يمكن استخدام هذا الاسم', 'error');
        return;
      }

      const users = DentalApp.getAdminUsers();

      // Check for duplicate username
      if (users.find(u => u.username === usernameVal)) {
        DentalApp.showToast('اسم المستخدم موجود بالفعل', 'error');
        return;
      }

      users.push({ username: usernameVal, password: passwordVal, createdAt: new Date().toISOString() });
      DentalApp.saveAdminUsers(users);
      DentalApp.addAuditLog('Added Admin User', 'N/A', `تمّ إضافة مستخدم جديد: ${usernameVal}`, 'system');
      DentalApp.showToast(`تم إضافة المستخدم “${usernameVal}” بنجاح`, 'success');

      addUserForm.reset();
      renderUsersList();
    });
  }

  function renderUsersList() {
    const container = document.getElementById('users-list-container');
    if (!container) return;

    const users = DentalApp.getAdminUsers();

    // Always show the super-admin account as a locked entry
    const masterAccounts = [
      { username: SUPER_ADMIN_USERNAME, isMaster: true }
    ];

    const allEntries = [...masterAccounts, ...users];

    if (allEntries.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:1rem 0;">لا يوجد مستخدمون مضافون حتى الآن</p>';
      return;
    }

    container.innerHTML = allEntries.map((u, idx) => `
      <div style="
        display:flex; align-items:center; justify-content:space-between;
        background:var(--surface-card); border:1px solid var(--surface-card-border);
        border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:0.5rem;
      ">
        <div style="display:flex; align-items:center; gap:0.65rem;">
          <span style="font-size:1.2rem;">${u.isMaster ? '🔒' : '👤'}</span>
          <div>
            <div style="font-weight:700; color:var(--text-primary);">${u.username}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">
              ${u.isMaster
        ? 'حساب أساسي - لا يمكن حذفه'
        : 'تاريخ الإضافة: ' + (u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '-')
      }
            </div>
          </div>
        </div>
        ${u.isMaster ? '' : `
          <button
            class="btn btn-danger btn-sm"
            onclick="deleteAdminUser('${u.username}')"
            style="flex-shrink:0;"
          >
            🗑️ حذف
          </button>
        `}
      </div>
    `).join('');
  }

  window.deleteAdminUser = function (username) {
    if (!confirm(`هل تريد حذف المستخدم "${username}"\u061f`)) return;
    let users = DentalApp.getAdminUsers();
    users = users.filter(u => u.username !== username);
    DentalApp.saveAdminUsers(users);
    DentalApp.addAuditLog('Deleted Admin User', 'N/A', `تمّ حذف المستخدم: ${username}`, 'system');
    DentalApp.showToast(`تم حذف المستخدم “${username}”`, 'success');
    renderUsersList();
  };

  function renderDashboardStats() {
    const patients = DentalApp.getPatients();
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    const totalCount = patients.length;
    const todayCount = patients.filter(p => p.fileDate === todayStr).length;
    const monthCount = patients.filter(p => p.fileDate && p.fileDate.startsWith(currentMonthStr)).length;
    const recentCount = patients.slice(0, 5).length;
    const followUpCount = patients.filter(p => p.followUps && p.followUps.length > 0).length;

    const totalEl = document.getElementById('stat-total-patients');
    const todayEl = document.getElementById('stat-today-patients');
    const monthEl = document.getElementById('stat-month-patients');
    const recentEl = document.getElementById('stat-recent-patients');
    const followupEl = document.getElementById('stat-followup-patients');

    if (totalEl) totalEl.textContent = totalCount;
    if (todayEl) todayEl.textContent = todayCount;
    if (monthEl) monthEl.textContent = monthCount;
    if (recentEl) recentEl.textContent = recentCount;
    if (followupEl) followupEl.textContent = followUpCount;
  }

  function renderPatientTable() {
    const tbody = document.getElementById('patient-table-body');
    if (!tbody) return;

    let patients = DentalApp.getPatients();
    const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const genderVal = document.getElementById('gender-filter')?.value || '';
    const insuranceVal = document.getElementById('insurance-filter')?.value || '';
    const followupVal = document.getElementById('followup-filter')?.value || 'all';

    // Apply Filter Criteria
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    patients = patients.filter(p => {
      const matchesQuery = !query ||
        p.fileNumber.toLowerCase().includes(query) ||
        p.fullName.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        (p.additionalPhone && p.additionalPhone.includes(query)) ||
        (p.nationalNumber && p.nationalNumber.includes(query));

      const matchesGender = !genderVal || p.gender === genderVal;
      const matchesInsurance = !insuranceVal || p.hasInsurance === insuranceVal;

      let matchesFollowup = true;
      const fus = p.followUps || [];

      if (followupVal === 'followups_only') {
        // حالات لديها متابعات مسجلة
        matchesFollowup = fus.length > 0;
      } else if (followupVal === 'followups_added_today') {
        // متابعات أُضيفت اليوم (حسب createdAt)
        matchesFollowup = fus.some(fu => (fu.createdAt || '').startsWith(todayStr));
      } else if (followupVal === 'followups_added_yesterday') {
        // متابعات أُضيفت أمس
        matchesFollowup = fus.some(fu => (fu.createdAt || '').startsWith(yesterdayStr));
      } else if (followupVal === 'appointment_today') {
        // موعد الزيارة القادم هو اليوم
        matchesFollowup = fus.some(fu => fu.date === todayStr);
      } else if (followupVal === 'appointment_tomorrow') {
        // موعد الزيارة القادم هو الغد
        matchesFollowup = fus.some(fu => fu.date === tomorrowStr);
      }
      // 'all' → matchesFollowup stays true

      return matchesQuery && matchesGender && matchesInsurance && matchesFollowup;
    });

    if (patients.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">
            ${I18N[DentalApp.currentLang].noData}
          </td>
        </tr>
      `;
      DentalApp.updateBatchPrintButton();
      return;
    }

    const lang = DentalApp.currentLang;

    tbody.innerHTML = patients.map(p => {
      const latestFu = (p.followUps && p.followUps.length > 0) ? p.followUps[p.followUps.length - 1] : null;

      let nextVisitHtml = `<span style="color:var(--text-muted);">-</span>`;
      if (latestFu) {
        const dayStr = latestFu.dayName || getDayNameFromDate(latestFu.date);
        const time12Str = latestFu.time12 || formatTimeTo12Hour(latestFu.time);
        nextVisitHtml = `
          <div style="font-size:0.85rem; line-height:1.35;">
            <strong style="color:var(--color-success);">${escapeHtml(dayStr)} ${latestFu.date}</strong>
            <br>
            <span style="color:var(--accent-primary); font-weight:600; font-size:0.8rem;">⏰ ${time12Str}</span>
            ${latestFu.procedure ? `<br><span class="badge badge-info" style="font-size:0.72rem; padding:0.15rem 0.4rem; margin-top:2px; display:inline-block;">${escapeHtml(latestFu.procedure)}</span>` : ''}
          </div>
        `;
      }

      return `
        <tr>
          <td style="text-align:center;">
            <input type="checkbox" class="patient-select-cb" data-id="${p.id}" onchange="DentalApp.updateBatchPrintButton()" style="cursor:pointer; width:16px; height:16px;" />
          </td>
          <td><strong style="color:var(--accent-primary); font-family:var(--font-code);">${p.fileNumber}</strong></td>
          <td><strong>${escapeHtml(p.fullName)}</strong></td>
          <td>${p.phone}${p.additionalPhone ? `<br><small style="color:var(--text-muted);">${p.additionalPhone}</small>` : ''}</td>
          <td>${p.nationalNumber || '-'}</td>
          <td>${nextVisitHtml}</td>
          <td>
            <div style="display:flex; gap:0.35rem; justify-content:flex-end; flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" onclick="DentalApp.viewPatientModal('${p.id}')">
                👁️ ${I18N[lang].viewFile}
              </button>
              <button class="btn btn-secondary btn-sm" style="border-color:var(--color-success); color:var(--color-success);" onclick="DentalApp.openFollowUpModal('${p.id}')">
                📅 ${I18N[lang].followUpBtn || 'المتابعة'}
              </button>
              <button class="btn btn-primary btn-sm" onclick="DentalApp.editPatientModal('${p.id}')">
                ✏️ ${I18N[lang].editFile}
              </button>
              <button class="btn btn-danger btn-sm" onclick="DentalApp.deletePatientRecord('${p.id}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    DentalApp.updateBatchPrintButton();
  }

  DentalApp.updateBatchPrintButton = function () {
    const checkedCbs = document.querySelectorAll('.patient-select-cb:checked');
    const batchBtn = document.getElementById('batch-print-btn');
    const countEl = document.getElementById('selected-count');

    if (batchBtn && countEl) {
      const count = checkedCbs.length;
      countEl.textContent = count;
      if (count > 0) {
        batchBtn.style.display = 'inline-flex';
      } else {
        batchBtn.style.display = 'none';
      }
    }
  };

  DentalApp.closeModal = function () {
    const modal = document.getElementById('patient-details-modal');
    if (modal) modal.classList.remove('active');
  };

  // --- Follow-up Registration & Management Modal ---
  DentalApp.openFollowUpModal = function (patientId) {
    const patient = DentalApp.getPatients().find(p => p.id === patientId);
    if (!patient) return;

    DentalApp.addAuditLog('Opened Follow-up Modal', patient.fileNumber, `Opened follow-up registration for ${patient.fullName}`);

    const modal = document.getElementById('patient-details-modal');
    const container = document.getElementById('patient-modal-content');
    if (!modal || !container) return;

    const followUps = patient.followUps || [];
    const latestFu = followUps.length > 0 ? followUps[followUps.length - 1] : null;

    const defaultDate = latestFu ? latestFu.date : new Date().toISOString().split('T')[0];
    const defaultTime = latestFu ? latestFu.time : '10:00';
    const defaultProc = latestFu ? latestFu.procedure : '';
    const defaultNotes = latestFu ? latestFu.doctorNotes : '';

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--color-success); padding-bottom:0.75rem; margin-bottom:1.25rem;">
        <div>
          <h3 style="color:var(--color-success); margin:0;">📅 تسجيل وإدارة المتابعة للمريض</h3>
          <p style="color:var(--text-muted); font-size:0.88rem; margin:0.2rem 0 0 0;">المريض: <strong>${escapeHtml(patient.fullName)}</strong> (${patient.fileNumber}) - هاتف: ${patient.phone}</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="DentalApp.closeModal()">✕ إغلاق</button>
      </div>

      <form id="followup-registration-form" style="background:var(--surface-input); padding:1.25rem; border-radius:var(--radius-md); margin-bottom:1.5rem;">
        <h4 style="margin-bottom:1rem; color:var(--accent-primary);">📌 تسجيل موعد الزيارة القادم</h4>
        
        <div class="form-grid-3" style="margin-bottom:1rem;">
          <!-- Next Visit Date -->
          <div class="form-group">
            <label for="fu-date">تاريخ الزيارة القادمة <span class="required-asterisk">*</span></label>
            <input type="date" id="fu-date" class="form-control no-icon" value="${defaultDate}" required />
          </div>

          <!-- Day of Week Display -->
          <div class="form-group">
            <label for="fu-day-display">اليوم</label>
            <input type="text" id="fu-day-display" class="form-control no-icon" readonly style="background:var(--surface-card); font-weight:bold; color:var(--color-success);" value="${getDayNameFromDate(defaultDate)}" />
          </div>

          <!-- Next Visit Time (12h format) -->
          <div class="form-group">
            <label for="fu-time">الوقت (نظام 12 ساعة) <span class="required-asterisk">*</span></label>
            <input type="time" id="fu-time" class="form-control no-icon" value="${defaultTime}" required />
            <span id="fu-time-12h-preview" style="font-size:0.8rem; color:var(--accent-primary); margin-top:0.25rem; display:block;">
              التوقيت: <strong>${formatTimeTo12Hour(defaultTime)}</strong>
            </span>
          </div>
        </div>

        <!-- Procedure Selection -->
        <div class="form-group full-width" style="margin-bottom:1rem;">
          <label for="fu-procedure">ما الذي سيقوم به الطبيب (الإجراء) <span class="required-asterisk">*</span></label>
          <div class="procedure-chips-container">
            <span class="procedure-chip" onclick="DentalApp.selectProcedureChip('Scanning')">Scanning</span>
            <span class="procedure-chip" onclick="DentalApp.selectProcedureChip('Suture Remove')">Suture Remove</span>
            <span class="procedure-chip" onclick="DentalApp.selectProcedureChip('Impression')">Impression</span>
            <span class="procedure-chip" onclick="DentalApp.selectProcedureChip('Deliver')">Deliver</span>
          </div>
          <input type="text" id="fu-procedure" class="form-control" placeholder="اختر من الأعلى أو اكتب الإجراء هنا..." value="${escapeHtml(defaultProc)}" required />
        </div>

        <!-- Doctor Notes -->
        <div class="form-group full-width" style="margin-bottom:1.25rem;">
          <label for="fu-notes">ملاحظات للطبيب</label>
          <textarea id="fu-notes" class="form-control no-icon" rows="3" placeholder="أدخل أي ملاحظات أو تعليمات خاصة بالطبيب لهذه المتابعة...">${escapeHtml(defaultNotes)}</textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.5rem; flex-wrap:wrap;">
          <button type="button" class="btn btn-secondary" onclick="DentalApp.closeModal()">
            إغلاق النافذة
          </button>
          <button type="button" class="btn btn-secondary" onclick="DentalApp.printFollowUps(['${patient.id}'])">
            🖨️ طباعة المتابعة الحالية
          </button>
          <button type="submit" class="btn btn-primary" style="background:var(--color-success); border-color:var(--color-success);">
            💾 حفظ وتسجيل المتابعة
          </button>
        </div>
      </form>

      <!-- Registered Follow-ups History -->
      <div>
        <h4 style="margin-bottom:0.75rem; color:var(--accent-primary);">📋 سجل المتابعات والمواعيد المسجلة للمريض</h4>
        ${followUps.length === 0 ? `
          <p style="color:var(--text-muted); font-size:0.88rem;">لا توجد متابعات مسجلة لهذا المريض حالياً.</p>
        ` : `
          <div style="max-height:220px; overflow-y:auto;">
            <table class="data-table" style="font-size:0.88rem;">
              <thead>
                <tr>
                  <th>اليوم والتاريخ</th>
                  <th>الوقت (12 ساعة)</th>
                  <th>ما سيقوم به الطبيب</th>
                  <th>ملاحظات الطبيب</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${followUps.slice().reverse().map(fu => `
                  <tr>
                    <td><strong>${fu.dayName || getDayNameFromDate(fu.date)}</strong> ${fu.date}</td>
                    <td><span style="color:var(--accent-primary); font-weight:bold;">${fu.time12 || formatTimeTo12Hour(fu.time)}</span></td>
                    <td><span class="badge badge-info">${escapeHtml(fu.procedure)}</span></td>
                    <td>${escapeHtml(fu.doctorNotes) || '-'}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" style="padding:0.2rem 0.4rem;" onclick="DentalApp.deleteFollowUpEntry('${patient.id}', '${fu.id}')" title="حذف المتابعة">
                        🗑️
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    modal.classList.add('active');

    // Bind Footer Buttons for openFollowUpModal
    const printFooterBtn = document.getElementById('btn-modal-print');
    if (printFooterBtn) {
      printFooterBtn.textContent = '🖨️ طباعة المتابعة الحالية';
      printFooterBtn.onclick = () => DentalApp.printFollowUps([patient.id]);
    }
    const closeFooterBtn = document.getElementById('btn-modal-close');
    if (closeFooterBtn) {
      closeFooterBtn.onclick = () => DentalApp.closeModal();
    }

    const fuDateInput = document.getElementById('fu-date');
    const fuDayDisplay = document.getElementById('fu-day-display');
    if (fuDateInput && fuDayDisplay) {
      fuDateInput.addEventListener('change', function () {
        fuDayDisplay.value = getDayNameFromDate(this.value);
      });
    }

    const fuTimeInput = document.getElementById('fu-time');
    const fuTimePreview = document.getElementById('fu-time-12h-preview');
    if (fuTimeInput && fuTimePreview) {
      fuTimeInput.addEventListener('input', function () {
        fuTimePreview.innerHTML = `التوقيت: <strong>${formatTimeTo12Hour(this.value)}</strong>`;
      });
    }

    const fuForm = document.getElementById('followup-registration-form');
    if (fuForm) {
      fuForm.onsubmit = function (e) {
        e.preventDefault();

        const dateVal = document.getElementById('fu-date').value;
        const timeVal = document.getElementById('fu-time').value;
        const procVal = document.getElementById('fu-procedure').value.trim();
        const notesVal = document.getElementById('fu-notes').value.trim();

        if (!dateVal || !timeVal || !procVal) {
          DentalApp.showToast('يرجى استكمال جميع الحقول المطلوبة للمتابعة', 'error');
          return;
        }

        const patients = DentalApp.getPatients();
        const idx = patients.findIndex(p => p.id === patientId);
        if (idx !== -1) {
          if (!patients[idx].followUps) patients[idx].followUps = [];

          const newFollowUp = {
            id: 'fu_' + Date.now(),
            date: dateVal,
            dayName: getDayNameFromDate(dateVal),
            time: timeVal,
            time12: formatTimeTo12Hour(timeVal),
            procedure: procVal,
            doctorNotes: notesVal,
            createdAt: new Date().toISOString()
          };

          patients[idx].followUps.push(newFollowUp);
          DentalApp.savePatients(patients);

          DentalApp.addAuditLog('Saved Follow-up', patients[idx].fileNumber, `Recorded follow-up visit on ${newFollowUp.date} (${newFollowUp.time12}) - ${procVal}`);
          DentalApp.showToast('تم حفظ وتسجيل المتابعة بنجاح', 'success');

          DentalApp.openFollowUpModal(patientId);
          renderDashboardStats();
          renderPatientTable();
        }
      };
    }
  };

  DentalApp.selectProcedureChip = function (procText) {
    const input = document.getElementById('fu-procedure');
    if (input) {
      input.value = procText;
    }
    document.querySelectorAll('.procedure-chip').forEach(chip => {
      if (chip.textContent === procText) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  };

  DentalApp.deleteFollowUpEntry = function (patientId, fuId) {
    const patients = DentalApp.getPatients();
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx !== -1 && patients[idx].followUps) {
      const fu = patients[idx].followUps.find(f => f.id === fuId);
      if (confirm('هل أنت متأكد من حذف هذه المتابعة؟')) {
        patients[idx].followUps = patients[idx].followUps.filter(f => f.id !== fuId);
        DentalApp.savePatients(patients);
        DentalApp.addAuditLog(
          'Deleted Follow-up Entry',
          patients[idx].fileNumber,
          `حذف متابعة للمريض: ${patients[idx].fullName} | التاريخ: ${fu ? fu.date : '-'} | الإجراء: ${fu ? fu.procedure : '-'}`,
          'delete'
        );
        DentalApp.showToast('تم حذف المتابعة', 'info');
        DentalApp.openFollowUpModal(patientId);
        renderDashboardStats();
        renderPatientTable();
      }
    }
  };

  // --- Print Follow-ups (Single or Batch Selected) ---
  DentalApp.printFollowUps = function (patientIdsArray) {
    if (!patientIdsArray || patientIdsArray.length === 0) {
      DentalApp.showToast('يرجى تحديد حالة واحدة على الأقل لطباعة المتابعة', 'error');
      return;
    }

    const allPatients = DentalApp.getPatients();
    const targetPatients = allPatients.filter(p => patientIdsArray.includes(p.id));

    if (targetPatients.length === 0) {
      DentalApp.showToast('لم يتم العثور على بيانات المتابعة للحالات المحددة', 'error');
      return;
    }

    const container = document.getElementById('printable-followups-container');
    if (!container) return;

    const printDate = new Date().toLocaleDateString(DentalApp.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let rowsHtml = '';
    let counter = 1;

    targetPatients.forEach(patient => {
      const followUps = patient.followUps || [];
      const latestFu = followUps.length > 0 ? followUps[followUps.length - 1] : null;

      if (latestFu) {
        const dayStr = latestFu.dayName || getDayNameFromDate(latestFu.date);
        const time12Str = latestFu.time12 || formatTimeTo12Hour(latestFu.time);
        const nextVisitFull = `${dayStr} - ${latestFu.date} (${time12Str})`;

        rowsHtml += `
          <tr>
            <td style="text-align:center; font-weight:bold;">${counter++}</td>
            <td><strong>${escapeHtml(patient.fullName)}</strong><br><small style="color:#555;">ملف: ${patient.fileNumber}</small></td>
            <td dir="ltr" style="text-align:right;">${patient.phone}</td>
            <td><strong>${escapeHtml(nextVisitFull)}</strong></td>
            <td><span style="font-weight:bold;">${escapeHtml(latestFu.procedure)}</span></td>
            <td>${escapeHtml(latestFu.doctorNotes) || '-'}</td>
          </tr>
        `;
      }
    });

    if (!rowsHtml) {
      DentalApp.showToast('لا توجد متابعات مسجلة للحالات المحددة لطباعتها', 'warning');
      return;
    }

    container.innerHTML = `
      <div class="print-followups-sheet">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:18px;">
          <h2 style="margin:0; font-size:18pt; font-weight:800; color:#000;">المركز التخصصي لطب وزراعة الاسنان</h2>
          <p style="margin:4px 0 0 0; font-size:11pt; color:#333;">📋 كشف متابعات ومواعيد زيارات المرضى القادمة</p>
          <p style="margin:2px 0 0 0; font-size:9pt; color:#666;">تاريخ الطباعة: ${printDate}</p>
        </div>

        <table class="print-followups-table">
          <thead>
            <tr>
              <th style="width:35px; text-align:center;">#</th>
              <th>اسم المريض</th>
              <th>رقم هاتف المريض</th>
              <th>موعد الزيارة القادم</th>
              <th>ما الذي سيقوم به الطبيب</th>
              <th>ملاحظات للطبيب</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:9pt; color:#444;">
          <div>إمضاء الطبيب المعالج: ..........................</div>
          <div>ختم المركز: ..........................</div>
        </div>
      </div>
    `;

    container.classList.add('active-print');
    document.body.classList.add('printing-followups');

    // Log print action
    const patientNames = targetPatients.map(p => p.fullName).join(', ');
    DentalApp.addAuditLog('Printed Follow-up Report', patientIdsArray.join(', '), `طباعة كشف متابعات لـ (${targetPatients.length}) حالة - المرضى: ${patientNames}`, 'print');

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        container.classList.remove('active-print');
        document.body.classList.remove('printing-followups');
      }, 500);
    }, 150);
  };

  DentalApp.printSelectedFollowups = function () {
    const checkedCbs = Array.from(document.querySelectorAll('.patient-select-cb:checked'));
    const ids = checkedCbs.map(cb => cb.getAttribute('data-id'));
    DentalApp.printFollowUps(ids);
  };

  // --- Modal View / Edit Patient File (2-Page Print Layout & Palmer System) ---
  DentalApp.viewPatientModal = async function (patientId) {
    const patient = DentalApp.getPatients().find(p => p.id === patientId);
    if (!patient) return;

    DentalApp.addAuditLog('Viewed Patient File', patient.fileNumber, `Opened record for ${patient.fullName}`);

    const modal = document.getElementById('patient-details-modal');
    const container = document.getElementById('patient-modal-content');
    if (!modal || !container) return;

    const lang = DentalApp.currentLang;
    const med = patient.medicalHistory || {};

    // Get Attachments
    const attachments = await attachmentStorage.getFilesByPatient(patient.id);

    container.innerHTML = `
      <div id="printable-patient-file">
        
        <!-- PAGE 1: PATIENT ENTERED DATA & DOCTOR'S NOTES FIELD -->
        <div class="print-page-1">
          <!-- Clinic Header for Printout -->
          <div class="print-clinic-header" style="display:flex; align-items:center; justify-content:center; gap:0.85rem; border-bottom:2px solid var(--accent-primary); padding-bottom:0.75rem; margin-bottom:1.25rem;">
            <img src="../images/logo.png" alt="Logo" style="width:52px; height:52px; object-fit:contain; border-radius:50%; border:2px solid var(--accent-primary); flex-shrink:0;">
            <div>
              <h1 style="margin:0; font-size:1.5rem; font-weight:800; color:var(--accent-primary);">${I18N[lang].clinicTitle}</h1>
              <p style="margin:0.25rem 0 0 0; font-size:0.85rem; color:var(--text-muted);">${I18N[lang].clinicSubtitle}</p>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--accent-primary); padding-bottom:0.75rem; margin-bottom:1.25rem;">
            <div>
              <h2 style="color:var(--accent-primary); margin-bottom:0.2rem; font-size:1.35rem;">${escapeHtml(patient.fullName)}</h2>
              <p style="color:var(--text-muted); font-size:0.85rem; margin:0;">${I18N[lang].fileDateLabel}: ${patient.fileDate}</p>
            </div>
            <div class="file-badge-box">
              <span>${I18N[lang].fileNumberLabel}</span>
              <strong style="font-size:1.25rem;">${patient.fileNumber}</strong>
            </div>
          </div>

          <!-- Personal Information -->
          <h4 style="margin-bottom:0.5rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.25rem;">
            📌 ${I18N[lang].secPersonal}
          </h4>
          <div class="form-grid-3" style="background:var(--surface-input); padding:1rem 1.25rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
            <div><strong>${I18N[lang].nationalNumber}:</strong> ${patient.nationalNumber || '-'}</div>
            <div><strong>${I18N[lang].nationalId}:</strong> ${patient.nationalId || '-'}</div>
            <div><strong>${I18N[lang].dob}:</strong> ${patient.dob || '-'}</div>
            <div><strong>${I18N[lang].gender}:</strong> ${patient.gender}</div>
            <div><strong>${I18N[lang].phone}:</strong> ${patient.phone}</div>
            <div><strong>${I18N[lang].additionalPhone}:</strong> ${patient.additionalPhone || '-'}</div>
            <div><strong>${I18N[lang].emergencyPhone}:</strong> ${patient.emergencyPhone || '-'} (${patient.emergencyName || '-'})</div>
            <div><strong>${I18N[lang].bloodType}:</strong> ${patient.bloodType || '-'}</div>
            <div><strong>${I18N[lang].maritalStatus}:</strong> ${patient.maritalStatus || '-'}</div>
            <div class="full-width"><strong>${I18N[lang].address}:</strong> ${escapeHtml(patient.address) || '-'}</div>
          </div>

          <!-- Patient Notes & Additional Remarks -->
          ${patient.patientNotes ? `
            <h4 style="margin-bottom:0.4rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.25rem;">
              📝 ${I18N[lang].patientNotes || 'ملاحظات المريض / إضافات'}
            </h4>
            <div style="background:var(--surface-input); padding:0.75rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; border-right:4px solid var(--accent-primary);">
              <p style="white-space:pre-wrap; margin:0; font-size:0.88rem;">${escapeHtml(patient.patientNotes)}</p>
            </div>
          ` : ''}

          <!-- Medical History -->
          <h4 style="margin-bottom:0.5rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.25rem;">
            🏥 ${I18N[lang].secMedical}
          </h4>
          <div class="form-grid-2" style="background:var(--surface-input); padding:1rem 1.25rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
            <div>${I18N[lang].qChronic}: <span class="badge ${med.qChronic === 'Yes' ? 'badge-danger' : 'badge-success'}">${med.qChronic === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
            <div>${I18N[lang].qMeds}: <span class="badge ${med.qMeds === 'Yes' ? 'badge-warning' : 'badge-success'}">${med.qMeds === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
            <div>${I18N[lang].qAllergies}: <span class="badge ${med.qAllergies === 'Yes' ? 'badge-danger' : 'badge-success'}">${med.qAllergies === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
            <div>${I18N[lang].qPressure}: <span class="badge ${med.qPressure === 'Yes' ? 'badge-warning' : 'badge-success'}">${med.qPressure === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
            <div>${I18N[lang].qDiabetes}: <span class="badge ${med.qDiabetes === 'Yes' ? 'badge-warning' : 'badge-success'}">${med.qDiabetes === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
            <div>${I18N[lang].qHeart}: <span class="badge ${med.qHeart === 'Yes' ? 'badge-danger' : 'badge-success'}">${med.qHeart === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
            <div>${I18N[lang].qBloodThinner}: <span class="badge ${med.qBloodThinner === 'Yes' ? 'badge-danger' : 'badge-success'}">${med.qBloodThinner === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
            <div>${I18N[lang].qAnesthesiaAllergy}: <span class="badge ${med.qAnesthesiaAllergy === 'Yes' ? 'badge-danger' : 'badge-success'}">${med.qAnesthesiaAllergy === 'Yes' ? I18N[lang].yes : I18N[lang].no}</span></div>
          </div>

          <!-- Insurance Information -->
          <h4 style="margin-bottom:0.4rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.25rem;">
            💳 ${I18N[lang].secInsurance}
          </h4>
          <div style="background:var(--surface-input); padding:0.75rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
            <div><strong>${I18N[lang].hasInsurance}:</strong> ${patient.hasInsurance === 'Yes' ? `${I18N[lang].yes} (${escapeHtml(patient.insuranceCompany) || '-'} - ${patient.insuranceCardNo || '-'})` : I18N[lang].no}</div>
          </div>

          <!-- Doctor's Notes Section (خانة ملاحظة الطبيب المعالج) -->
          <h4 style="margin-bottom:0.4rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.25rem;">
            🩺 ملاحظات وتوصيات الطبيب المعالج
          </h4>
          <div class="doctor-notes-box" style="background:var(--surface-input); min-height:85px; padding:0.75rem 1rem; border-radius:var(--radius-md); border:1.5px dashed var(--accent-primary);">
            <p style="margin:0; font-size:0.82rem; color:var(--text-muted);">(مساحة مخصصة لكتابة ملاحظات وتشخيص وتوصيات الطبيب المعالج)</p>
          </div>
        </div>

        <!-- PAGE 2: PALMER DENTAL CHART, MEDICAL REPORT & ATTACHMENTS/X-RAYS -->
        <div class="print-page-2">
          
          <!-- Page 2 Header Banner -->
          <div class="print-clinic-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--accent-primary); padding-bottom:0.5rem; margin-bottom:1rem;">
            <div>
              <h3 style="margin:0; color:var(--accent-primary); font-size:1.15rem; font-weight:800;">${I18N[lang].clinicTitle} - (الصفحة الثانية)</h3>
              <p style="margin:0.2rem 0 0 0; font-size:0.82rem; color:var(--text-muted);">ملف المريض: <strong>${escapeHtml(patient.fullName)}</strong> (${patient.fileNumber})</p>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>
          </div>

          <!-- Palmer Notation Dental Grid -->
          <div class="odontogram-section" style="margin-top:0; margin-bottom:1.25rem;">
            <div class="odontogram-header">
              <h4 style="margin:0;">🦷 نظام مخطط الأسنان (Palmer Notation System)</h4>
              <div class="tooth-status-legend">
                <span class="legend-item"><span class="legend-color" style="background:#cbd5e1;"></span> Healthy</span>
                <span class="legend-item"><span class="legend-color" style="background:#ef4444;"></span> Caries</span>
                <span class="legend-item"><span class="legend-color" style="background:#3b82f6;"></span> Filled</span>
                <span class="legend-item"><span class="legend-color" style="background:#f59e0b;"></span> Crown</span>
                <span class="legend-item"><span class="legend-color" style="background:#64748b;"></span> Extracted</span>
                <span class="legend-item"><span class="legend-color" style="background:#8b5cf6;"></span> Implant</span>
              </div>
            </div>
            <p class="no-print" style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">انقر على أي سن لتعديل حالته: سليمة ➔ تسوس ➔ حشوة ➔ تاج ➔ مخلوعة ➔ زراعة</p>
            <div id="odontogram-grid-container">
              ${renderPalmerOdontogramGrid(patient)}
            </div>
          </div>

          <!-- Medical Report & Follow-ups Log (التقرير الطبي وسجل المتابعات) -->
          <div style="margin-bottom:1.25rem;">
            <h4 style="margin-bottom:0.4rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.25rem;">
              📋 التقرير الطبي وسجل العلاجات والمتابعات
            </h4>
            ${renderPatientMedicalReportHtml(patient)}
          </div>

          <!-- Attachments & X-Rays -->
          <div>
            <h4 style="margin-bottom:0.4rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.25rem;">
              📑 أشعة X-Ray والتقارير المرفقة
            </h4>
            <div class="dropzone no-print" id="patient-dropzone">
              <p>📁 اسحب وأسقط تقارير الأشعة أو المستندات هنا، أو انقر للرفع</p>
              <input type="file" id="file-upload-input" style="display:none;" multiple accept="image/*,application/pdf" />
            </div>
            <div class="attachments-grid" id="attachments-grid">
              ${renderAttachmentsGridHtml(attachments)}
            </div>
          </div>

        </div>

      </div>
    `;

    modal.classList.add('active');

    // Bind Upload File Event
    const dropzone = document.getElementById('patient-dropzone');
    const fileInput = document.getElementById('file-upload-input');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const reader = new FileReader();
          reader.onload = async (evt) => {
            await attachmentStorage.saveFile(patient.id, {
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: evt.target.result
            });
            DentalApp.addAuditLog('Uploaded Attachment', patient.fileNumber, `File: ${file.name}`);
            DentalApp.viewPatientModal(patient.id); // Reload modal
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // Modal Action Buttons (Print & PDF)
    document.getElementById('btn-modal-print').onclick = () => {
      DentalApp.addAuditLog('Printed Patient Full File', patient.fileNumber, `طباعة الملف الكامل للمريض: ${patient.fullName}`, 'print');
      window.print();
    };
    document.getElementById('btn-modal-close').onclick = () => modal.classList.remove('active');
  };

  // Active odontogram tooth condition cycle tool for Palmer system
  DentalApp.cycleToothStatus = function (patientId, toothId) {
    const patients = DentalApp.getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (!patient.odontogram) patient.odontogram = {};
    const states = ['healthy', 'caries', 'filled', 'crown', 'extracted', 'implant'];
    const current = patient.odontogram[toothId] || 'healthy';
    const nextIdx = (states.indexOf(current) + 1) % states.length;
    patient.odontogram[toothId] = states[nextIdx];

    DentalApp.savePatients(patients);
    DentalApp.addAuditLog('Updated Tooth Chart', patient.fileNumber, `Tooth ${toothId} set to ${states[nextIdx]}`);

    // Re-render grid
    const gridContainer = document.getElementById('odontogram-grid-container');
    if (gridContainer) {
      gridContainer.innerHTML = renderPalmerOdontogramGrid(patient);
    }
  };

  function renderPatientMedicalReportHtml(patient) {
    const fus = patient.followUps || [];
    if (fus.length === 0) {
      return `
        <div style="background:var(--surface-input); padding:0.75rem 1rem; border-radius:var(--radius-md); font-size:0.85rem; border:1px solid var(--surface-card-border); color:var(--text-muted);">
          📋 لا توجد جلسات علاجية أو متابعات مسجلة سابقاً لملف هذا المريض.
        </div>
      `;
    }

    return `
      <table style="width:100%; border-collapse:collapse; font-size:0.82rem; margin-top:0.3rem; background:var(--surface-input); border-radius:var(--radius-md); overflow:hidden;">
        <thead>
          <tr style="background:var(--accent-primary); color:#ffffff; text-align:right;">
            <th style="padding:6px 8px; border:1px solid var(--surface-card-border); width:28px; text-align:center;">#</th>
            <th style="padding:6px 8px; border:1px solid var(--surface-card-border); width:140px;">التاريخ والوقت</th>
            <th style="padding:6px 8px; border:1px solid var(--surface-card-border);">الإجراء العلاجي (ما قام به الطبيب)</th>
            <th style="padding:6px 8px; border:1px solid var(--surface-card-border);">ملاحظات وتوصيات الطبيب</th>
          </tr>
        </thead>
        <tbody>
          ${fus.map((fu, idx) => {
      const dayStr = fu.dayName || getDayNameFromDate(fu.date);
      const time12Str = fu.time12 || formatTimeTo12Hour(fu.time);
      return `
              <tr>
                <td style="padding:6px 8px; border:1px solid var(--surface-card-border); text-align:center; font-weight:bold;">${idx + 1}</td>
                <td style="padding:6px 8px; border:1px solid var(--surface-card-border); white-space:nowrap;">${dayStr} ${fu.date}<br><small style="color:var(--text-muted);">${time12Str}</small></td>
                <td style="padding:6px 8px; border:1px solid var(--surface-card-border); font-weight:bold; color:var(--accent-primary);">${escapeHtml(fu.procedure)}</td>
                <td style="padding:6px 8px; border:1px solid var(--surface-card-border);">${escapeHtml(fu.doctorNotes) || '-'}</td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderPalmerOdontogramGrid(patient) {
    const teethMap = patient.odontogram || {};
    const toothSvg = `<svg class="tooth-icon-svg" viewBox="0 0 24 24"><path d="M12 2C8 2 5 5 5 9c0 4 2 8 3 11 1 2 2 2 4 2s3 0 4-2c1-3 3-7 3-11 0-4-3-7-7-7z"/></svg>`;

    const makeTooth = (id, symbol) => {
      const status = teethMap[id] || 'healthy';
      return `
        <div class="tooth-box ${status}" onclick="DentalApp.cycleToothStatus('${patient.id}', '${id}')" title="${id}">
          <span class="tooth-number">${symbol}</span>
          ${toothSvg}
          <span class="tooth-label">${status}</span>
        </div>
      `;
    };

    // Palmer: teeth within each quadrant must face the MIDLINE
    // RTL: UR quadrant → teeth go from 8 (far right) to 1 (near midline, leftmost visually)
    // UR (Upper Right) displayed in RIGHT column → teeth row: 8 7 6 5 4 3 2 1 → 1 is at midline (left edge)
    // UL (Upper Left) displayed in LEFT column → teeth row: 1 2 3 4 5 6 7 8 → 1 is at midline (right edge)
    const urTeeth = ['UR8', 'UR7', 'UR6', 'UR5', 'UR4', 'UR3', 'UR2', 'UR1'].map(id => makeTooth(id, id.replace('UR', ''))).join('');
    const ulTeeth = ['UL1', 'UL2', 'UL3', 'UL4', 'UL5', 'UL6', 'UL7', 'UL8'].map(id => makeTooth(id, id.replace('UL', ''))).join('');
    const lrTeeth = ['LR8', 'LR7', 'LR6', 'LR5', 'LR4', 'LR3', 'LR2', 'LR1'].map(id => makeTooth(id, id.replace('LR', ''))).join('');
    const llTeeth = ['LL1', 'LL2', 'LL3', 'LL4', 'LL5', 'LL6', 'LL7', 'LL8'].map(id => makeTooth(id, id.replace('LL', ''))).join('');

    // Layout: in RTL, grid columns go right→left, so col 1 = right, col 2 = left
    // We want: [UR | UL] top row — UR on right side (col1), UL on left side (col2)
    //          [LR | LL] bottom row
    return `
      <div style="margin-bottom:0.5rem; text-align:center; font-size:0.75rem; color:var(--text-muted);">
        الوجه الأمامي للمريض — المركز في المنتصف
      </div>
      <div class="palmer-crosshair-container">
        <!-- Top row: UR (right) | UL (left) — in RTL col1=right, col2=left -->
        <div class="palmer-quadrant" style="border-inline-end: 2px dashed var(--accent-primary); border-bottom: 2px dashed var(--accent-primary); padding-inline-end:8px; padding-bottom:8px;">
          <div class="palmer-quadrant-title">الأيمن العلوي (UR) ↑</div>
          <div class="palmer-teeth-row">${urTeeth}</div>
        </div>
        <div class="palmer-quadrant" style="border-inline-start: 2px dashed var(--accent-primary); border-bottom: 2px dashed var(--accent-primary); padding-inline-start:8px; padding-bottom:8px;">
          <div class="palmer-quadrant-title">↑ الأيسر العلوي (UL)</div>
          <div class="palmer-teeth-row">${ulTeeth}</div>
        </div>
        <div class="palmer-quadrant" style="border-inline-end: 2px dashed var(--accent-primary); padding-inline-end:8px; padding-top:8px;">
          <div class="palmer-quadrant-title">الأيمن السفلي (LR) ↓</div>
          <div class="palmer-teeth-row">${lrTeeth}</div>
        </div>
        <div class="palmer-quadrant" style="border-inline-start: 2px dashed var(--accent-primary); padding-inline-start:8px; padding-top:8px;">
          <div class="palmer-quadrant-title">↓ الأيسر السفلي (LL)</div>
          <div class="palmer-teeth-row">${llTeeth}</div>
        </div>
      </div>
    `;
  }

  function renderAttachmentsGridHtml(attachments) {
    if (!attachments || attachments.length === 0) {
      return `<p style="font-size:0.85rem; color:var(--text-muted); grid-column:1/-1;">No attachments uploaded yet.</p>`;
    }
    return attachments.map(att => `
      <div class="attachment-card">
        <div class="attachment-preview">
          ${att.type.startsWith('image/')
        ? `<img src="${att.dataUrl}" alt="${att.name}" />`
        : `📄`}
        </div>
        <div class="attachment-name" title="${att.name}">${att.name}</div>
        <button class="btn btn-danger btn-sm" style="margin-top:0.4rem; padding:0.2rem 0.4rem;" onclick="DentalApp.deleteAttachment('${att.id}', '${att.patientId}')">🗑️</button>
      </div>
    `).join('');
  }

  DentalApp.deleteAttachment = async function (fileId, patientId) {
    const patient = DentalApp.getPatients().find(p => p.id === patientId);
    await attachmentStorage.deleteFile(fileId);
    DentalApp.addAuditLog('Deleted Attachment', patient ? patient.fileNumber : patientId, `حذف مرفق للمريض: ${patient ? patient.fullName : patientId}`, 'attach');
    DentalApp.showToast('تم حذف المرفق بنجاح', 'info');
    DentalApp.viewPatientModal(patientId);
  };

  // --- Delete Patient Record ---
  DentalApp.deletePatientRecord = function (patientId) {
    const patients = DentalApp.getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (confirm(`تأكيد الحذف: هل أنت متأكد من حذف ملف المريض "${patient.fullName}" (${patient.fileNumber})\nتحذير: هذا الإجراء لا يمكن التراجع عنه!`)) {
      const updated = patients.filter(p => p.id !== patientId);
      DentalApp.savePatients(updated);
      DentalApp.addAuditLog('Deleted Patient Record', patient.fileNumber, `تم حذف ملف المريض: ${patient.fullName} - هاتف: ${patient.phone} - رقم وطني: ${patient.nationalNumber}`, 'delete');
      DentalApp.showToast(`تم حذف ملف المريض ${patient.fullName} بنجاح`, 'success');
      renderDashboardStats();
      renderPatientTable();
    }
  };

  // --- Edit Patient Modal (Complete Multi-Section Editor) ---
  DentalApp.editPatientModal = function (patientId) {
    const patient = DentalApp.getPatients().find(p => p.id === patientId);
    if (!patient) return;

    const modal = document.getElementById('patient-details-modal');
    const container = document.getElementById('patient-modal-content');
    if (!modal || !container) return;

    const med = patient.medicalHistory || {};

    const medQuestionHtml = (key, labelText) => {
      const isYes = med[key] === 'Yes';
      return `
        <div class="medical-item" style="padding:0.6rem 0.9rem;">
          <span style="font-size:0.88rem; font-weight:600;">${labelText}</span>
          <div class="radio-group" style="padding-top:0;">
            <label class="custom-radio" style="padding:0.3rem 0.61rem; font-size:0.85rem;"><input type="radio" name="edit-${key}" value="Yes" ${isYes ? 'checked' : ''}> نعم</label>
            <label class="custom-radio" style="padding:0.3rem 0.61rem; font-size:0.85rem;"><input type="radio" name="edit-${key}" value="No" ${!isYes ? 'checked' : ''}> لا</label>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--accent-primary); padding-bottom:0.75rem; margin-bottom:1.25rem;">
        <h3 style="color:var(--accent-primary);">✏️ تعديل كافة بيانات ملف المريض: ${patient.fileNumber}</h3>
        <span style="font-size:0.85rem; color:var(--text-muted);">${patient.fileDate}</span>
      </div>

      <form id="edit-patient-form">
        <!-- 1. Personal Info -->
        <h4 style="margin-bottom:0.75rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.3rem;">📌 المعلومات الشخصية</h4>
        <div class="form-grid-3" style="margin-bottom:1.5rem;">
          <div class="form-group full-width">
            <label>الاسم الكامل (رباعي)</label>
            <input type="text" id="edit-fullName" class="form-control" value="${escapeHtml(patient.fullName)}" required />
          </div>
          <div class="form-group">
            <label>الرقم الوطني (اختياري - 12 رقم)</label>
            <input type="text" id="edit-nationalNumber" class="form-control" maxlength="12" value="${patient.nationalNumber || ''}" />
          </div>
          <div class="form-group">
            <label>رقم الهوية / الجواز</label>
            <input type="text" id="edit-nationalId" class="form-control" value="${escapeHtml(patient.nationalId || '')}" />
          </div>
          <div class="form-group">
            <label>تاريخ الميلاد</label>
            <input type="date" id="edit-dob" class="form-control no-icon" value="${patient.dob || ''}" />
          </div>
          <div class="form-group">
            <label>الجنس</label>
            <select id="edit-gender" class="form-control no-icon">
              <option value="Male" ${patient.gender === 'Male' ? 'selected' : ''}>ذكر</option>
              <option value="Female" ${patient.gender === 'Female' ? 'selected' : ''}>أنثى</option>
            </select>
          </div>
          <div class="form-group">
            <label>رقم الهاتف (10 أرقام يبدأ بـ 09)</label>
            <input type="text" id="edit-phone" class="form-control" maxlength="10" value="${patient.phone}" required />
          </div>
          <div class="form-group">
            <label>رقم هاتف إضافي (10 أرقام يبدأ بـ 09) <span class="required-asterisk">*</span></label>
            <input type="text" id="edit-additionalPhone" class="form-control" maxlength="10" value="${patient.additionalPhone || ''}" required />
          </div>
          <div class="form-group">
            <label>اسم شخص للتواصل وقت الطوارئ</label>
            <input type="text" id="edit-emergencyName" class="form-control" value="${escapeHtml(patient.emergencyName || '')}" />
          </div>
          <div class="form-group">
            <label>رقم هاتف الطوارئ</label>
            <input type="text" id="edit-emergencyPhone" class="form-control" maxlength="10" value="${patient.emergencyPhone || ''}" />
          </div>
          <div class="form-group">
            <label>فصيلة الدم</label>
            <select id="edit-bloodType" class="form-control no-icon">
              ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => `<option value="${b}" ${patient.bloodType === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>الحالة الاجتماعية</label>
            <select id="edit-maritalStatus" class="form-control no-icon">
              <option value="Single" ${patient.maritalStatus === 'Single' ? 'selected' : ''}>أعزب / عزباء</option>
              <option value="Married" ${patient.maritalStatus === 'Married' ? 'selected' : ''}>متزوج / متزوجة</option>
              <option value="Divorced" ${patient.maritalStatus === 'Divorced' ? 'selected' : ''}>مطلق / مطلقة</option>
              <option value="Widowed" ${patient.maritalStatus === 'Widowed' ? 'selected' : ''}>أرمل / أرملة</option>
            </select>
          </div>
          <div class="form-group">
            <label>المستوى التعليمي</label>
            <select id="edit-eduStatus" class="form-control no-icon">
              <option value="Primary" ${patient.eduStatus === 'Primary' ? 'selected' : ''}>ابتدائي</option>
              <option value="Secondary" ${patient.eduStatus === 'Secondary' ? 'selected' : ''}>ثانوي</option>
              <option value="University" ${patient.eduStatus === 'University' ? 'selected' : ''}>جامعي / دراسات عليا</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>العنوان الكامل</label>
            <input type="text" id="edit-address" class="form-control" value="${escapeHtml(patient.address || '')}" />
          </div>
          <div class="form-group full-width">
            <label>ملاحظات المريض / إضافات</label>
            <textarea id="edit-patientNotes" class="form-control no-icon">${escapeHtml(patient.patientNotes || '')}</textarea>
          </div>
        </div>

        <!-- 2. Medical History -->
        <h4 style="margin-bottom:0.75rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.3rem;">🏥 التاريخ الطبي والصحي</h4>
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem;">
          ${medQuestionHtml('qChronic', 'هل تشتكي من أي أمراض مزمنة؟')}
          ${medQuestionHtml('qMeds', 'هل تتناول أي أدوية بانتظام في الوقت الحالي؟')}
          ${medQuestionHtml('qAllergies', 'هل لديك حساسيه تجاه أي نوع من الأدوية؟')}
          ${medQuestionHtml('qRegularTreatment', 'هل تتلقى علاجاً دورياً لأمراض مزمنة؟')}
          ${medQuestionHtml('qSurgeries', 'هل أجريت أي عمليات جراحية سابقة؟')}
          ${medQuestionHtml('qExtraction', 'هل خضعت لخلع أسنان سابقاً؟')}
          ${medQuestionHtml('qThyroid', 'هل تعاني من أمراض الغدة الدرقية؟')}
          ${medQuestionHtml('qPressure', 'هل تعاني من ارتفاع أو انخفاض ضغط الدم؟')}
          ${medQuestionHtml('qDiabetes', 'هل تعاني من مرض السكري؟')}
          ${medQuestionHtml('qHeart', 'هل تعاني من أمراض القلب أو سبق لك الإصابة بجلطة؟')}
          ${medQuestionHtml('qKidneyLiver', 'هل تعاني من أمراض الكبد أو الكلى؟')}
          ${medQuestionHtml('qBloodThinner', 'هل تتناول أدوية مسيلة للدم (مثل الأسبرين أو الوارفارين)؟')}
          ${medQuestionHtml('qAnesthesiaAllergy', 'هل تعرضت سابقاً لحساسية أو مضاعفات من البنج الموضعي؟')}
          ${medQuestionHtml('qPregnancy', '(خاص بالإناث) هل أنتِ حامل أو مرضعة؟')}
        </div>

        <!-- 3. Insurance -->
        <h4 style="margin-bottom:0.75rem; color:var(--accent-primary); border-bottom:1px solid var(--surface-card-border); padding-bottom:0.3rem;">💳 معلومات التأمين الصحي</h4>
        <div class="form-grid-3" style="margin-bottom:1.5rem;">
          <div class="form-group">
            <label>هل يوجد تأمين صحي؟</label>
            <select id="edit-hasInsurance" class="form-control no-icon">
              <option value="Yes" ${patient.hasInsurance === 'Yes' ? 'selected' : ''}>نعم</option>
              <option value="No" ${patient.hasInsurance === 'No' ? 'selected' : ''}>لا</option>
            </select>
          </div>
          <div class="form-group">
            <label>اسم شركة التأمين</label>
            <input type="text" id="edit-insuranceCompany" class="form-control" value="${escapeHtml(patient.insuranceCompany || '')}" />
          </div>
          <div class="form-group">
            <label>رقم بطاقة التأمين</label>
            <input type="text" id="edit-insuranceCardNo" class="form-control" value="${escapeHtml(patient.insuranceCardNo || '')}" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('patient-details-modal').classList.remove('active')">إلغاء</button>
          <button type="submit" class="btn btn-primary">💾 حفظ التعديلات كاملة</button>
        </div>
      </form>
    `;

    modal.classList.add('active');

    document.getElementById('edit-patient-form').onsubmit = function (e) {
      e.preventDefault();
      const patients = DentalApp.getPatients();
      const idx = patients.findIndex(p => p.id === patientId);
      if (idx !== -1) {
        // Update Personal Info
        patients[idx].fullName = document.getElementById('edit-fullName').value.trim();
        patients[idx].nationalNumber = document.getElementById('edit-nationalNumber').value.trim();
        patients[idx].nationalId = document.getElementById('edit-nationalId').value.trim();
        patients[idx].dob = document.getElementById('edit-dob').value;
        patients[idx].gender = document.getElementById('edit-gender').value;
        patients[idx].phone = document.getElementById('edit-phone').value.trim();
        patients[idx].additionalPhone = document.getElementById('edit-additionalPhone').value.trim();
        patients[idx].emergencyName = document.getElementById('edit-emergencyName').value.trim();
        patients[idx].emergencyPhone = document.getElementById('edit-emergencyPhone').value.trim();
        patients[idx].bloodType = document.getElementById('edit-bloodType').value;
        patients[idx].maritalStatus = document.getElementById('edit-maritalStatus').value;
        patients[idx].eduStatus = document.getElementById('edit-eduStatus').value;
        patients[idx].address = document.getElementById('edit-address').value.trim();
        patients[idx].patientNotes = document.getElementById('edit-patientNotes').value.trim();

        // Update Medical History
        const medKeys = [
          'qChronic', 'qMeds', 'qAllergies', 'qRegularTreatment',
          'qSurgeries', 'qExtraction', 'qThyroid', 'qPressure',
          'qDiabetes', 'qHeart', 'qKidneyLiver', 'qBloodThinner',
          'qAnesthesiaAllergy', 'qPregnancy'
        ];
        if (!patients[idx].medicalHistory) patients[idx].medicalHistory = {};
        medKeys.forEach(k => {
          const sel = document.querySelector(`input[name="edit-${k}"]:checked`);
          patients[idx].medicalHistory[k] = sel ? sel.value : 'No';
        });

        // Update Insurance Info
        patients[idx].hasInsurance = document.getElementById('edit-hasInsurance').value;
        patients[idx].insuranceCompany = document.getElementById('edit-insuranceCompany').value.trim();
        patients[idx].insuranceCardNo = document.getElementById('edit-insuranceCardNo').value.trim();

        DentalApp.savePatients(patients);
        DentalApp.addAuditLog('Edited Patient Record', patient.fileNumber, `Updated complete details for ${patients[idx].fullName}`);
        DentalApp.showToast('تم حفظ وتعديل جميع بيانات المريض بنجاح', 'success');
        modal.classList.remove('active');
        renderDashboardStats();
        renderPatientTable();
      }
    };
  };

  // --- Audit Logs Modal ---
  function openAuditLogsModal() {
    const modal = document.getElementById('patient-details-modal');
    const container = document.getElementById('patient-modal-content');
    if (!modal || !container) return;

    renderAuditLogsContent(container, 'all');
    modal.classList.add('active');

    // Bind footer buttons
    const closeBtn = document.getElementById('btn-modal-close');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
    const printBtn = document.getElementById('btn-modal-print');
    if (printBtn) {
      printBtn.textContent = '🗑️ مسح السجل';
      printBtn.onclick = () => {
        if (confirm('هل أنت متأكد من مسح جميع سجلات التدقيق؟ لا يمكن التراجع عن هذا الإجراء.')) {
          localStorage.removeItem(DentalApp.STORAGE_KEY_AUDIT);
          DentalApp.addAuditLog('Cleared Audit Log', 'N/A', 'تم مسح سجل التدقيق بالكامل', 'system');
          renderAuditLogsContent(container, 'all');
          DentalApp.showToast('تم مسح سجل التدقيق', 'info');
        }
      };
    }
  }

  function renderAuditLogsContent(container, filterType) {
    let logs = DentalApp.getAuditLogs();

    const typeLabels = {
      all: { ar: 'جميع العمليات', icon: '📋' },
      register: { ar: 'تسجيل', icon: '➕' },
      edit: { ar: 'تعديل', icon: '✏️' },
      delete: { ar: 'حذف', icon: '🗑️' },
      followup: { ar: 'متابعة', icon: '📅' },
      print: { ar: 'طباعة', icon: '🖨️' },
      view: { ar: 'عرض', icon: '👁️' },
      login: { ar: 'دخول', icon: '🔐' },
      logout: { ar: 'خروج', icon: '🚪' },
      backup: { ar: 'نسخ احتياطي', icon: '💾' },
      restore: { ar: 'استعادة', icon: '📥' },
      tooth: { ar: 'مخطط الأسنان', icon: '🦷' },
      attach: { ar: 'مرفقات', icon: '📎' },
      system: { ar: 'نظام', icon: '⚙️' }
    };

    if (filterType !== 'all') {
      logs = logs.filter(l => l.actionType === filterType);
    }

    const filterBtns = Object.entries(typeLabels).map(([key, val]) => {
      const isActive = filterType === key;
      return `<button onclick="window._auditFilterChange('${key}')" style="
        border:none; padding:0.3rem 0.7rem; border-radius:999px; font-size:0.78rem;
        cursor:pointer; font-family:inherit;
        background:${isActive ? 'var(--accent-primary)' : 'var(--surface-input)'};
        color:${isActive ? '#fff' : 'var(--text-muted)'}; margin:0.2rem;
        transition:all 0.2s; font-weight:${isActive ? '700' : '400'};
      ">${val.icon} ${val.ar}</button>`;
    }).join('');

    const rowsHtml = logs.length === 0
      ? `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">لا توجد سجلات مطابقة</td></tr>`
      : logs.map((l, idx) => {
        const icon = l.icon || '⚙️';
        const color = l.color || '#64748b';
        const label = l.label || l.actionType || '-';
        const rowBg = idx % 2 === 0 ? 'var(--surface-card)' : 'transparent';
        return `
            <tr style="background:${rowBg};">
              <td style="white-space:nowrap; font-size:0.75rem; color:var(--text-muted); min-width:160px;">${escapeHtml(l.timestamp || '-')}</td>
              <td>
                <span style="display:inline-flex; align-items:center; gap:0.3rem; background:${color}22; color:${color};
                  border:1px solid ${color}55; padding:0.2rem 0.5rem; border-radius:999px; font-size:0.8rem; font-weight:700; white-space:nowrap;">
                  ${icon} ${escapeHtml(label)}
                </span>
              </td>
              <td style="font-weight:600; font-size:0.85rem;">${escapeHtml(l.user || 'N/A')}</td>
              <td><code style="font-size:0.8rem; color:var(--accent-primary);">${escapeHtml(l.patientId || '-')}</code></td>
              <td style="font-size:0.83rem; color:var(--text-primary); max-width:280px; white-space:pre-wrap; word-break:break-word;">${escapeHtml(l.details || '-')}</td>
            </tr>
          `;
      }).join('');

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--accent-primary); padding-bottom:0.75rem; margin-bottom:1rem;">
        <div>
          <h3 style="margin:0; color:var(--accent-primary);">📋 سجل العمليات والتدقيق</h3>
          <p style="margin:0.2rem 0 0 0; font-size:0.82rem; color:var(--text-muted);">إجمالي السجلات: <strong>${DentalApp.getAuditLogs().length}</strong> | معروض: <strong>${logs.length}</strong></p>
        </div>
      </div>

      <!-- Filter Chips -->
      <div style="margin-bottom:1rem; display:flex; flex-wrap:wrap; gap:0.2rem;">
        ${filterBtns}
      </div>

      <!-- Logs Table -->
      <div style="max-height:55vh; overflow-y:auto; border-radius:var(--radius-md); border:1px solid var(--surface-card-border);">
        <table class="data-table" style="font-size:0.85rem; margin:0;">
          <thead style="position:sticky; top:0; z-index:2; background:var(--surface-card);">
            <tr>
              <th style="white-space:nowrap;">التوقيت</th>
              <th>نوع العملية</th>
              <th>المستخدم</th>
              <th>رقم الملف</th>
              <th>تفاصيل العملية</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    // Bind the filter change function on window so inline onclick works
    window._auditFilterChange = function (type) {
      renderAuditLogsContent(container, type);
    };
  }

  // --- JSON Backup & Restore ---
  function exportBackupJSON() {
    const data = {
      patients: DentalApp.getPatients(),
      auditLogs: DentalApp.getAuditLogs(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    DentalApp.addAuditLog('Exported System Backup', 'N/A', 'Exported JSON data file');
    DentalApp.showToast('Backup file downloaded', 'success');
  }

  function importBackupJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported.patients && Array.isArray(imported.patients)) {
          DentalApp.savePatients(imported.patients);
          if (imported.auditLogs) {
            localStorage.setItem(DentalApp.STORAGE_KEY_AUDIT, JSON.stringify(imported.auditLogs));
          }
          DentalApp.addAuditLog('Restored System Backup', 'N/A', `Restored ${imported.patients.length} patient records`);
          DentalApp.showToast('System data restored successfully!', 'success');
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (err) {
        DentalApp.showToast('Invalid backup file format', 'error');
      }
    };
    reader.readAsText(file);
  }

  // Helper Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  // Initializer Trigger on DOM Ready
  document.addEventListener('DOMContentLoaded', function () {
    DentalApp.init();
    initPatientRegistrationForm();
    initAdminLogin();
    initAdminDashboard();
  });

})();
