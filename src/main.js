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
    // return;
}

console.log('データ取得')
var data = await getData(project);

$('#poilist').empty()
for(var i=0;i<data.length;i++){
    /*
      var li = $('<li>')
      li.text(data[i].title)
      $('#poilist').append(li)
    */
    var e = $('<div>');
    e.text(data[i].title);		     
    $('#poilist').append(e);
}

map.on('moveend', function () {
    console.log("地図が動き終わった");
    curpos = map.getCenter();
    
    // dataをソート
    for (var i = 0; i < data.length; i++) {
        var entry = data[i]
        entry.distance = distance(entry.pos.lat, entry.pos.lng, curpos.lat, curpos.lng)
    }
    data = data.sort((a, b) => { // 近い順にソート
        return a.distance > b.distance ? 1 : -1;
    })
    
    $('#poilist').empty();
    data.map((e) => {
	var div = $('<div>')       
	div.text(e.title + ' ' + e.description);
	$('#poilist').append(div)
    })
    
    /*
    for(var i=0;i<data.length;i++){
	var div = $('<div>')       
	div.text(data[i].title + ' ' + data[i].description);
	$('#poilist').append(div)
	}
    */
});

