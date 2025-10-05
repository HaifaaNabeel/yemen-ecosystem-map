/**
 * admin.js
 * V4: Responsive, Navbar Theme Switcher, Mobile Sidebar
 */

document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    initTheme();
    initGlobalEventListeners();

    const path = window.location.pathname.split("/").pop();
    if (path === 'admin.html' || path === 'admin') {
        initDashboardPage();
    } else if (path === 'admin-providers.html') {
        initProvidersManagementPage();
    }
});

function loadSidebar() {
    const sidebarContainer = document.getElementById('admin-sidebar-container');
    if (!sidebarContainer) return;
    const currentPage = window.location.pathname.split("/").pop();
    sidebarContainer.innerHTML = `
        <div class="sidebar-header">
            <a class="logo" href="index.html" target="_blank">
                <img src="https://rowad.org/wp-content/uploads/2023/08/logo-colored.png" alt="شعار رواد - فاتح" class="logo-light">
                <img src="https://rowad.org/wp-content/uploads/2023/08/logo-colored.png" alt="شعار رواد - داكن" class="logo-dark">
            </a>
        </div>
        <nav class="sidebar-nav">
            <div class="nav-title">القائمة الرئيسية</div>
            <a class="nav-link ${currentPage === 'admin.html' ? 'active' : ''}" href="admin.html"><i class="bi bi-grid-1x2-fill"></i> لوحة التحكم</a>
            <div class="nav-title">إدارة المحتوى</div>
            <a class="nav-link ${currentPage === 'admin-providers.html' ? 'active' : ''}" href="admin-providers.html"><i class="bi bi-building"></i> إدارة الجهات</a>
            <a class="nav-link" href="#"><i class="bi bi-file-earmark-richtext-fill"></i> المقالات والأخبار</a>
            <a class="nav-link" href="#"><i class="bi bi-files"></i> الصفحات الثابتة</a>
            <a class="nav-link" href="#"><i class="bi bi-tags-fill"></i> التصنيفات والوسوم</a>
            <a class="nav-link" href="#"><i class="bi bi-chat-left-text-fill"></i> التعليقات</a>
            <div class="nav-title">الإدارة</div>
            <a class="nav-link" href="#"><i class="bi bi-people-fill"></i> المستخدمون</a>
            <a class="nav-link" href="#"><i class="bi bi-gear-fill"></i> الإعدادات العامة</a>
        </nav>
    `;
}

function initGlobalEventListeners( ) {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                document.body.classList.toggle('sidebar-mobile-open');
            } else {
                document.body.classList.toggle('sidebar-collapsed');
            }
        });
    }
}

function initTheme() {
    const lightThemeBtn = document.getElementById('light-theme-btn');
    const darkThemeBtn = document.getElementById('dark-theme-btn');
    if (!lightThemeBtn || !darkThemeBtn) return;

    const storedTheme = localStorage.getItem('dashboard-theme') || 'light';
    setTheme(storedTheme);

    lightThemeBtn.addEventListener('click', () => setTheme('light'));
    darkThemeBtn.addEventListener('click', () => setTheme('dark'));
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dashboard-theme', theme);
    
    const lightThemeBtn = document.getElementById('light-theme-btn');
    const darkThemeBtn = document.getElementById('dark-theme-btn');
    if(theme === 'light') {
        lightThemeBtn.style.display = 'none';
        darkThemeBtn.style.display = 'block';
    } else {
        lightThemeBtn.style.display = 'block';
        darkThemeBtn.style.display = 'none';
    }
}

// ... (بقية وظائف JS من الإصدار السابق تبقى كما هي) ...
async function initDashboardPage() { /* ... */ }
function updateKpiCards(providers) { /* ... */ }
function renderCharts(providers) { /* ... */ }
function renderDonutChart(canvasId, labels, data, colors) { /* ... */ }
function renderBarChart(canvasId, labels, data, color) { /* ... */ }
async function initProvidersManagementPage() { /* ... */ }
function populateProvidersTable(providers) { /* ... */ }
function setupModal(providers) { /* ... */ }

