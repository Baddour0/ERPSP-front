/* ===== Shared app utilities, navigation, and API client ===== */

/* ---------- CONFIG ---------- */
const API_BASE = 'http://localhost:5000';
const TENANT_KEY = 'erp_tenant';
const TOKEN_KEY  = 'erp_token';

/* ---------- STORAGE ---------- */
const store = {
  get: k => localStorage.getItem(k),
  set: (k,v) => localStorage.setItem(k,v),
  del: k => localStorage.removeItem(k),
  json: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
};

/* ---------- TENANT / AUTH ---------- */
function getTenant() { return store.get(TENANT_KEY) || 'demo'; }
function getToken()  { return store.get(TOKEN_KEY); }
function setTenant(t){ store.set(TENANT_KEY, t); }
function logout()    { store.del(TOKEN_KEY); store.del(TENANT_KEY); window.location.href='/ERPSB-Frontend/index.html'; }

/* ---------- HTTP CLIENT ---------- */
async function request(method, path, body=null) {
  const headers = {
    'Content-Type':'application/json',
    'X-Tenant': getTenant(),
  };
  const t = getToken();
  if (t) headers['Authorization'] = 'Bearer ' + t;
  try {
    const res = await fetch(API_BASE + path, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? res.json() : res.text();
  } catch(e) {
    console.warn('[API] ' + method + ' ' + path, e.message);
    return null;   // caller handles null as offline/error
  }
}

const api = {
  get:    path      => request('GET',    path),
  post:   (path,b)  => request('POST',   path, b),
  put:    (path,b)  => request('PUT',    path, b),
  patch:  (path,b)  => request('PATCH',  path, b),
  delete: path      => request('DELETE', path),

  // Domain helpers
  invoices:  { list: ()  => api.get('/api/invoices'),
                get:  id => api.get('/api/invoices/'+id),
                create: b => api.post('/api/invoices', b),
                update: (id,b) => api.put('/api/invoices/'+id, b), },
  partners:  { list: ()  => api.get('/api/partners'),
                get:  id => api.get('/api/partners/'+id),
                create: b => api.post('/api/partners', b), },
  accounts:  { list: ()  => api.get('/api/accounts') },
  journal:   { list: ()  => api.get('/api/journal-entries') },
};

/* ---------- MOCK DATA (used when API is offline) ---------- */
const mock = {
  invoices: [
    { id:'inv-001', invoiceNumber:'INV-2024-001', issueDate:'2024-03-01', partner:{name:'Alpha Corp'},  subTotal:8500,  taxAmount:850,  total:9350,  status:'Paid' },
    { id:'inv-002', invoiceNumber:'INV-2024-002', issueDate:'2024-03-08', partner:{name:'Beta LLC'},    subTotal:3200,  taxAmount:320,  total:3520,  status:'Sent' },
    { id:'inv-003', invoiceNumber:'INV-2024-003', issueDate:'2024-03-15', partner:{name:'Gamma Inc'},   subTotal:12000, taxAmount:1200, total:13200, status:'Overdue' },
    { id:'inv-004', invoiceNumber:'INV-2024-004', issueDate:'2024-03-22', partner:{name:'Delta SA'},    subTotal:4700,  taxAmount:470,  total:5170,  status:'Draft' },
    { id:'inv-005', invoiceNumber:'INV-2024-005', issueDate:'2024-04-01', partner:{name:'Epsilon GmbH'},subTotal:9900,  taxAmount:990,  total:10890, status:'Paid' },
    { id:'inv-006', invoiceNumber:'INV-2024-006', issueDate:'2024-04-10', partner:{name:'Zeta AG'},     subTotal:2100,  taxAmount:210,  total:2310,  status:'Sent' },
  ],
  partners: [
    { id:'p-001', name:'Alpha Corp',   taxId:'EG-123456', address:'Cairo, Egypt',    type:'Customer' },
    { id:'p-002', name:'Beta LLC',     taxId:'EG-234567', address:'Alexandria, Egypt',type:'Customer' },
    { id:'p-003', name:'Gamma Inc',    taxId:'EG-345678', address:'Giza, Egypt',     type:'Vendor' },
    { id:'p-004', name:'Delta SA',     taxId:'FR-456789', address:'Paris, France',   type:'Vendor' },
    { id:'p-005', name:'Epsilon GmbH', taxId:'DE-567890', address:'Berlin, Germany', type:'Customer' },
    { id:'p-006', name:'Zeta AG',      taxId:'CH-678901', address:'Zurich, Switzerland', type:'Customer' },
  ],
  accounts: [
    { id:'a-001', code:'1100', name:'Cash & Bank',       category:'Asset',     balance:245000 },
    { id:'a-002', code:'1200', name:'Accounts Receivable',category:'Asset',    balance:87500  },
    { id:'a-003', code:'1300', name:'Inventory',         category:'Asset',     balance:134000 },
    { id:'a-004', code:'2100', name:'Accounts Payable',  category:'Liability', balance:-45200 },
    { id:'a-005', code:'2200', name:'VAT Payable',       category:'Liability', balance:-12300 },
    { id:'a-006', code:'3100', name:'Share Capital',     category:'Equity',    balance:-200000},
    { id:'a-007', code:'4100', name:'Sales Revenue',     category:'Income',    balance:-380000},
    { id:'a-008', code:'4200', name:'Service Revenue',   category:'Income',    balance:-95000 },
    { id:'a-009', code:'5100', name:'Cost of Goods Sold',category:'Expense',   balance:210000 },
    { id:'a-010', code:'5200', name:'Salaries & Wages',  category:'Expense',   balance:85000  },
    { id:'a-011', code:'5300', name:'Rent & Utilities',  category:'Expense',   balance:24000  },
  ],
  journal: [
    { id:'je-001', reference:'JE-001', date:'2024-03-01', description:'Invoice INV-2024-001 payment received', lines:[
        { account:{code:'1100',name:'Cash & Bank'},       debit:9350,  credit:0 },
        { account:{code:'1200',name:'Accounts Receivable'},debit:0,   credit:9350 },
    ]},
    { id:'je-002', reference:'JE-002', date:'2024-03-08', description:'Vendor invoice for inventory purchase', lines:[
        { account:{code:'1300',name:'Inventory'},         debit:4500,  credit:0 },
        { account:{code:'2200',name:'VAT Payable'},       debit:450,   credit:0 },
        { account:{code:'2100',name:'Accounts Payable'},  debit:0,     credit:4950 },
    ]},
  ],
};

/* ---------- FORMATTERS ---------- */
const fmt = {
  currency: (n, currency='EGP') => new Intl.NumberFormat('en-EG',{style:'currency',currency,minimumFractionDigits:2}).format(n||0),
  number:   n => new Intl.NumberFormat('en').format(n||0),
  date:     d => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—',
  percent:  n => (n||0).toFixed(1) + '%',
};

/* ---------- STATUS BADGE ---------- */
function statusBadge(status) {
  const map = {
    Draft:  'badge-draft',
    Sent:   'badge-sent',
    Paid:   'badge-paid',
    Overdue:'badge-overdue',
  };
  const dots = { Draft:'⬤', Sent:'⬤', Paid:'⬤', Overdue:'⬤' };
  return `<span class="badge ${map[status]||'badge-draft'}">${dots[status]||''} ${status}</span>`;
}
function partnerBadge(type) {
  return `<span class="badge ${type==='Customer'?'badge-customer':'badge-vendor'}">${type}</span>`;
}

/* ---------- ACTIVE NAV ---------- */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

/* ---------- TOAST ---------- */
function showToast(msg, type='success') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); t.style.cssText='position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;'; }
  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  el.style.cssText = 'min-width:260px;box-shadow:var(--shadow);animation:fadeIn 0.2s ease;';
  el.textContent = msg;
  t.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ---------- SIDEBAR TOGGLE (mobile) ---------- */
function toggleSidebar() {
  document.querySelector('.sidebar')?.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', setActiveNav);
