var map = null;

export function initMap(lat, lng) {
    // キー操作を全部ディスエーブルしてみる
    map = L.map("map", { keyboard: false })
    
    map.setView([lat, lng], 13)

    L.tileLayer(
	"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	{ attribution: "© OpenStreetMap contributors" }
    ).addTo(map);

    return map;
}

export function distance(lat1, lng1, lat2, lng2) {
    const R = Math.PI / 180;
    lat1 *= R; // ラジアンに変換
    lng1 *= R;
    lat2 *= R;
    lng2 *= R;
    return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
}
