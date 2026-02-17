var map = null;

export function initMap(lat, lng) {
    //map = L.map("map").setView([35.319, 139.550], 13);
    map = L.map("map"){
	keyboard: false
    }.setView([lat, lng], 13)

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

/*
import L from "leaflet";

export function initMap() {
  const map = L.map("map").setView([35.681, 139.767], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  return map;
}

export function addImageMarker(
  map: L.Map,
  lat: number,
  lng: number,
  imageUrl: string,
  title: string
) {
  const marker = L.marker([lat, lng]).addTo(map);

  marker.bindPopup(`
    <div>
      <h3>${title}</h3>
      <img src="${imageUrl}" style="width:200px;">
    </div>
  `);

  return marker;
}
*/
