async function getDinkesData() {
    const response = await fetch("data/dinkes.json");
    if (!response.ok) throw new Error("Gagal mengambil data Dinkes");
    return await response.json();
}
