/**
 * map.js
 * يحتوي هذا الملف على كل المنطق الخاص بصفحة الخريطة التفاعلية (map.html).
 */

let map;
let markers = {};

document.addEventListener('DOMContentLoaded', initMapPage);

/**
 * تهيئة صفحة الخريطة: إنشاء الخريطة، جلب البيانات، ملء الفلاتر، وعرض النتائج.
 */
async function initMapPage() {
    if (typeof L === 'undefined') {
        console.error("مكتبة Leaflet غير محملة.");
        return;
    }

    // 1. تهيئة الخريطة بتصميم أنيق من CartoDB
    map = L.map('map-page-map').setView([15.5, 48.5], 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    } ).addTo(map);

    // 2. جلب البيانات
    const allProviders = await fetchData();
    
    // 3. ملء الفلاتر
    populateFilters(allProviders, 'map-service-filter', null, 'map-governorate-filter');

    // 4. عرض كل النتائج في البداية
    updateMapAndList(allProviders);

    // 5. ربط الأحداث
    setupEventListeners(allProviders);
}

/**
 * ربط مستمعي الأحداث للفلاتر وزر الشريط الجانبي.
 * @param {Array} allProviders - مصفوفة كل الجهات.
 */
function setupEventListeners(allProviders) {
    // فلترة
    const filterForm = document.getElementById('map-filter-form');
    if (filterForm) {
        filterForm.addEventListener('input', () => {
            const filtered = filterProviders(allProviders, 'map-name-filter', 'map-service-filter', null, 'map-governorate-filter');
            updateMapAndList(filtered);
        });
    }

    // زر إخفاء/إظهار الشريط الجانبي
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-collapsed');
            sidebarToggle.querySelector('i').classList.toggle('bi-chevron-right');
            sidebarToggle.querySelector('i').classList.toggle('bi-chevron-left');
            // تحديث حجم الخريطة بعد تأخير بسيط لإعطاء وقت للحركة
            setTimeout(() => map.invalidateSize(), 300);
        });
    }
}

/**
 * تحديث كل من القائمة الجانبية والعلامات على الخريطة.
 * @param {Array} providers - مصفوفة الجهات لعرضها.
 */
function updateMapAndList(providers) {
    updateResultsList(providers);
    updateMapMarkers(providers);
}

/**
 * تحديث القائمة الجانبية بالنتائج.
 * @param {Array} providers - مصفوفة الجهات لعرضها.
 */
function updateResultsList(providers) {
    const listContainer = document.getElementById('map-results-list');
    if (!listContainer) return;

    let listHtml = '';
    if (providers.length === 0) {
        listHtml = '<div class="p-4 text-center text-muted"><i class="bi bi-info-circle fs-3"></i><p class="mt-2">لا توجد نتائج مطابقة.</p></div>';
    } else {
        providers.forEach(provider => {
            listHtml += `
                <div class="map-result-item" data-id="${provider.id}">
                    <img src="${provider.logo}" alt="${provider.name}">
                    <div class="result-info">
                        <h6 class="mb-1 fw-bold">${provider.name}</h6>
                        <small class="text-muted">${provider.type}</small>
                    </div>
                </div>
            `;
        });
    }
    listContainer.innerHTML = listHtml;

    // إضافة مستمعي الأحداث للعناصر الجديدة في القائمة
    document.querySelectorAll('.map-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const providerId = parseInt(item.dataset.id);
            const marker = markers[providerId];
            if (marker) {
                map.flyTo(marker.getLatLng(), 14);
                marker.openPopup();
            }
            document.querySelectorAll('.map-result-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

/**
 * تحديث العلامات (Markers) على الخريطة.
 * @param {Array} providers - مصفوفة الجهات لعرضها.
 */
function updateMapMarkers(providers) {
    Object.values(markers).forEach(marker => marker.remove());
    markers = {};

    providers.forEach(provider => {
        if (provider.latitude && provider.longitude) {
            // إنشاء أيقونة مخصصة
            const customIcon = createCustomIcon(provider.type);
            
            const marker = L.marker([provider.latitude, provider.longitude], { icon: customIcon }).addTo(map);
            
            // إنشاء نافذة منبثقة مخصصة
            const popupContent = `
                <div class="popup-header"><h6>${provider.name}</h6></div>
                <div class="popup-body">
                    <p><strong>النوع:</strong> ${provider.type}</p>
                    <p><strong>المحافظة:</strong> ${provider.governorate}</p>
                </div>
                <div class="popup-footer">
                    <a href="entity-profile.html?id=${provider.id}" target="_blank" class="btn btn-primary btn-sm w-100">عرض التفاصيل</a>
                </div>
            `;
            marker.bindPopup(popupContent, { className: 'custom-popup' });

            marker.on('click', () => {
                document.querySelectorAll('.map-result-item').forEach(item => {
                    item.classList.toggle('active', parseInt(item.dataset.id) === provider.id);
                });
                const activeListItem = document.querySelector(`.map-result-item[data-id='${provider.id}']`);
                if (activeListItem) {
                    activeListItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            markers[provider.id] = marker;
        }
    });
}

/**
 * إنشاء أيقونة مخصصة بناءً على نوع الجهة.
 * @param {string} type - نوع الجهة.
 * @returns {L.DivIcon} أيقونة Leaflet مخصصة.
 */
function createCustomIcon(type) {
    const { color, icon } = getProviderTypeStyle(type);
    
    const iconHtml = `
        <div class="custom-map-icon" style="background-color: ${color};">
            <i class="bi ${icon}"></i>
        </div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: '', // نتركه فارغاً لأن التنسيق موجود في CSS
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

/**
 * إرجاع اللون والأيقونة المناسبة لنوع الجهة.
 * @param {string} type - نوع الجهة.
 * @returns {object} كائن يحتوي على اللون والأيقونة.
 */
function getProviderTypeStyle(type) {
    switch (type) {
        case 'حاضنة أعمال': return { color: '#0d6efd', icon: 'bi-building' };
        case 'مسرعة أعمال': return { color: '#198754', icon: 'bi-rocket-takeoff' };
        case 'صندوق استثمار': return { color: '#ffc107', icon: 'bi-cash-coin' };
        case 'مساحة عمل مشتركة': return { color: '#dc3545', icon: 'bi-people' };
        case 'تدريب واستشارات': return { color: '#0dcaf0', icon: 'bi-lightbulb' };
        case 'تمويل أصغر': return { color: '#6f42c1', icon: 'bi-piggy-bank' };
        case 'منظمة غير ربحية': return { color: '#20c997', icon: 'bi-heart' };
        case 'مستثمرون أفراد': return { color: '#d63384', icon: 'bi-person-check' };
        case 'خدمات قانونية': return { color: '#343a40', icon: 'bi-briefcase' };
        default: return { color: '#6c757d', icon: 'bi-geo-alt' };
    }
}