// نسخ ولصق للوظائف التي لم تتغير من الرد السابق
async function initDashboardPage(){const providers=await fetchData();updateKpiCards(providers);renderCharts(providers)}function updateKpiCards(providers){document.getElementById("kpi-total-providers").textContent=providers.length;document.getElementById("kpi-total-governorates").textContent=new Set(providers.map(p=>p.governorate)).size;document.getElementById("kpi-total-sectors").textContent=new Set(providers.map(p=>p.sector)).size}function renderCharts(providers){if(typeof Chart==="undefined")return;const typesData=providers.reduce((acc,p)=>{acc[p.type]=(acc[p.type]||0)+1;return acc},{});const governoratesData=providers.reduce((acc,p)=>{acc[p.governorate]=(acc[p.governorate]||0)+1;return acc},{});const chartColors=["#4f46e5","#10b981","#f97316","#3b82f6","#ec4899","#8b5cf6","#ef4444"];renderDonutChart("typesChart",Object.keys(typesData),Object.values(typesData),chartColors);renderBarChart("governoratesChart",Object.keys(governoratesData),Object.values(governoratesData),chartColors[0])}function renderDonutChart(canvasId,labels,data,colors){const ctx=document.getElementById(canvasId);if(!ctx)return;new Chart(ctx,{type:"doughnut",data:{labels,datasets:[{data,backgroundColor:colors,borderColor:getComputedStyle(document.documentElement).getPropertyValue("--admin-surface").trim(),borderWidth:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{color:getComputedStyle(document.documentElement).getPropertyValue("--admin-text-secondary").trim(),font:{family:"Tajawal"}}}},cutout:"70%"}})}function renderBarChart(canvasId,labels,data,color){const ctx=document.getElementById(canvasId);if(!ctx)return;new Chart(ctx,{type:"bar",data:{labels,datasets:[{data,backgroundColor:color+"99",borderColor:color,borderWidth:1,borderRadius:5}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,ticks:{color:getComputedStyle(document.documentElement).getPropertyValue("--admin-text-secondary").trim(),stepSize:1},grid:{color:getComputedStyle(document.documentElement).getPropertyValue("--admin-border").trim()}},x:{ticks:{color:getComputedStyle(document.documentElement).getPropertyValue("--admin-text-secondary").trim()},grid:{display:!1}}}}})}async function initProvidersManagementPage(){const providers=await fetchData();populateProvidersTable(providers);setupModal(providers)}function populateProvidersTable(providers){const tableBody=document.getElementById("providers-table-body");if(!tableBody)return;tableBody.innerHTML=providers.map(p=>`<tr><td><div class="d-flex align-items-center"><img src="${p.logo}" alt="${p.name}" class="provider-logo-sm me-3"><div><div class="fw-bold">${p.name}</div></div></div></td><td>${p.type}</td><td>${p.sector}</td><td>${p.governorate}</td><td><button class="btn btn-sm btn-outline-primary edit-btn" data-id="${p.id}" data-bs-toggle="modal" data-bs-target="#providerModal"><i class="bi bi-pencil-square"></i></button><button class="btn btn-sm btn-outline-danger delete-btn" data-id="${p.id}"><i class="bi bi-trash"></i></button></td></tr>`).join("")}function setupModal(providers){const modalElement=document.getElementById("providerModal");if(!modalElement)return;const modal=new bootstrap.Modal(modalElement);const form=document.getElementById("provider-form");const modalTitle=document.getElementById("providerModalLabel");document.getElementById("add-new-provider-btn").addEventListener("click",()=>{form.reset();document.getElementById("provider-id").value="";modalTitle.textContent="إضافة جهة جديدة"});document.getElementById("providers-table-body").addEventListener("click",e=>{const editButton=e.target.closest(".edit-btn");if(editButton){const providerId=parseInt(editButton.dataset.id);const provider=providers.find(p=>p.id===providerId);if(provider){modalTitle.textContent=`تعديل: ${provider.name}`;form.querySelector('[name="id"]').value=provider.id;form.querySelector('[name="name"]').value=provider.name;form.querySelector('[name="type"]').value=provider.type;form.querySelector('[name="governorate"]').value=provider.governorate;form.querySelector('[name="sector"]').value=provider.sector;form.querySelector('[name="short_description"]').value=provider.short_description;form.querySelector('[name="description"]').value=provider.description;form.querySelector('[name="services"]').value=provider.services.join(", ")}}});form.addEventListener("submit",e=>{e.preventDefault();const formData=new FormData(form);const providerId=formData.get("id");const data=Object.fromEntries(formData.entries());console.log("بيانات للحفظ:",data);const alertContainer=document.getElementById("modal-alert-container");alertContainer.innerHTML=`<div class="alert alert-success">تم حفظ البيانات بنجاح! (هذه محاكاة)</div>`;setTimeout(()=>{alertContainer.innerHTML="";modal.hide()},2e3)})}
