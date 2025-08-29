
const lane = ["EXP LANE", "MID LANE", "JUNGLE", "GOLD LANE", "ROAM"];

let HERO_LIST = [];
const SPELL_LIST = [
    { id: "e", name: "Execute", url: "https://static.wikia.nocookie.net/mobile-legends/images/b/b6/Execute.png", cd: 60 },
    { id: "r", name: "Retribution", url: "https://static.wikia.nocookie.net/mobile-legends/images/f/fb/Retribution.png", cd: 35 },
    { id: "i", name: "Inspire", url: "https://static.wikia.nocookie.net/mobile-legends/images/c/c4/Inspire.png", cd: 75 },
    { id: "s", name: "Sprint", url: "https://static.wikia.nocookie.net/mobile-legends/images/b/bb/Sprint.png", cd: 100 },
    { id: "rv", name: "Revitalize", url: "https://static.wikia.nocookie.net/mobile-legends/images/f/f9/Revitalize.png", cd: 100 },
    { id: "ae", name: "Aegis", url: "https://static.wikia.nocookie.net/mobile-legends/images/e/e5/Aegis.png", cd: 90 },
    { id: "pt", name: "Petrify", url: "https://static.wikia.nocookie.net/mobile-legends/images/6/6d/Petrify.png", cd: 90 },
    { id: "pu", name: "Purify", url: "https://static.wikia.nocookie.net/mobile-legends/images/2/22/Purify.png", cd: 90 },
    { id: "fs", name: "Flameshot", url: "https://static.wikia.nocookie.net/mobile-legends/images/f/f2/Flameshot.png", cd: 50 },
    { id: "fl", name: "Flicker", url: "https://static.wikia.nocookie.net/mobile-legends/images/1/1e/Flicker.png", cd: 120 },
    { id: "ar", name: "Arrival", url: "https://static.wikia.nocookie.net/mobile-legends/images/3/33/Arrival.png", cd: 75 },
    { id: "v", name: "Vengeance", url: "https://static.wikia.nocookie.net/mobile-legends/images/8/85/Vengeance.png", cd: 75 },
];

let heroes = [];
const heroSetupGrid = document.getElementById('heroSetupGrid');
const startTrackerBtn = document.getElementById('startTrackerBtn');
const heroGrid = document.getElementById('heroGrid');
const setupScreen = document.getElementById('setupScreen');
const trackerScreen = document.getElementById('trackerScreen');

// Variabel untuk mengontrol apakah spell cooldown harus berjalan
let clockRunning = false;

