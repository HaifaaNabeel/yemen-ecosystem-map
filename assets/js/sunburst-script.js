// انتظر حتى يتم تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function () {

    // ابحث عن العنصر الحاوي للمخطط
    const chartDom = document.getElementById('sunburst-container');

    // إذا لم يتم العثور على العنصر، أوقف التنفيذ
    if (!chartDom) {
        console.error("خطأ: لم يتم العثور على العنصر الحاوي للمخطط #sunburst-container");
        return;
    }

    // تهيئة ECharts على العنصر
    const myChart = echarts.init(chartDom);

    // ======================================================
    // البيانات التجريبية (مضمنة هنا مباشرة لسهولة الاختبار)
    // ======================================================
    const data = [
        {
            name: 'التمويل',
            itemStyle: { color: '#198754' }, // أخضر
            children: [
                { name: 'بنك الأمل', value: 1, itemStyle: { color: '#198754' } },
                { name: 'صندوق الاستثمار', value: 1, itemStyle: { color: '#198754' } },
                { name: 'FasterCapital', value: 1, itemStyle: { color: '#198754' } },
            ]
        },
        {
            name: 'الدعم المؤسسي',
            itemStyle: { color: '#dc3545' }, // أحمر
            children: [
                { name: 'مؤسسة رواد', value: 1, itemStyle: { color: '#dc3545' } },
                { name: 'حاضنة صنعاء', value: 1, itemStyle: { color: '#dc3545' } },
                { name: 'مسرعة عدن', value: 1, itemStyle: { color: '#dc3545' } },
                { name: 'Yemen Business Club', value: 1, itemStyle: { color: '#dc3545' } },
            ]
        },
        {
            name: 'رأس المال البشري',
            itemStyle: { color: '#ffc107' }, // أصفر
            children: [
                { name: 'جامعة صنعاء', value: 1, itemStyle: { color: '#ffc107' } },
                { name: 'جامعة حضرموت', value: 1, itemStyle: { color: '#ffc107' } },
                { name: 'مبادرة تدريب', value: 1, itemStyle: { color: '#ffc107' } },
            ]
        },
        {
            name: 'السياسات',
            itemStyle: { color: '#0d6efd' }, // أزرق
            children: [
                { name: 'وزارة الصناعة', value: 1, itemStyle: { color: '#0d6efd' } },
                { name: 'الهيئة العامة للاستثمار', value: 1, itemStyle: { color: '#0d6efd' } },
            ]
        }
    ];

    // ======================================================
    // إعدادات المخطط (Option)
    // ======================================================
    const option = {
        // إضافة شعار اليمن في المنتصف
        graphic: {
            elements: [
                {
                    type: 'image',
                    style: {
                        // استخدمنا علم اليمن بصيغة SVG لضمان جودة عالية
                        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MDAgNjAwIj4KICA8cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI0ZGRiIvPgogIDxyZWN0IHdpZHRoPSI5MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkZGIi8+CiAgPHJlY3Qgd2lkdGg9IjkwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMwMDAiLz4KICA8cmVjdCB5PSIyMDAiIHdpZHRoPSI5MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGIi8+CiAgPHJlY3QgeT0iNDAMCIgd2lkdGg9IjkwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNDRTAwMDAiLz4KPC9zdmc+',
                        width: 80,
                        height: 80,
                        // تحديد موقع الصورة في منتصف الدائرة
                        x: 'center',
                        y: 'center'
                    }
                }
            ]
        },
        // ======================================================
                //  Tooltip Configuration (الجزء الجديد والمهم)
                // ======================================================
                tooltip: {
                    trigger: 'item', // تفعيل الـ tooltip عند التأشير على عنصر
                    formatter: function (params) {
                        // params يحتوي على كل معلومات العنصر الذي تم التأشير عليه
                        
                        // إذا كان العنصر ليس له أب (أي أنه فئة رئيسية)
                        if (params.treePathInfo.length === 1) {
                            const categoryName = params.name;
                            const providerCount = params.treePathInfo[0].children.length;
                            
                            return `
                                <div style="font-family: 'Tajawal', sans-serif; text-align: right;">
                                    <strong style="font-size: 16px;">${categoryName}</strong>
                                    <hr style="margin: 5px 0;">
                                    يحتوي هذا القطاع على <strong>${providerCount}</strong> جهة
                                </div>
                            `;
                        } 
                        // إذا كان العنصر له أب (أي أنه جهة فردية)
                        else {
                            const providerName = params.name;
                            const categoryName = params.treePathInfo[0].name; // اسم الفئة الرئيسية
                            
                            return `
                                <div style="font-family: 'Tajawal', sans-serif; text-align: right;">
                                    <strong style="font-size: 16px;">${providerName}</strong>
                                    <hr style="margin: 5px 0;">
                                    الفئة: <strong>${categoryName}</strong>
                                      

                                    <small style="color: #888;">(انقر لعرض التفاصيل)</small>
                                </div>
                            `;
                        }
                    },
                    // تخصيص تصميم الـ tooltip
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', // خلفية بيضاء شبه شفافة
                    borderColor: '#dee2e6',
                    borderWidth: 1,
                    padding: [10, 15],
                    textStyle: {
                        color: '#212529', // لون نص داكن
                        fontSize: 14
                    },
                    extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border-radius: 8px;' // إضافة ظل وتدوير للحواف
                },
        
        series: {
            type: 'sunburst',
            data: data,
            radius: ['15%', '95%'], // حجم الدائرة الداخلية والخارجية
            sort: undefined,
            emphasis: {
                focus: 'ancestor'
            },
            levels: [
                {}, // المستوى 0 (المركز)
                { // المستوى 1 (الفئات الرئيسية)
                    r0: '15%',
                    r: '50%',
                    itemStyle: { borderWidth: 3, borderColor: '#fff' },
                    label: {
                        rotate: 'tangential',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#fff',
                        padding: 4,
                        textShadowBlur: 5,
                        textShadowColor: 'rgba(0, 0, 0, 0.3)'
                    }
                },
                { // المستوى 2 (الجهات)
                    r0: '50%',
                    r: '95%',
                    label: {
                        align: 'right',
                        fontSize: 12,
                        color: '#495057'
                    },
                    itemStyle: {
                        borderWidth: 2,
                        borderColor: '#fff',
                        opacity: 0.8
                    }
                }
            ]
        }
    };

    // تطبيق الإعدادات على المخطط
    myChart.setOption(option);

    // جعل المخطط متجاوباً مع تغيير حجم النافذة
    window.addEventListener('resize', function () {
        myChart.resize();
    });

    console.log("نجاح! تم رسم المخطط الدائري.");
});
