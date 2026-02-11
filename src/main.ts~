import "./style.css";
import { initMap } from "./map";

async function main() {
  console.log("Mapfeel starting...");

  //const map = initMap();
  initMap();

  // ここに将来:
  const aboutRes = await fetch(`https://scrapbox.io/api/projects/masuimap/`);
  console.log(aboutRes);
  const aboutJson = await aboutRes.json();
  console.log(aboutJson)

  // const images = extractGyazo(...)
  // addImagesToMap(map, images)
}

main();

