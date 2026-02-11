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
	return location.pathname.replace(/^\//, "");
    }
    
    async function load() {
	var project = getProject();
	
	if (!project) {
	    alert("URLにプロジェクト名を指定してください");
	    // return;
	}
	project = "masuimap"

	console.log(project)
	const res = await fetch(`/api/scrapbox/${project}`);
	console.log(res)
	
	const data = await res.json();
	
	console.log(data);
	
	// 既存のマーカー処理につなげる
    }

    console.log("load...");
    load();
}

main();

