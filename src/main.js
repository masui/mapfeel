//
// Mapfeelのメイン処理
//
import { initMap, distance, getCenter } from "/src/map.js"
import { getData } from "/src/data.js";

var curpos = {}
navigator.geolocation.getCurrentPosition(
  (pos) => {
    curpos.lat = pos.coords.latitude;
    curpos.lng = pos.coords.longitude;
  },
  (err) => {
    console.error(err);
  }
);

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

function angle(lat1, lng1, lat2, lng2) {
    const R = Math.PI / 180;
    lat1 *= R
    lng1 *= R
    lat2 *= R
    lng2 *= R
    let deltax = lng2 - lng1
    let y = Math.sin(deltax)
    let x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltax)
    let psi = Math.atan2(y, x) * 180 / Math.PI
    if (psi < 0) psi += 360
    return psi
}

// 方位角を方角アイコンに変える
function dirIcon(angle) {
    if (angle < 22.5) return '⬆️'
    if (angle < 67.5) return '↗️'
    if (angle < 112.5) return '➡️'
    if (angle < 157.5) return '↘️'
    if (angle < 202.5) return '⬇️'
    if (angle < 247.5) return '↙️'
    if (angle < 292.5) return '⬅️'
    if (angle < 337.5) return '↖️'
    return '⬆️'
}


function showlist(){
    $('#poilist').empty()
    data.map((e) => {
	var span = $('<span>')
	span.text(dirIcon(angle(curpos.lat, curpos.lng, e.pos.lat, e.pos.lng)))
	span.on('click', function(){
	    curpos.lat = e.pos.lat
	    curpos.lng = e.pos.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	})
	var div = $('<div>')
	
	div.append(span);
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

    $('#img0').src = data[0].image
    console.log(data[0].image)

    for(var i=0;i<8;i++){
	$('#img'+i).attr('src',data[i].image)
    }

    showlist()
});

