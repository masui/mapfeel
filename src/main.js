//
// Mapfeelのメイン処理
//
import { initMap, distance, getCenter } from "/src/map.js"
import { getData } from "/src/data.js";

var curpos = {}

console.log('地図表示')
const map = initMap();

console.log('プロジェクト名取得')
var project = location.pathname.replace(/^\//, "");
if (!project) {
    alert("URLにプロジェクト名を指定してください");
    project = "masuimap"
}

console.log('データ取得')
var data = await getData(project);

function showlist(){
    $('#poilist').empty()
    data.map((e) => {
	var div = $('<div>')       
	div.text(e.title + ' ' + e.description);
	$('#poilist').append(div)
    })
}

showlist()

map.on('moveend', function () {
    console.log("地図が動き終わった");
    curpos = map.getCenter();
    
    // dataをソート
    data.map((e) => {
        e.distance = distance(e.pos.lat, e.pos.lng, curpos.lat, curpos.lng)
    })
    data.sort((a, b) => { // curposに近い順にソート
        return a.distance > b.distance ? 1 : -1;
    })

    showlist()
});

