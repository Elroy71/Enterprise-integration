// js/app.js
document.addEventListener("DOMContentLoaded", () => {
    const output = document.getElementById("output");
    const detailsSection = document.getElementById("details");

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
        const service = card.id;
        output.innerHTML = `<div class="loading">⏳ Mengambil data dari <b>${service.toUpperCase()}</b>...</div>`;
        detailsSection.scrollIntoView({ behavior: "smooth" });

        try {
            const raw = await fetchFromGateway(service); // gunakan gateway yang sudah ada

            if (!raw) {
            output.innerHTML = `<div class="error">⚠️ Tidak ada respon dari service ${service}.</div>`;
            return;
            }
            if (raw.error) {
            output.innerHTML = `<div class="error">⚠️ ${raw.error}</div>`;
            return;
            }

            // Tentukan nama dinas (prioritas: properti nama_dinas pada object, jika tidak ada pakai mapping)
            const namaDinas = (raw.nama_dinas) ? raw.nama_dinas : mapServiceName(service);

            // Deteksi data array yang harus dirender
            let items = null;

            if (Array.isArray(raw)) {
            // service mengembalikan Array langsung (contoh yang kamu kirim)
            items = raw;
            } else if (Array.isArray(raw.data)) {
            // struktur { data: [...] }
            items = raw.data;
            } else {
            // cari properti pertama yang berbentuk array (mis. daftar_proyek, data_rumah_sakit, data_penduduk, dll)
            const arrKey = Object.keys(raw).find(k => Array.isArray(raw[k]));
            if (arrKey) {
                items = raw[arrKey];
            }
            }

            // Jika tidak menemukan array, coba lihat apakah raw sendiri adalah object sederhana -> tampilkan ringkasan
            if (!items) {
            // tampilkan object ringkasan (non-array)
            renderObjectSummary(raw, namaDinas, service);
            return;
            }

            // Jika ada array -> render sebagai grid kartu
            renderArrayItems(items, namaDinas, service);

        } catch (err) {
            console.error(err);
            output.innerHTML = `<div class="error">⚠️ Terjadi kesalahan: ${escapeHtml(String(err.message || err))}</div>`;
        }
        });
    });
});

/* ----------------- Helper render untuk array ----------------- */
function renderArrayItems(items, namaDinas, service) {
    const output = document.getElementById("output");
    const colorClass = serviceColorClass(service);

    if (!items || items.length === 0) {
        output.innerHTML = `<div class="error">⚠️ Tidak ada data untuk ${namaDinas}.</div>`;
        return;
    }

    // header + container
    let html = `<div class="data-container ${colorClass}">`;
    html += `<h2>${escapeHtml(namaDinas)}</h2>`;
    html += `<div class="data-grid">`;

    // buat kartu per item (tampilkan properti primitif)
    items.forEach(item => {
        html += `<div class="data-card">`;
        // Judul kartu: pilih nama paling relevan
        const title = item.nama || item.nama_jalan || item.nama_sekolah || item.nama_fasilitas || item.nama_penduduk || item.title || `ID: ${item.id || "-"}`;
        html += `<h3>${escapeHtml(String(title))}</h3>`;

        // tampilkan properti (kecuali nested array/object panjang)
        for (const key of Object.keys(item)) {
        const val = item[key];
        if (val === null || val === undefined) continue;
        if (typeof val === "object") {
            // ringkas nested object/array
            if (Array.isArray(val)) {
            html += `<p><strong>${escapeHtml(key)}:</strong> [array ${val.length}]</p>`;
            } else {
            html += `<p><strong>${escapeHtml(key)}:</strong> [object]</p>`;
            }
        } else {
            html += `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(val))}</p>`;
        }
        }

        // badge id (jika ada)
        if (item.id !== undefined) {
        html += `<span class="badge">${escapeHtml(String(item.id))}</span>`;
        }
        html += `</div>`; // end data-card
    });

    html += `</div></div>`; // end grid + container

    output.innerHTML = html;
}

/* ----------------- Helper render untuk object ringkasan ----------------- */
function renderObjectSummary(obj, namaDinas, service) {
    const output = document.getElementById("output");
    const colorClass = serviceColorClass(service);

    let html = `<div class="data-container ${colorClass}">`;
    html += `<h2>${escapeHtml(namaDinas)}</h2>`;
    html += `<div class="card-grid">`;

    // buat satu kartu ringkasan
    html += `<div class="data-card">`;
    html += `<h3>Ringkasan</h3>`;
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) {
        html += `<p><strong>${escapeHtml(key)}:</strong> array (${val.length})</p>`;
        } else if (typeof val === "object" && val !== null) {
        html += `<p><strong>${escapeHtml(key)}:</strong> object</p>`;
        } else {
        html += `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(val))}</p>`;
        }
    }
    html += `</div>`; // end data-card

    html += `</div></div>`; // end card-grid + container

    output.innerHTML = html;
}

/* ----------------- Utils / kecil-kecil ----------------- */
function serviceColorClass(service) {
    return {
        dpd: "blue",
        dpu: "green",
        dinkes: "yellow",
        disduk: "purple"
    }[service] || "default";
}

function mapServiceName(service) {
    return {
        dpd: "Dinas Pendapatan Daerah",
        dpu: "Dinas Pekerjaan Umum",
        dinkes: "Dinas Kesehatan",
        disduk: "Dinas Kependudukan"
    }[service] || service;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
