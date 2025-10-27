async function getDisdukData() {
    const response = await fetch("data/disduk.json");
    if (!response.ok) throw new Error("Gagal mengambil data Disdukcapil");
    return await response.json();
}
