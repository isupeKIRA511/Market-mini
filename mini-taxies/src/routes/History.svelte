<script lang="ts">
    import { onMount } from 'svelte';
    import { getData } from '../lib/api';

    let trips: any[] = [];
    let selectedTrip: any = null;

    onMount(async () => {
        try {
            const data = await getData('/api/history');
            trips = data;
        } catch (error) {
            trips = [
                { id: 1, date: '2024-03-24', time: '10:30 ص', from: 'حي المنصور', to: 'مطار بغداد', price: '25,000 د.ع', status: 'مكتملة', driver: 'أحمد علي', car: 'تويوتا كامري 2023', distance: '15 كم', duration: '25 دقيقة' },
                { id: 2, date: '2024-03-20', time: '02:15 م', from: 'حي الجادرية', to: 'الكرادة', price: '10,000 د.ع', status: 'مكتملة', driver: 'محمد جاسم', car: 'هيونداي النترا 2022', distance: '8 كم', duration: '15 دقيقة' },
                { id: 3, date: '2024-03-15', time: '08:00 ص', from: 'شارع فلسطين', to: 'مطار بغداد', price: '28,000 د.ع', status: 'ملغاة', driver: 'خالد سعد', car: 'تويوتا كورولا 2021', distance: '22 كم', duration: '35 دقيقة' },
                { id: 4, date: '2024-03-10', time: '11:45 م', from: 'اليرموك', to: 'الحارثية', price: '12,000 د.ع', status: 'مكتملة', driver: 'زيد عمر', car: 'كيا سيراتو 2023', distance: '10 كم', duration: '20 دقيقة' },
                { id: 5, date: '2024-03-05', time: '07:30 ص', from: 'زيونة', to: 'الباب الشرقي', price: '8,000 د.ع', status: 'مكتملة', driver: 'ياسر حسين', car: 'تويوتا يارس 2022', distance: '6 كم', duration: '12 دقيقة' },
                { id: 6, date: '2024-03-01', time: '10:00 ص', from: 'السيدية', to: 'الأعظمية', price: '15,000 د.ع', status: 'مكتملة', driver: 'علي محمود', car: 'هيونداي سوناتا 2023', distance: '18 كم', duration: '30 دقيقة' },
            ];
        }
    });

    function openDetails(trip: any) {
        selectedTrip = trip;
    }

    function closeDetails() {
        selectedTrip = null;
    }
</script>

{#if selectedTrip}
    <div class="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity" on:click={closeDetails}>
        <div class="w-full max-w-[420px] bg-surface rounded-t-[32px] p-6 shadow-2xl animate-slide-up" on:click|stopPropagation>
            <div class="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6"></div>
            
            <div class="flex justify-between items-start mb-6 flex-row-reverse" dir="rtl">
                <h3 class="text-xl font-black text-on-surface">تفاصيل الرحلة</h3>
                <button on:click={closeDetails} class="p-2 bg-surface-container rounded-full leading-none">
                    <span class="material-symbols-outlined text-on-surface">close</span>
                </button>
            </div>

            <div class="space-y-6" dir="rtl">
                <div class="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl">
                    <div class="text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60 mb-0.5">الحالة</p>
                        <p class="text-sm font-black {selectedTrip.status === 'مكتملة' ? 'text-green-600' : 'text-red-600'}">{selectedTrip.status}</p>
                    </div>
                    <div class="text-left">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60 mb-0.5">التكلفة</p>
                        <p class="text-sm font-black text-primary">{selectedTrip.price}</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold text-on-surface-variant opacity-60">السائق</p>
                            <p class="text-sm font-black text-on-surface">{selectedTrip.driver}</p>
                            <p class="text-xs text-on-surface-variant">{selectedTrip.car}</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-primary">route</span>
                        </div>
                        <div class="text-right space-y-1">
                            <p class="text-[10px] font-bold text-on-surface-variant opacity-60">المسار</p>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full border-2 border-primary"></div>
                                <p class="text-sm font-bold text-on-surface">{selectedTrip.from}</p>
                            </div>
                            <div class="w-0.5 h-3 bg-outline-variant/30 mr-0.75"></div>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-primary rounded-sm"></div>
                                <p class="text-sm font-bold text-on-surface">{selectedTrip.to}</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-surface-container-lowest border border-outline-variant/10 p-3 rounded-xl flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary text-xl">straighten</span>
                            <div class="text-right">
                                <p class="text-[10px] font-bold text-on-surface-variant opacity-60">المسافة</p>
                                <p class="text-xs font-black">{selectedTrip.distance}</p>
                            </div>
                        </div>
                        <div class="bg-surface-container-lowest border border-outline-variant/10 p-3 rounded-xl flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary text-xl">schedule</span>
                            <div class="text-right">
                                <p class="text-[10px] font-bold text-on-surface-variant opacity-60">الوقت</p>
                                <p class="text-xs font-black">{selectedTrip.duration}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                  on:click={closeDetails}
                  class="w-full py-4 bg-primary text-on-primary font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                    إغلاق
                </button>
            </div>
        </div>
    </div>
{/if}

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center mb-2 px-1 w-full" dir="rtl">
        <h2 class="text-2xl font-black text-on-surface">سجل الرحلات</h2>
    </div>

    <div class="space-y-4">
        {#each trips as trip}
            <div 
              on:click={() => openDetails(trip)}
              class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-all cursor-pointer group active:scale-[0.98]">
                <div class="flex justify-between items-start mb-4" dir="rtl">
                    <div class="text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60 mb-1">{trip.date} • {trip.time}</p>
                        <h3 class="text-base font-black text-on-surface">مشوار إلى {trip.to}</h3>
                    </div>
                    <div class="px-3 py-1 rounded-full text-[10px] font-black {trip.status === 'مكتملة' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        {trip.status}
                    </div>
                </div>

                <div class="flex items-center gap-3 mb-4" dir="rtl">
                    <div class="flex flex-col items-center gap-1 shrink-0">
                        <div class="w-2.5 h-2.5 rounded-full border-2 border-primary"></div>
                        <div class="w-0.5 h-4 bg-outline-variant/30"></div>
                        <div class="w-2.5 h-2.5 bg-primary rounded-sm"></div>
                    </div>
                    <div class="flex flex-col gap-2 text-right">
                        <p class="text-[11px] font-medium text-on-surface-variant leading-none">{trip.from}</p>
                        <p class="text-[11px] font-medium text-on-surface-variant leading-none mt-2">{trip.to}</p>
                    </div>
                </div>

                <div class="pt-4 border-t border-outline-variant/5 flex justify-between items-center" dir="rtl">
                    <div class="text-primary font-black text-sm">{trip.price}</div>
                    <button class="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 hover:text-primary transition-colors">
                        عرض التفاصيل
                        <span class="material-symbols-outlined text-[14px]">chevron_left</span>
                    </button>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    @keyframes slide-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
    .animate-slide-up {
        animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
</style>