// helper
function formatTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Fungsi untuk membuat custom dropdown
function createCustomDropdown(container, spells, selectedSpellId, index) {
    const selectedSpell = spells.find(s => s.id === selectedSpellId) || { id: '', name: 'Pilih Spell', url: '' };

    const dropdownHTML = `
        <div class="custom-dropdown" id="customDropdown-${index}">
            <div class="dropdown-selected">
                ${selectedSpell.id ? `<img src="${selectedSpell.url}" alt="${selectedSpell.name}">` : ''}
                <span>${selectedSpell.name}${selectedSpell.cd ? ` (${selectedSpell.cd}s)` : ''}</span>
                <div class="dropdown-arrow">▼</div>
            </div>
            <div class="dropdown-options">
                <div class="dropdown-search-container">
                    <input type="text" class="dropdown-search" placeholder="Cari spell...">
                </div>
                ${spells.map(spell => `
                    <div class="dropdown-option" data-value="${spell.id}">
                        <img src="${spell.url}" alt="${spell.name}">
                        <span>${spell.name}<small>(${spell.cd}s)</small></span>
                    </div>
                `).join('')}
            </div>
        </div>
        <select id="spellSelect${index}" class="hidden-select spell-select">
            <option value="">Pilih Spell</option>
            ${spells.map(s => `<option value="${s.id}" ${selectedSpellId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
    `;

    container.innerHTML = dropdownHTML;

    // Setup event listeners untuk dropdown custom
    const dropdown = container.querySelector('.custom-dropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const options = dropdown.querySelector('.dropdown-options');
    const arrow = dropdown.querySelector('.dropdown-arrow');
    const hiddenSelect = container.querySelector('.hidden-select');
    const searchInput = dropdown.querySelector('.dropdown-search');
    const optionElements = dropdown.querySelectorAll('.dropdown-option');

    // Fungsi untuk filter opsi berdasarkan pencarian
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();

        optionElements.forEach(option => {
            const spellName = option.querySelector('span').textContent.toLowerCase();
            if (spellName.includes(searchTerm)) {
                option.style.display = 'flex';
            } else {
                option.style.display = 'none';
            }
        });
    });

    selected.addEventListener('click', () => {
        const isOpen = options.classList.contains('open');

        // Tutup semua dropdown lainnya
        document.querySelectorAll('.dropdown-options').forEach(opt => {
            if (opt !== options) opt.classList.remove('open');
        });
        document.querySelectorAll('.dropdown-arrow').forEach(arr => {
            if (arr !== arrow) arr.classList.remove('open');
        });

        // Buka/tutup dropdown ini
        options.classList.toggle('open');
        arrow.classList.toggle('open');

        // Fokus ke input pencarian saat dropdown dibuka
        if (options.classList.contains('open')) {
            setTimeout(() => searchInput.focus(), 10);
        }
    });

    dropdown.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const spell = spells.find(s => s.id === value);

            // Update tampilan dropdown
            selected.innerHTML = `
                <img src="${spell.url}" alt="${spell.name}">
                <span>${spell.name} (${spell.cd}s)</span>
                <div class="dropdown-arrow">▼</div>
            `;

            // Update select hidden
            hiddenSelect.value = value;

            // Tutup dropdown
            options.classList.remove('open');
            arrow.classList.remove('open');

            // Trigger change event untuk select hidden
            hiddenSelect.dispatchEvent(new Event('change'));
        });
    });

    // Tutup dropdown ketika klik di luar
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            options.classList.remove('open');
            arrow.classList.remove('open');
        }
    });
}

// Fungsi untuk membuat custom hero dropdown - IMPROVED
function createCustomHeroDropdown(container, heroes, selectedHeroName, index) {
    const selectedHero = heroes.find(h => h.name === selectedHeroName) || { name: 'Pilih Hero', image: '' };

    const dropdownHTML = `
        <div class="custom-hero-dropdown" id="customHeroDropdown-${index}">
            <div class="dropdown-selected">
                ${selectedHero.image ? `<img src="${selectedHero.image}" alt="${selectedHero.name}">` : ''}
                <span>${selectedHero.name}</span>
                <div class="dropdown-arrow">▼</div>
            </div>
            <div class="hero-dropdown-options">
                <div class="dropdown-search-container">
                    <input type="text" class="dropdown-search" placeholder="Cari hero...">
                </div>
                ${heroes.map(hero => `
                    <div class="hero-dropdown-option" data-value="${hero.name}">
                        <img src="${hero.image}" alt="${hero.name}">
                        <span>${hero.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <select id="heroSelect${index}" class="hidden-select hero-select">
            <option value="">Pilih Hero</option>
            ${heroes.map(h => `<option value="${h.name}" ${selectedHeroName === h.name ? 'selected' : ''}>${h.name}</option>`).join('')}
        </select>
    `;

    container.innerHTML = dropdownHTML;

    // Setup event listeners untuk dropdown custom
    const dropdown = container.querySelector('.custom-hero-dropdown');
    const selected = dropdown.querySelector('.dropdown-selected');
    const options = dropdown.querySelector('.hero-dropdown-options');
    const arrow = dropdown.querySelector('.dropdown-arrow');
    const hiddenSelect = container.querySelector('.hidden-select');
    const searchInput = dropdown.querySelector('.dropdown-search');
    const optionElements = dropdown.querySelectorAll('.hero-dropdown-option');

    // Fungsi untuk filter opsi berdasarkan pencarian
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();

        optionElements.forEach(option => {
            const heroName = option.querySelector('span').textContent.toLowerCase();
            if (heroName.includes(searchTerm)) {
                option.style.display = 'flex';
            } else {
                option.style.display = 'none';
            }
        });
    });

    selected.addEventListener('click', () => {
        const isOpen = options.classList.contains('open');

        // Tutup semua dropdown lainnya
        document.querySelectorAll('.hero-dropdown-options').forEach(opt => {
            if (opt !== options) opt.classList.remove('open');
        });
        document.querySelectorAll('.dropdown-arrow').forEach(arr => {
            if (arr !== arrow) arr.classList.remove('open');
        });

        // Buka/tutup dropdown ini
        options.classList.toggle('open');
        arrow.classList.toggle('open');

        // Fokus ke input pencarian saat dropdown dibuka
        if (options.classList.contains('open')) {
            setTimeout(() => searchInput.focus(), 10);
        }
    });

    dropdown.querySelectorAll('.hero-dropdown-option').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const hero = heroes.find(h => h.name === value);

            // Update tampilan dropdown
            selected.innerHTML = `
                <img src="${hero.image}" alt="${hero.name}">
                <span>${hero.name}</span>
                <div class="dropdown-arrow">▼</div>
            `;

            // Update select hidden
            hiddenSelect.value = value;

            // Tutup dropdown
            options.classList.remove('open');
            arrow.classList.remove('open');

            // Trigger change event untuk select hidden
            hiddenSelect.dispatchEvent(new Event('change'));
        });
    });

    // Tutup dropdown ketika klik di luar
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            options.classList.remove('open');
            arrow.classList.remove('open');
        }
    });
}

