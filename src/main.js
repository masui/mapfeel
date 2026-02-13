import { initMap } from "/src/map.js";
import { getData } from "/src/data.js";

export async function main() {
    console.log("Mapfeel starting...");
    
    //const map = initMap();
    initMap();
    
    async function load() {
	var project = location.pathname.replace(/^\//, "");
	
	if (!project) {
	    alert("URLにプロジェクト名を指定してください");
	    return;
	}

	// ScrapboxからMapfeel用データを取得
	const validdata = await getData(project)

	console.log(validdata);

	return validdata;
    }

    console.log("load...");
    return load();
}


