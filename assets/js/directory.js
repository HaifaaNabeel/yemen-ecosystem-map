/**
 * directory.js
 * يحتوي هذا الملف على كل المنطق الخاص بصفحة دليل الجهات (directory.html).
 */

// متغير لتخزين حالة العرض الحالية (grid أو list)
let currentView = 'grid'; 

// نستدعي الوظيفة الرئيسية عند تحميل محتوى الصفحة
document.addEventListener('DOMContentLoaded', initDirectoryPage);

/**
 * تهيئة صفحة الدليل: جلب البيانات، ملء الفلاتر، وعرض النتائج.
 */
async function initDirectoryPage() {
    // fetchData() هي وظيفة عامة موجودة في main.js
    const providers = await fetchData();
    
    // populateFilters() هي وظيفة عامة موجودة في main.js
    populateFilters(providers, 'service-filter', 'sector-filter', 'governorate-filter');
    
    // عرض جميع الجهات عند التحميل الأولي
    displayProviders(providers, currentView);

    // إضافة مستمع الأحداث لتطبيق الفلاتر عند تفاعل المستخدم
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('input', () => {
            // filterProviders() هي وظيفة عامة موجودة في main.js
            const filteredProviders = filterProviders(providers, 'name-filter', 'service-filter', 'sector-filter', 'governorate-filter');
            displayProviders(filteredProviders, currentView);
        });
    }

    // إضافة مستمعي الأحداث لأزرار تبديل العرض
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');

    const updateView = (newView) => {
        if (currentView !== newView) {
            currentView = newView;
            gridViewBtn.classList.toggle('active', newView === 'grid');
            listViewBtn.classList.toggle('active', newView === 'list');
            // أعد عرض النتائج المفلترة الحالية بالشكل الجديد
            const filteredProviders = filterProviders(providers, 'name-filter', 'service-filter', 'sector-filter', 'governorate-filter');
            displayProviders(filteredProviders, currentView);
        }
    };

    if (gridViewBtn) gridViewBtn.addEventListener('click', () => updateView('grid'));
    if (listViewBtn) listViewBtn.addEventListener('click', () => updateView('list'));
}

/**
 * عرض الجهات في الحاوية المخصصة بناءً على نوع العرض.
 * @param {Array} providers - مصفوفة الجهات لعرضها.
 * @param {string} view - نوع العرض ('grid' أو 'list').
 */
function displayProviders(providers, view) {
    const container = document.getElementById('directory-container');
    const resultsCountEl = document.getElementById('results-count');
    if (!container || !resultsCountEl) return;

    resultsCountEl.textContent = providers.length;

    let html = '';
    if (providers.length === 0) {
        html = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 4rem;"></i>
                <h4 class="mt-3">لا توجد نتائج مطابقة</h4>
                <p class="text-muted">حاول تعديل كلمات البحث أو الفلاتر.</p>
            </div>
        `;
    } else {
        container.className = 'row'; // Reset classes
        if (view === 'grid') {
            providers.forEach(provider => { html += getProviderCardGrid(provider); });
        } else {
            container.classList.add('list-view');
            providers.forEach(provider => { html += getProviderCardList(provider); });
        }
    }
    container.innerHTML = html;
}

/**
 * إنشاء كود HTML لبطاقة الجهة في عرض الشبكة.
 * @param {object} provider - كائن الجهة.
 * @returns {string} كود HTML للبطاقة.
 */
function getProviderCardGrid(provider) {
    const servicesHtml = provider.services.slice(0, 3).map(s => `<span class="badge bg-primary-subtle text-primary-emphasis">${s}</span>`).join(' ');
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="directory-card-grid">
                <div class="card-header d-flex align-items-center">
                    <img src="${provider.logo}" alt="${provider.name}" class="provider-logo me-3">
                    <div>
                        <h5 class="card-title mb-0">${provider.name}</h5>
                        <small class="text-muted">${provider.governorate}</small>
                    </div>
                </div>
                <div class="card-body">
                    <p class="small text-muted flex-grow-1">${provider.short_description}</p>
                    <div class="services-tags mt-2">
                        ${servicesHtml}
                        ${provider.services.length > 3 ? `<span class="badge bg-secondary-subtle text-secondary-emphasis">+${provider.services.length - 3}</span>` : ''}
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                    <small class="text-muted">${provider.type}</small>
                    <a href="entity-profile.html?id=${provider.id}" class="btn btn-sm btn-primary">عرض التفاصيل <i class="bi bi-arrow-left-short"></i></a>
                </div>
            </div>
        </div>
    `;
}

/**
 * إنشاء كود HTML لبطاقة الجهة في عرض القائمة.
 * @param {object} provider - كائن الجهة.
 * @returns {string} كود HTML للبطاقة.
 */
function getProviderCardList(provider) {
    const servicesHtml = provider.services.map(s => `<span class="badge bg-primary-subtle text-primary-emphasis me-1 mb-1">${s}</span>`).join(' ');
    return `
        <div class="col-12 mb-3">
            <div class="directory-card-list">
                <div class="card-body">
                    <img src="${provider.logo}" alt="${provider.name}" class="provider-logo me-3 d-none d-sm-block">
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title mb-0">${provider.name}</h5>
                            <a href="entity-profile.html?id=${provider.id}" class="btn btn-sm btn-outline-primary ms-3 flex-shrink-0">التفاصيل</a>
                        </div>
                        <small class="text-muted">${provider.type} - ${provider.governorate}</small>
                        <p class="small text-muted my-2 d-none d-md-block">${provider.short_description}</p>
                        <div class="services-tags mt-2">
                            ${servicesHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