// RENDER SETUP SCREEN
function renderSetupScreen() {
    heroSetupGrid.innerHTML = '';
    if (!HERO_LIST || HERO_LIST.length === 0) {
        const p = document.createElement('div');
        p.textContent = 'Tidak ada data hero. Pastikan list-hero-with-images.json berada di folder yang sama.';
        heroSetupGrid.appendChild(p);
        return;
    }

    const img_lane = ["exp", "mid", "jungle", "gold", "roam"];

    for (let i = 0; i < 5; i++) {
        const heroCard = document.createElement('div');
        heroCard.className = 'hero-setup-card';

        // default image (placeholder)
        const imgSrc = "/img/" + img_lane[i] + ".jpg";

        heroCard.innerHTML = `
            <h4><img style="width: 30px" src="/img/${img_lane[i]}.jpg">${lane[i]}</h4>
            <div class="hero-avatar"><img src="${imgSrc}" alt="avatar"></div>
            <div class="hero-name">Pilih Hero</div>

            <div class="select-group">
                <label for="heroSelect${i}">Hero:</label>
                <div id="heroContainer${i}"></div>
            </div>

            <div class="select-group">
                <label for="spellSelect${i}">Battle Spell:</label>
                <div id="spellContainer${i}"></div>
            </div>
            <div class="pyt-emblem-group">
                <input type="checkbox" id="pytEmblem${i}">
                <label for="pytEmblem${i}">PYT Emblem?</label>
                <span class="info-icon" onclick="alert('Jika dicentang, cooldown Battle Spell akan berkurang 20% karena efek Emblem Support (Pull Yourself Together).')">!</span>
            </div>
        `;

        const heroContainer = heroCard.querySelector(`#heroContainer${i}`);
        const spellContainer = heroCard.querySelector(`#spellContainer${i}`);
        const avatarImg = heroCard.querySelector('.hero-avatar img');
        const nameDisplay = heroCard.querySelector('.hero-name');

        // Buat custom dropdown untuk hero
        createCustomHeroDropdown(heroContainer, HERO_LIST, '', i);
        // Buat custom dropdown untuk spell
        createCustomDropdown(spellContainer, SPELL_LIST, '', i);

        // Dapatkan select element untuk hero
        const heroSelect = heroCard.querySelector(`#heroSelect${i}`);

        heroSelect.addEventListener('change', function () {
            const name = this.value;
            if (!name) {
                avatarImg.src = imgSrc;
                nameDisplay.textContent = 'Pilih Hero';
                return;
            }
            const hero = HERO_LIST.find(h => h.name.toLowerCase() === name.toLowerCase());
            if (hero) {
                avatarImg.src = hero.image || imgSrc;
                nameDisplay.textContent = hero.name;
            } else {
                avatarImg.src = imgSrc;
                nameDisplay.textContent = 'Pilih Hero';
            }
        });

        heroSetupGrid.appendChild(heroCard);
    }
}

