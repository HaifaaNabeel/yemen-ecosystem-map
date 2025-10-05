/**
 * main.js
 * يحتوي هذا الملف على الوظائف المشتركة والمنطق الخاص بالصفحات البسيطة.
 * (index.html, entity-profile.html, admin.html)
 */

// ===================================================================================
// 1. التوجيه الرئيسي (Main Router)
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split("/").pop();

    // الصفحات المعقدة (directory, map) لها ملفات JS خاصة بها، لذلك لا نحتاج لاستدعائها هنا.
    if (path === 'index.html' || path === '') {
        displayLatestProviders();
    } else if (path === 'entity-profile.html') {
        displayEntityProfile();
    } else if (path === 'admin.html') {
        handleAdminForm();
    }
    initDirectoryPage();
    initMapPage();
    initHomePage();
    initSunburstChart(); // <-- أضف هذا السطر
});

// ===================================================================================
// 2. الوظائف المشتركة (Shared Functions)
// ===================================================================================

/**
 * وظيفة عامة لجلب البيانات من ملف JSON.
 * @returns {Promise<Array>} مصفوفة من كائنات الجهات.
 */
async function fetchData() {
    try {
        const response = await fetch('data/providers.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("لا يمكن جلب البيانات:", error);
        return [];
    }
}

/**
 * وظيفة عامة لملء قوائم الفلاتر بقيم فريدة من البيانات.
 * @param {Array} providers - مصفوفة الجهات.
 * @param {string|null} serviceId - ID عنصر select للخدمات.
 * @param {string|null} sectorId - ID عنصر select للقطاعات.
 * @param {string|null} governorateId - ID عنصر select للمحافظات.
 */
function populateFilters(providers, serviceId, sectorId, governorateId) {
    const serviceSet = new Set();
    const sectorSet = new Set();
    const governorateSet = new Set();

    providers.forEach(p => {
        p.services.forEach(s => serviceSet.add(s));
        if (p.sector) sectorSet.add(p.sector);
        if (p.governorate) governorateSet.add(p.governorate);
    });

    const createOptions = (set, elementId) => {
        if (!elementId) return; // تخطي إذا كان الـ ID هو null
        const select = document.getElementById(elementId);
        if (!select) return;
        let options = '<option value="">الكل</option>';
        Array.from(set).sort().forEach(item => options += `<option value="${item}">${item}</option>`);
        select.innerHTML = options;
    };

    createOptions(serviceSet, serviceId);
    createOptions(sectorSet, sectorId);
    createOptions(governorateSet, governorateId);
}

/**
 * وظيفة عامة لتطبيق الفلاتر على قائمة الجهات.
 * @param {Array} providers - مصفوفة الجهات الأصلية.
 * @param {string|null} nameId - ID حقل البحث بالاسم.
 * @param {string|null} serviceId - ID عنصر select للخدمات.
 * @param {string|null} sectorId - ID عنصر select للقطاعات.
 * @param {string|null} governorateId - ID عنصر select للمحافظات.
 * @returns {Array} مصفوفة الجهات بعد الفلترة.
 */
function filterProviders(providers, nameId, serviceId, sectorId, governorateId) {
    const name = nameId ? document.getElementById(nameId).value.toLowerCase() : '';
    const service = serviceId ? document.getElementById(serviceId).value : '';
    const sector = sectorId ? document.getElementById(sectorId).value : '';
    const governorate = governorateId ? document.getElementById(governorateId).value : '';

    return providers.filter(p => {
        const nameMatch = nameId ? p.name.toLowerCase().includes(name) : true;
        const serviceMatch = serviceId && service ? p.services.includes(service) : true;
        const sectorMatch = sectorId && sector ? p.sector === sector : true;
        const governorateMatch = governorateId && governorate ? p.governorate === governorate : true;
        return nameMatch && serviceMatch && sectorMatch && governorateMatch;
    });
}


// ===================================================================================
// 3. وظائف الصفحات البسيطة
// ===================================================================================

/**
 * تعرض أحدث الجهات المميزة في الصفحة الرئيسية.
 */
async function displayLatestProviders() {
    const providers = await fetchData();
    const container = document.getElementById('latest-providers-container');
    if (!container) return;
    const latest = providers.filter(p => p.is_featured).slice(0, 3);
    let html = '';
    latest.forEach(provider => {
        html += `<div class="col-lg-4 col-md-6 mb-4"><div class="card provider-card text-center shadow-sm h-100"><div class="card-body d-flex flex-column"><img src="${provider.logo}" alt="${provider.name} Logo" class="rounded-circle mx-auto card-img-top"><h5 class="card-title mt-3">${provider.name}</h5><p class="text-muted">${provider.type}</p><p class="card-text small flex-grow-1">${provider.short_description}</p><a href="entity-profile.html?id=${provider.id}" class="btn btn-outline-primary mt-auto">عرض التفاصيل</a></div></div></div>`;
    });
    container.innerHTML = html;
}

/**
 * عرض تفاصيل الجهة بناءً على ID من رابط URL.
 */
async function displayEntityProfile() {
    const params = new URLSearchParams(window.location.search);
    const providerId = parseInt(params.get('id'));
    const container = document.getElementById('profile-container');
    if (!container) return;
    if (!providerId) { container.innerHTML = '<p class="text-center lead">لم يتم تحديد جهة لعرضها.</p>'; return; }
    const providers = await fetchData();
    const provider = providers.find(p => p.id === providerId);
    if (!provider) { container.innerHTML = '<p class="text-center lead">عذراً، الجهة المطلوبة غير موجودة.</p>'; return; }
    document.title = `${provider.name} | خريطة ريادة الأعمال`;
    const socialLinks = provider.social_media ? Object.entries(provider.social_media).map(([key, value]) => value !== "#" ? `<a href="${value}" target="_blank" class="btn btn-outline-secondary btn-sm me-2"><i class="bi bi-${key}"></i></a>` : '').join('') : '';
    container.innerHTML = `<header class="profile-header mb-5"><div class="container"><img src="${provider.logo}" alt="${provider.name} Logo" class="mb-3"><h1>${provider.name}</h1><p class="lead text-muted">${provider.type} | تأسست عام ${provider.founding_year}</p><div class="mt-3">${socialLinks}</div></div></header><div class="container"><div class="row g-5"><div class="col-lg-8"><section class="profile-section"><h4>عن الجهة</h4><p>${provider.description}</p></section><section class="profile-section"><h4>الخدمات المقدمة</h4><ul class="list-group list-group-flush">${provider.services.map(s => `<li class="list-group-item"><i class="bi bi-check-circle-fill text-success me-2"></i>${s}</li>`).join('')}</ul></section>${provider.programs.length > 0 ? `<section class="profile-section"><h4>البرامج الحالية</h4>${provider.programs.map(p => `<div class="mb-3 p-3 bg-light rounded"><h5 class="fw-bold">${p.title}</h5><p class="mb-0">${p.description}</p></div>`).join('')}</section>` : ''}</div><div class="col-lg-4"><div class="card sticky-top" style="top: 6rem;"><div class="card-header"><h5 class="mb-0"><i class="bi bi-info-circle-fill me-2"></i>معلومات أساسية</h5></div><div class="card-body"><ul class="list-unstyled">
    <li class="mb-3"><i class="bi bi-people-fill me-2 text-primary"></i><strong>الجمهور:</strong> ${provider.target_audience}</li>
    <li class="mb-3"><i class="bi bi-cash-coin me-2 text-primary"></i><strong>التمويل:</strong> ${provider.investment_range}</li>
    <li class="mb-3"><i class="bi bi-geo-alt-fill me-2 text-primary"></i><strong>العنوان:</strong> ${provider.contact.address}</li>
    <li class="mb-3"><i class="bi bi-globe me-2 text-primary"></i><strong>الموقع:</strong> <a href="${provider.contact.website}" target="_blank">زيارة الموقع</a></li>
    <li class="mb-0"><i class="bi bi-envelope-fill me-2 text-primary"></i><strong>الإيميل:</strong> <a href="mailto:${provider.contact.email}">${provider.contact.email}</a></li>
    </ul></div><div class="card-footer"><strong><i class="bi bi-pin-map-fill me-2"></i>مناطق العمل:</strong> ${provider.governorate}</div></div></div></div></div>`;
}

/**
 * التعامل مع نموذج إضافة جهة جديدة (محاكاة).
 */
function handleAdminForm() {
    const form = document.getElementById('add-provider-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const newProvider = { id: Date.now(), name: formData.get('name'), type: formData.get('type'), logo: "https://via.placeholder.com/150/6c757d/FFFFFF?text=New", governorate: formData.get('governorate' ), sector: formData.get('sector'), short_description: formData.get('short_description'), description: formData.get('description'), services: formData.get('services').split(',').map(s => s.trim()), programs: [], contact: { address: formData.get('address'), website: formData.get('website'), email: formData.get('email'), phone: formData.get('phone') }, latitude: parseFloat(formData.get('latitude')), longitude: parseFloat(formData.get('longitude')) };
        console.log("بيانات الجهة الجديدة (للمحاكاة):", newProvider);
        const alertContainer = document.getElementById('alert-container');
        alertContainer.innerHTML = `<div class="alert alert-success" role="alert">تمت إضافة الجهة بنجاح! (هذه محاكاة).</div>`;
        form.reset();
        setTimeout(() => { alertContainer.innerHTML = ''; }, 5000);
    });
}
// 
/**
 * ===================================================================
 * Sunburst Chart Logic
 * ===================================================================
 */
