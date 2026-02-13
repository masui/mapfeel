import { initMap } from "/src/map.js";
import { getData } from "/src/data.js";

export async function main(project) {
    //const map = initMap();
    //initMap();
    
    async function load(project) {
	// ScrapboxからMapfeel用データを取得
	const validdata = await getData(project)

	return validdata;
    }
    
    return load(project);
}