// START TRACKER
startTrackerBtn.addEventListener('click', () => {
    const heroSelects = document.querySelectorAll('.hero-select');
    const spellSelects = document.querySelectorAll('.spell-select');
    const pytEmblemCheckboxes = document.querySelectorAll('[id^="pytEmblem"]');

    heroes = [];
    let allSelected = true;

    for (let i = 0; i < 5; i++) {
        const heroName = heroSelects[i].value;
        const spellId = spellSelects[i].value;
        const hasPytEmblem = pytEmblemCheckboxes[i].checked;

        if (!heroName || !spellId) {
            allSelected = false;
            break;
        }

        const heroData = HERO_LIST.find(h => h.name.toLowerCase() === heroName.toLowerCase());
        let spell = SPELL_LIST.find(s => s.id === spellId);

        if (!heroData || !spell) {
            allSelected = false;
            break;
        }

        // Apply PYT Emblem effect
        let finalCd = spell.cd;
        if (hasPytEmblem) {
            finalCd = Math.round(spell.cd * 0.80); // 20% reduction
        }

        heroes.push({
            id: heroData.name,
            name: heroData.name,
            image: heroData.image,
            fandom_url: heroData.fandom_url,
            spells: [
                {
                    code: spell.id,
                    name: spell.name,
                    cd: finalCd, // Use modified CD
                    originalCd: spell.cd, // Store original CD for reference
                    remaining: 0,
                    running: false,
                    activeAt: 0,
                    hasPytEmblem: hasPytEmblem // Store emblem status
                }
            ]
        });
    }

    if (!allSelected) {
        alert('Harap pilih hero dan battle spell untuk semua 5 slot!');
        return;
    }

    setupScreen.style.display = 'none';
    trackerScreen.style.display = 'block';
    renderTracker();
});

// RENDER TRACKER
function renderTracker() {
    heroGrid.innerHTML = '';
    let counter = 0;
    heroes.forEach((hero, hIdx) => {
        const card = document.createElement('div');
        card.className = 'card';

        const role = document.createElement('h4');
        role.className = 'hero-name';
        role.textContent = lane[counter++];

        const avatar = document.createElement('div');
        avatar.className = 'hero-avatar';
        const img = document.createElement('img');
        img.src = hero.image || '';
        img.alt = hero.name;
        avatar.appendChild(img);

        const name = document.createElement('div');
        name.className = 'hero-name';
        name.textContent = hero.name;

        card.appendChild(role);
        card.appendChild(avatar);
        card.appendChild(name);

        const spellsWrap = document.createElement('div');
        spellsWrap.className = 'spells';

        hero.spells.forEach((spell, sIdx) => {
            const spellEl = document.createElement('div');
            const spellImage = SPELL_LIST.find(s => s.id === spell.code)?.url || '';

            spellEl.className = 'spell ready'; // Default state: ready
            spellEl.id = `spell-${hIdx}-${sIdx}`;
            spellEl.innerHTML = `
                <img src="${spellImage}" style="width: 70px">
                <div class="label">${spell.name}</div>
                <div class="small">CD: ${spell.cd}s ${spell.hasPytEmblem ? '(PYT)' : ''}</div>
                <div class="active-time" id="active-time-${hIdx}-${sIdx}"></div>
                <div class="remaining" id="rem-${hIdx}-${sIdx}"></div>
                <div class="progress"><div class="bar" id="bar-${hIdx}-${sIdx}"></div></div>
            `;
            spellEl.addEventListener('click', () => {
                if (!clockRunning) {
                    alert('Mulai/lanjutkan dulu game clocknya!');
                    return;
                }
                startSpellCooldown(hIdx, sIdx, spell.cd);
            });
            spellEl.addEventListener('contextmenu', (e) => { e.preventDefault(); changeSpell(hIdx, sIdx); });
            spellsWrap.appendChild(spellEl);
            updateSlotUI(hIdx, sIdx);
        });

        card.appendChild(spellsWrap);

        const controls = document.createElement('div');
        controls.className = 'sp-controls';
        controls.innerHTML = `
            <button class="btn mini" id="pause-${hIdx}">Pause</button>
            <button class="btn mini" id="resume-${hIdx}">Resume</button>
            <button class="btn mini" id="reset-${hIdx}">Reset</button>
        `;
        controls.querySelector(`#pause-${hIdx}`).addEventListener('click', () => {
            hero.spells.forEach(s => s.running = false);
            updateAllSpellUI();
        });
        controls.querySelector(`#resume-${hIdx}`).addEventListener('click', () => {
            if (clockRunning) {
                hero.spells.forEach(s => { if (s.remaining > 0) s.running = true; });
                updateAllSpellUI();
            }
        });
        controls.querySelector(`#reset-${hIdx}`).addEventListener('click', () => {
            hero.spells.forEach((s, si) => {
                s.remaining = 0;
                s.running = false;
                s.activeAt = 0;
                updateSlotUI(hIdx, si);
            });
        });

        card.appendChild(controls);
        heroGrid.appendChild(card);
    });
}