async function initSunburstChart( ) {
    const chartDom = document.getElementById('sunburst-chart');
    if (!chartDom) return; // إذا لم يكن العنصر موجوداً في الصفحة، لا تفعل شيئاً

    const myChart = echarts.init(chartDom);
    const providers = await fetchData(); // fetchData() موجودة بالفعل

    // 1. تعريف الفئات الرئيسية وألوانها
    const categories = {
        "السياسات والقوانين": { color: '#0d6efd', icon: 'bi-briefcase-fill' },
        "رأس المال البشري": { color: '#ffc107', icon: 'bi-person-workspace' },
        "التمويل": { color: '#198754', icon: 'bi-cash-coin' },
        "الدعم المؤسسي": { color: '#dc3545', icon: 'bi-people-fill' },
        "بناء المجتمع": { color: '#6f42c1', icon: 'bi-lightbulb-fill' },
        "الابتكار والنمو": { color: '#fd7e14', icon: 'bi-graph-up-arrow' }
    };

    // 2. تحويل بياناتنا إلى التنسيق الذي تتطلبه ECharts
    const chartData = Object.keys(categories).map(catName => {
        return {
            name: catName,
            itemStyle: { color: categories[catName].color },
            children: providers
                .filter(p => p.category === catName)
                .map(p => ({
                    name: p.name,
                    value: 1, // نعطي قيمة 1 لكل جهة لتكون متساوية في الحجم
                    itemStyle: { color: categories[catName].color }
                }))
        };
    });

    // 3. إعداد خيارات المخطط
    const option = {
        series: {
            type: 'sunburst',
            data: chartData,
            radius: [0, '95%'], // حجم الدائرة الداخلية والخارجية
            sort: undefined, // للحفاظ على الترتيب الأصلي
            emphasis: {
                focus: 'ancestor' // عند التمرير، يبرز القطاع وكل فروعه
            },
            levels: [
                {}, // إعدادات المستوى 0 (المركز)
                { // إعدادات المستوى 1 (الفئات الرئيسية)
                    r0: '15%',
                    r: '55%',
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    label: {
                        rotate: 'tangential',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#fff'
                    }
                },
                { // إعدادات المستوى 2 (الجهات)
                    r0: '55%',
                    r: '95%',
                    label: {
                        align: 'right',
                        fontSize: 12,
                        color: '#333'
                    },
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff',
                        opacity: 0.7 // شفافية خفيفة للجهات
                    }
                }
            ]
        }
    };

    // 4. تطبيق الخيارات ورسم المخطط
    myChart.setOption(option);

    // لجعل المخطط متجاوباً مع تغيير حجم الشاشة
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

