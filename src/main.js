
//import "./style.css";

import { initMap } from "/src/map.js";

function getValidData(data){
    let datalist = []
    /*
    for(let i=0;i<data.pages.length;i++){
	let entry = {}
	entry.title = data.pages[i].title;
	entry.descriptions = data.pages[i].descriptions;
	entry.image = data.pages[i].image
	datalist.push(entry)
    }
    */
    data.map((e) => {
	let entry = {}
	entry.title = e.title;
	entry.descriptions = e.descriptions;
	entry.image = e.image
	datalist.push(entry)
    })
    console.log(datalist)
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

	getValidData(data)
	//console.log(data)

	console.log('after await')
	//console.log(data.pages[0]);
	//console.log(data.pages.length);
	//console.log(data)

	return data;
    }

    console.log("load...");
    return load();
}

//main();