function updateAllSpellUI() {
    heroes.forEach((hero, hIdx) => {
        hero.spells.forEach((spell, sIdx) => {
            updateSlotUI(hIdx, sIdx);
        });
    });
}

function changeSpell(hIdx, sIdx) {
    const currentSpell = heroes[hIdx].spells[sIdx];
    const newSpellId = prompt(
        'Masukkan kode spell (e.g., fl for Flicker, pu for Purify):\n' +
        SPELL_LIST.map(s => `${s.id}: ${s.name} (${s.cd}s)`).join('\n'),
        currentSpell.code
    );
    if (!newSpellId) return;
    const spellData = SPELL_LIST.find(s => s.id === newSpellId);
    if (!spellData) { alert('Kode spell tidak valid!'); return; }

    // Prompt for PYT Emblem status for the new spell
    const hasPytEmblem = confirm('Apakah spell ini menggunakan PYT Emblem? (OK untuk Ya, Cancel untuk Tidak)');

    let finalCd = spellData.cd;
    if (hasPytEmblem) {
        finalCd = Math.round(spellData.cd * 0.80); // 20% reduction
    }

    heroes[hIdx].spells[sIdx] = {
        code: spellData.id,
        name: spellData.name,
        cd: finalCd,
        originalCd: spellData.cd,
        remaining: 0,
        running: false,
        activeAt: 0,
        hasPytEmblem: hasPytEmblem
    };
    renderTracker(); // Re-render the tracker to update the spell display
}

function startSpellCooldown(hIdx, sIdx, seconds) {
    const slot = heroes[hIdx].spells[sIdx];
    slot.remaining = Math.max(0, Math.round(seconds));
    slot.running = true;
    slot.activeAt = gameClockSec + seconds; // Simpan waktu aktif

    // Update UI
    updateSlotUI(hIdx, sIdx);
}

function updateSlotUI(hIdx, sIdx) {
    const slot = heroes[hIdx].spells[sIdx];
    const remEl = document.getElementById(`rem-${hIdx}-${sIdx}`);
    const barEl = document.getElementById(`bar-${hIdx}-${sIdx}`);
    const activeTimeEl = document.getElementById(`active-time-${hIdx}-${sIdx}`);
    const spellEl = document.getElementById(`spell-${hIdx}-${sIdx}`);

    if (!remEl || !barEl || !activeTimeEl || !spellEl) return;

    if (slot.remaining <= 0) {
        remEl.textContent = 'Ready';
        remEl.className = 'remaining ready';
        barEl.style.width = '0%';
        activeTimeEl.textContent = '';
        spellEl.classList.remove('cooldown');
        spellEl.classList.add('ready');
    } else {
        remEl.textContent = formatTime(slot.remaining);
        remEl.className = 'remaining cooling';
        const pct = Math.min(100, (1 - slot.remaining / slot.cd) * 100);
        barEl.style.width = pct + '%';

        // Tampilkan waktu aktif
        if (slot.activeAt > 0) {
            activeTimeEl.textContent = `Aktif: ${formatTime(slot.activeAt)}`;
        }

        spellEl.classList.remove('ready');
        spellEl.classList.add('cooldown');
    }
}

