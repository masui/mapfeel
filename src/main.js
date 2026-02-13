import { initMap } from "/src/map.js";
import { getData } from "/src/data.js";

export async function main(project) {
    console.log("Mapfeel starting...");
    
    //const map = initMap();
    initMap();
    
    async function load(project) {
	// var project = location.pathname.replace(/^\//, "");

	// ScrapboxからMapfeel用データを取得
	const validdata = await getData(project)

	//console.log(validdata);

	return validdata;
    }
    
    return load(project);
}


