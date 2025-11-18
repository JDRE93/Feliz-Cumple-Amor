/*
  Este es tu archivo de JavaScript.
  Versión Final: Clasificación automática en dos secciones (Fechas vs On-Demand).
*/

// ======================================================
// --- 1. TU BASE DE DATOS DE CUPONES ---
// ======================================================
const couponsToUnlock = [
    {
        id: 'cumple-01',
        unlockDate: '2026-01-03T00:00:00',
        title: '¡Vale de Cumpleaños Oficial!',
        description: 'Vale por (1) día de ser la Reina Absoluta. Cero quehaceres, tu comida favorita y control total del TV.',
        imageUrl: './img/cupon.png', 
        category: 'Día Especial' 
    },
    {
        id: 'viaje-mama',
        unlockDate: '2026-02-15T00:00:00', 
        title: '¡Viaje a Cartagena con tu Mamá!',
        description: 'Un regalo para que creen recuerdos juntas. ¡Vuelo y estadía para dos! Prepárense.',
        imageUrl: './img/cartagena.png', 
        category: 'Familiar'
    },
    {
        id: 'coupon-4',
        unlockDate: '2026-02-14T00:00:00',
        title: 'Cupón de San Valentín (Medellín)',
        description: '¡Nuestra escapada a Medellín! Prepara un bolso pequeño. Tienes un mes para emocionarte.',
        imageUrl: './img/Medellin.jpg',
        category: 'Romántico'
    },
    // --- CUPONES SIN FECHA (ON-DEMAND) ---
    {
        id: 'demand-01', 
        // Sin unlockDate -> Se irá a la sección de abajo
        title: 'Vale por (1) Masaje Express',
        description: 'Canjeable en CUALQUIER momento. Válido por 15 minutos de masaje en hombros y cuello.',
        imageUrl: './img/Masage.jpg',
        category: 'Relajación'
    },
    {
        id: 'demand-02', 
        title: 'Vale por (1) "Ganas tú"',
        description: 'Para usar sabiamente en nuestra próxima discusión (no muy seria). Ganas tú.',
        imageUrl: './img/cupon.png',
        category: 'Romántico'
    },
    {
        id: 'demand-03', 
        title: 'Vale por (1) Noche de Pelis',
        description: 'Tú eliges la película (¡sin quejarme!), yo hago las palomitas y preparo el nido.',
        imageUrl: 'https://placehold.co/600x400/a7f3d0/047857?text=Noche+de+Pelis', // Ejemplo placeholder
        category: 'Familiar'
    }
];

// ======================================================
// --- ESTILOS DE CATEGORÍA ---
// ======================================================
const categoryStyles = {
    'Romántico': 'bg-pink-100 text-pink-800',
    'Familiar': 'bg-green-100 text-green-800',
    'Relajación': 'bg-blue-100 text-blue-800',
    'Sexy': 'bg-red-100 text-red-800',
    'Día Especial': 'bg-yellow-100 text-yellow-800',
    'Default': 'bg-gray-100 text-gray-800' 
};

// ======================================================
// --- HELPERS DE LOCALSTORAGE ---
// ======================================================
function getRedeemedCoupons() {
    const redeemed = localStorage.getItem('redeemedCoupons');
    return redeemed ? JSON.parse(redeemed) : [];
}
function saveRedeemedCoupon(couponId) {
    let redeemed = getRedeemedCoupons();
    if (!redeemed.includes(couponId)) {
        redeemed.push(couponId);
        localStorage.setItem('redeemedCoupons', JSON.stringify(redeemed));
    }
}

// ======================================================
// --- FUNCIONES PARA CREAR HTML ---
// ======================================================

