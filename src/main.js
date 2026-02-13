
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
    // Mapfeelに関係するページだけ使う
    data.pages.map((page) => {
	let entry = {}
	entry.title = page.title;
	entry.description = ""
	page.descriptions.map((description) => {
	    let match = description.match(/\[([NS])([\d\.]+),([EW])([\d\.]+),Z([\d\.]+)(\s+\S+)?\]/) // 地図が登録されている場合
	    if(match){
		let pos = {}
		pos.latitude = Number(match[2])
		if (match[1] == 'S') pos.latitude = -pos.latitude
		pos.longitude = Number(match[4])
		if (match[3] == 'W') pos.longitude = -pos.longitude
		pos.zoom = 12
		if (match[6]) pos.zoom = Number(match[6])
		entry.pos = pos
	    }
	    else {
		// 画像の行などは飛ばす
		if(description.match(/gyazo.com/i)){
		}
		else {
		    entry.description += description
		}
	    }
	});
	entry.image = page.image
	if(entry.pos){
	    datalist.push(entry)
	}
    })
    console.log(datalist.length)
    console.log(data.length)
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

