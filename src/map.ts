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
