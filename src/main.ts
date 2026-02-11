import "./style.css";
import { initMap } from "./map";

async function main() {
  console.log("Mapfeel starting...");

  //const map = initMap();
  initMap();

  // ここに将来:
  // Scrapboxからフェッチする
  // const images = extractGyazo(...)
  // addImagesToMap(map, images)
}

main();

