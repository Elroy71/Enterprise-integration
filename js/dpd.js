async function getDPDData() {
    const response = await fetch("data/dpd.json");
    if (!response.ok) throw new Error("Gagal mengambil data DPD");
    return await response.json();
}