// master tick
setInterval(() => {
    if (!clockRunning) return; // Hanya kurangi cooldown jika game clock berjalan

    heroes.forEach((hero, hIdx) => {
        hero.spells.forEach((slot, sIdx) => {
            if (slot.running && slot.remaining > 0) {
                slot.remaining -= 1;
                if (slot.remaining <= 0) {
                    slot.remaining = 0;
                    slot.running = false;
                    slot.activeAt = 0;
                }
                updateSlotUI(hIdx, sIdx);
            }
        });
    });
}, 1000);

// game clock
let gameClockSec = 0, clockTimer = null;
const gameClockEl = document.getElementById('gameClock');
const minInput = document.getElementById('minInput');
const secInput = document.getElementById('secInput');
const setTimeBtn = document.getElementById('setTimeBtn');
const clockStartBtn = document.getElementById('clockStart');
const clockStopBtn = document.getElementById('clockStop');
const clockResetBtn = document.getElementById('clockReset');

// Fungsi untuk mengatur waktu game clock
setTimeBtn.addEventListener('click', () => {
    const minutes = parseInt(minInput.value) || 0;
    const seconds = parseInt(secInput.value) || 0;

    if (minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        alert('Masukkan menit (0-59) dan detik (0-59) yang valid!');
        return;
    }

    gameClockSec = minutes * 60 + seconds;
    gameClockEl.textContent = formatTime(gameClockSec);
});

// Fungsi untuk update tampilan status game clock
function updateClockStatusUI() {
    if (clockRunning) {
        clockStartBtn.classList.add('clock-running');
        clockStopBtn.classList.remove('clock-stopped');
    } else {
        clockStartBtn.classList.remove('clock-running');
        clockStopBtn.classList.add('clock-stopped');
    }
}

clockStartBtn.addEventListener('click', () => {
    if (clockRunning) return;
    clockRunning = true;
    clockTimer = setInterval(() => {
        gameClockSec++;
        gameClockEl.textContent = formatTime(gameClockSec);
    }, 1000);
    updateClockStatusUI();
});

clockStopBtn.addEventListener('click', () => {
    clockRunning = false;
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = null;
    updateClockStatusUI();
});

clockResetBtn.addEventListener('click', () => {
    gameClockSec = 0;
    gameClockEl.textContent = formatTime(gameClockSec);
    clockRunning = false;
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = null;
    updateClockStatusUI();

    // Reset input waktu
    minInput.value = '0';
    secInput.value = '0';

    // Reset semua spell ketika game clock direset
    heroes.forEach(h => {
        h.spells.forEach(s => {
            s.remaining = 0;
            s.running = false;
            s.activeAt = 0;
        });
    });
    updateAllSpellUI();
});

document.getElementById('resetAll').addEventListener('click', () => {
    heroes.forEach(h => {
        h.spells.forEach(s => {
            s.remaining = 0;
            s.running = false;
            s.activeAt = 0;
        });
    });
    updateAllSpellUI();
});

/* --- Load hero list from JSON (file provided oleh user) --- */
function loadHeroListThenRender() {
    fetch('list-hero-with-images.json')
        .then(r => {
            if (!r.ok) throw new Error('Failed to load JSON');
            return r.json();
        })
        .then(data => {
            HERO_LIST = data.map((h, idx) => ({
                id: idx + 1,
                name: h.name,
                image: h.image,
                fandom_url: h.fandom_url
            }));
            renderSetupScreen();
        })
        .catch(err => {
            console.warn('Gagal load list-hero-with-images.json:', err);
            HERO_LIST = [
                { id: 1, name: 'Layla', image: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_6efe9abc2047f59d45fa1c88fb1261b7.png', fandom_url: '' },
                { id: 2, name: 'Alucard', image: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_2a0606e575ae278db77134b50ccef7ac.png', fandom_url: '' },
                { id: 3, name: 'Tigreal', image: 'https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_4e0005dbfb1376beaccc54ef7aa39375.png', fandom_url: '' }
            ];
            renderSetupScreen();
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadHeroListThenRender();
    updateClockStatusUI(); // Inisialisasi tampilan status clock
});