function createUnlockedCardHTML(coupon) {
    let dateText = '';
    if (coupon.unlockDate) {
        const unlockDate = new Date(coupon.unlockDate);
        dateText = `Revelado: ${unlockDate.toLocaleString('es-ES', { day: 'numeric', month: 'long' })}`;
    } else {
        dateText = '<span class="text-green-600 font-bold">¡Canjeable cuando quieras!</span>';
    }
    let categoryHTML = '';
    if (coupon.category) {
        const styleClasses = categoryStyles[coupon.category] || categoryStyles['Default'];
        categoryHTML = `<span class="${styleClasses} inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase mb-3">${coupon.category}</span>`;
    }

    return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border-t-8 border-brand-gold transform transition-all hover:scale-105 relative">
            <img 
                src="${coupon.imageUrl}" 
                alt="${coupon.title}" 
                class="w-full object-cover" 
                onerror="this.src='https://placehold.co/600x400/fecaca/b91c1c?text=Error+al+cargar+la+foto'"
            >
            <div class="p-6">
                ${categoryHTML}
                <h3 class="font-script text-3xl text-brand-wine mb-3">${coupon.title}</h3>
                <p class="text-gray-700 mb-4">${coupon.description}</p>
                <p class="text-sm font-bold text-gray-500">${dateText}</p>
                <button class="w-full mt-4 bg-brand-wine text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-80 transition-colors" onclick="redeemCoupon('${coupon.id}')">
                    ¡Lo quiero ahora!
                </button>
            </div>
            <div class="redeem-overlay-container"></div> 
        </div>`;
}

function createLockedCardHTML(coupon) {
    const unlockDate = new Date(coupon.unlockDate);
    let categoryHTML = '';
    if (coupon.category) {
        const styleClasses = categoryStyles[coupon.category] || categoryStyles['Default'];
        categoryHTML = `<span class="${styleClasses} opacity-70 inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase mb-3 z-10 relative">${coupon.category}</span>`;
    }

    return `
        <div class="coupon-locked rounded-lg p-6 flex flex-col items-center justify-center relative min-h-[16rem]">
            <img src="${coupon.imageUrl}" alt="Bloqueado" class="coupon-locked-image" onerror="this.style.display='none'">
            <div class="lock-icon">🔒</div>
            <h3 class="font-script text-2xl text-gray-800 mt-4 z-10 relative drop-shadow-md">Cupón Bloqueado</h3>
            <p class="text-gray-600 font-semibold mb-3 z-10 relative drop-shadow-md">Se desbloquea el ${unlockDate.toLocaleString('es-ES', { day: 'numeric', month: 'long' })}</p>
            ${categoryHTML}
        </div>`;
}

// ======================================================
// --- FUNCIÓN DEL CONTADOR ---
// ======================================================
let countdownInterval = null; 
function startCountdown(targetDate) {
    const countdownSection = document.getElementById('countdown-section');
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    countdownSection.classList.remove('hidden');
    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownSection.innerHTML = `<h2 class="font-script text-5xl text-brand-wine">¡Tu regalo está listo!</h2>`;
            setTimeout(() => window.location.reload(), 4000); 
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    updateTimer(); 
    countdownInterval = setInterval(updateTimer, 1000); 
}


// ======================================================
// --- LÓGICA PRINCIPAL ---
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- PRUEBA DE FECHAS (Para ti como desarrollador) ---
    // const today = new Date('2025-11-30T10:00:00'); // FASE 1
    const today = new Date('2025-12-04T10:00:00'); // FASE 2
    // const today = new Date('2026-01-03T10:00:00'); // FASE 3
    
    // const today = new Date(); // <-- ¡USA ESTA PARA LA VERSIÓN FINAL!
    
    
    // --- FECHAS CLAVE ---
    const preBirthdayRevealDate = new Date('2025-12-03T00:00:00'); 
    const birthdayDate = new Date('2026-01-03T00:00:00'); 
    
    const countdownSection = document.getElementById('countdown-section');
    const teaserSection = document.getElementById('teaser-section');
    const couponsSection = document.getElementById('coupons-section');
    
    // --- ¡NUEVO! Capturamos los dos contenedores por separado ---
    const dateContainer = document.getElementById('date-coupons-container');
    const demandContainer = document.getElementById('demand-coupons-container');


    if (today < preBirthdayRevealDate) {
        // --- FASE 1 ---
        startCountdown(birthdayDate);

    } else if (today >= preBirthdayRevealDate && today < birthdayDate) {
        // --- FASE 2 ---
        startCountdown(birthdayDate); 
        teaserSection.classList.remove('hidden'); 

        const teaserCard = document.getElementById('teaser-card');
        if (teaserCard) {
            const ID_DEL_CUPON_A_MOSTRAR = 'viaje-mama'; 
            const couponToTease = couponsToUnlock.find(c => c.id === ID_DEL_CUPON_A_MOSTRAR);
            if (couponToTease) {
                teaserCard.addEventListener('click', () => {
                    const unlockDate = new Date(couponToTease.unlockDate);
                    teaserCard.classList.remove('coupon-locked');
                    teaserCard.style.padding = '0';
                    teaserCard.style.cursor = 'default';
                    teaserCard.style.minHeight = '0'; 

                    teaserCard.innerHTML = `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden w-full">
                            <img 
                                src="${couponToTease.imageUrl}" 
                                class="w-full object-contain rounded-t-lg max-h-96" 
                                onerror="this.src='https://placehold.co/600x400/fecaca/b91c1c?text=Error+en+foto'"
                            >
                            <div class="p-6 text-center">
                                <h3 class="font-script text-3xl text-brand-wine mb-2">¡Adelanto Exclusivo!</h3>
                                <p class="text-gray-700 font-semibold mb-2">${couponToTease.title}</p>
                                <p class="text-gray-500 text-sm">Prepárense... este cupón les estará esperando el</p>
                                <p class="text-gray-800 font-bold text-lg">${unlockDate.toLocaleString('es-ES', { day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                    `;
                }, { once: true });
            }
        }

    } else {
        // --- FASE 3 ---
        countdownSection.classList.add('hidden');
        teaserSection.classList.add('hidden');
        couponsSection.classList.remove('hidden'); 
        
        const redeemedIds = getRedeemedCoupons(); 
        
        couponsToUnlock.forEach(coupon => {
            let cardHTML = '';
            let slotClass = ''; 
            let targetContainer = null; // Variable para saber dónde ponerlo

            // 1. GENERAR HTML
            if (redeemedIds.includes(coupon.id)) {
                cardHTML = createUnlockedCardHTML(coupon); 
                cardHTML = cardHTML.replace(
                    '<div class="redeem-overlay-container"></div>', 
                    '<div class="redeem-overlay-container"><div class="redeem-overlay">CANJEADO</div></div>'
                );
                slotClass = 'coupon-redeemed'; 
            } else if (coupon.unlockDate) {
                const unlockDate = new Date(coupon.unlockDate); 
                if (today >= unlockDate) {
                    cardHTML = createUnlockedCardHTML(coupon); 
                } else {
                    cardHTML = createLockedCardHTML(coupon); 
                }
            } else {
                cardHTML = createUnlockedCardHTML(coupon);
            }
            
            // 2. CLASIFICAR EL CUPÓN
            if (coupon.unlockDate) {
                // Si tiene fecha -> va al contenedor de fechas
                targetContainer = dateContainer;
            } else {
                // Si no tiene fecha -> va al contenedor on-demand
                targetContainer = demandContainer;
            }

            // 3. INSERTAR EN EL DOM
            if (targetContainer) {
                targetContainer.innerHTML += `<div id="coupon-slot-${coupon.id}" class="${slotClass}">${cardHTML}</div>`;
            }
        });
    }
});

// ======================================================
// --- 4. FUNCIÓN DE CANJEAR ---
// ======================================================
function redeemCoupon(couponId) {
    const cardSlot = document.getElementById(`coupon-slot-${couponId}`);
    if (cardSlot && cardSlot.classList.contains('coupon-redeemed')) {
        alert('Este cupón ya fue canjeado. 😉');
        return; 
    }
    if (!confirm("¿Segura que quieres canjear este cupón ahora?")) return;
    cardSlot.classList.add('coupon-redeemed');
    const coupon = couponsToUnlock.find(c => c.id === couponId);
    if (!coupon) return;
    const overlayContainer = cardSlot.querySelector('.redeem-overlay-container');
    if (overlayContainer) {
        overlayContainer.innerHTML = '<div class="redeem-overlay">CANJEADO</div>';
    }
    saveRedeemedCoupon(couponId); 
    
    const tuEmail = 'TU-EMAIL-AQUI@gmail.com'; // <-- ¡CAMBIA ESTO POR TU EMAIL!
    
    const subject = `¡Cupón Canjeado: ${coupon.title}!`;
    const body = `¡Hola mi amor!\n\nSolo para que sepas que acabo de canjear este cupón:\n\n"${coupon.title}"\n\n¡Prepárate!\n\nTe amo.`;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.open(`mailto:${tuEmail}?subject=${encodedSubject}&body=${encodedBody}`, '_blank');
}