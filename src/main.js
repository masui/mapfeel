
//import "./style.css";

import { initMap } from "/src/map.js";

function getValidData(data){
    let datalist = []
    console.log(data[0])
}

export async function main() {
    console.log("Mapfeel starting...");
    
    //const map = initMap();
    initMap();
    
    // ここに将来:
    // Scrapboxからフェッチする
    // const images = extractGyazo(...)
    // addImagesToMap(map, images)
    
    function getProject() {
	alert(location.pathname);
	return location.pathname.replace(/^\//, "");
    }
    
    async function load() {
	var project = getProject();
	
	if (!project) {
	    alert("URLにプロジェクト名を指定してください");
	    // return;
	}
	// project = "masuimap"

	console.log(project)

	const res = await fetch(`/api/scrapbox/${project}`);
	const data = await res.json();

	//getValidData(data)

	console.log('after await')
	//console.log(data.pages[0]);
	console.log(data);

	return data;
    }

    console.log("load...");
    return load();
}

//main();

