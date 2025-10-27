// js/gateway.js
async function fetchFromGateway(service) {
    try {
        switch (service) {
        case "dpd":
            return await getDPDData();
        case "dpu":
            return await getDPUData();
        case "dinkes":
            return await getDinkesData();
        case "disduk":
            return await getDisdukData();
        default:
            throw new Error("Service tidak dikenali: " + service);
        }
    } catch (e) {
        console.error(e);
        return { error: e.message };
    }
}
