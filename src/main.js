//import "./style.css";
//import { initMap } from "./map";

async function main() {
    console.log("Mapfeel starting...");
    
    //const map = initMap();
    initMap();
    
    // ここに将来:
    // Scrapboxからフェッチする
    // const images = extractGyazo(...)
    // addImagesToMap(map, images)
    
    function getProject() {
	alert(location.pathname)
	return location.pathname.replace(/^\//, "");
    }
    
    async function load() {
	const project = getProject();
	
	if (!project) {
	    alert("URLにプロジェクト名を指定してください");
	    return;
	}
	project = "masuimap"
	
	const res = await fetch(`/api/scrapbox/${project}`);
	const data = await res.json();
	
	console.log(data);
	
	// 既存のマーカー処理につなげる
    }
    
    load();
}

main();

