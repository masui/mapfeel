import { initMap } from "/src/map.js";
import { getData } from "/src/data.js";

export async function main() {
    console.log("Mapfeel starting...");
    
    //const map = initMap();
    initMap();
    
    function getProject() {
	alert(location.pathname);
	return location.pathname.replace(/^\//, "");
    }
    
    async function load() {
	var project = getProject();
	
	if (!project) {
	    alert("URLにプロジェクト名を指定してください");
	    return;
	}
	console.log(project)

	// ScrapboxからMapfeel用データを取得
	const validdata = await getData(project)

	console.log(validdata);

	return validdata;
    }

    console.log("load...");
    return load();
}


