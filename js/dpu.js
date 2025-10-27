async function getDPUData() {
    const response = await fetch("data/dpu.json");
    if (!response.ok) throw new Error("Gagal mengambil data DPU");
    return await response.json();
}
