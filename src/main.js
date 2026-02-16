//
// Mapfeelのメイン処理
//
import { initMap, distance } from "/src/map.js"
import { getData } from "/src/data.js";

// 表示する画像/マーカーの数
const NIMAGES = 20

var sortedByTitle = false
var topIndex = 0 // タイトルでソートしたときのトップ行のインデクス

var curpos = {} // 地図の中心座標

// 引数解析
let args = {}
document.location.search.substring(1).split('&').forEach((s) => {
    if (s != '') {
        let [name, value] = s.split('=')
        args[name] = decodeURIComponent(value)
    }
})
if (args.loc) {
    var match
    match = args.loc.match(/([NS])([\d\.]+),?([EW])([\d\.]+)(,?Z([\d\.]+))?/) // e.g. N35.12E135.12Z13
    console.log(`match=${match}`)
    if (match) {
        curpos.lat = Number(match[2])
        if (match[1] == 'S') curpos.lat = -curpos.lat
        curpos.lng = Number(match[4])
        if (match[3] == 'W') curpos.lng = -curpos.lng
        curpos.zoom = 12
        if (match[6])curpos.zoom = Number(match[6])
    }
}
if(! curpos.lat){
    navigator.geolocation.getCurrentPosition(
	(pos) => {
	    curpos.lat = pos.coords.latitude;
	    curpos.lng = pos.coords.longitude;
	    console.log(curpos)
	},
	(err) => {
	    console.error(err);
	}
    )
}
//console.log(`curpos = ${curpos.lat}, ${curpos.lng}`)

console.log('地図表示')
const map = initMap(curpos.lat, curpos.lng);

map.flyTo([curpos.lat, curpos.lng], map.getZoom())

console.log('プロジェクト名取得')
var project = location.pathname.replace(/^\//, "");
if (!project) {
    alert("URLにプロジェクト名を指定してください");
    project = "masuimap"
}

console.log('Scrapboxのデータ取得')
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

// 画像リストのDOMを生成
function setImages(size){
    $('#images').empty();
    for(var i=0;i<NIMAGES;i++){
	var img = $(`<img id="img${i}" style="height: ${size}px; width: ${size}px; object-fit: cover;">`)
	var div = $('<div style="margin: 0px 5px 5px; cursor: zoom-in;">')
	div.append(img)
	$('#images').append(div)
    }
}

setImages(195); // 小さい画像を表示
// setImages(400) // 大きい画像を表示

//
// POIリストの表示
//
function showlist(list){
    $('#poilist').empty()
    list.map((e) => {
	var div = $('<div>')
	var span;

	// 矢印表示
	span = $('<span>')
	span.text(dirIcon(angle(curpos.lat, curpos.lng, e.pos.lat, e.pos.lng)))
	span.on('click', function(evt){ //クリックで移動
	    curpos.lat = e.pos.lat
	    curpos.lng = e.pos.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	    /*
	    map.on('moveend', () => {
		console.log('flyTo 完了');
		setImages(400); // 拡大表示
		});
		*/
	    setImages(400); // 拡大表示
	})
	div.append(span)
		
	div.append($('<span>　</span>'))

	span = $('<span style="color:#33f;">')
	span.text(e.title)
	span.on('click', function(evt){
	    window.open(`https://scrapbox.io/${project}/${e.title}`)
	})
	div.append(span)
	
	div.append($('<span>　</span>'))

	// description表示
	span = $('<span style="color:#666">')
	span.text(e.descriptions.join('・'));
	span.on('click', function(evt){ //クリックで移動
	    curpos.lat = e.pos.lat
	    curpos.lng = e.pos.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	})
	div.append(span)

	$('#poilist').append(div)
    })

    // 地図にマーカー表示
    map.eachLayer(layer => {
	if (layer instanceof L.Marker) {
	    map.removeLayer(layer);
	}
    });
    for(var i=0;i<NIMAGES && i<list.length;i++){
	var page = list[i]
	var marker = L.marker([page.pos.lat, page.pos.lng]);
	// hoverで内容を表示
	marker.addTo(map).bindTooltip(page.title);
	// マーカークリックで移動
	marker.on('click', function (e) {
	    curpos.lat = e.latlng.lat;
	    curpos.lng = e.latlng.lng;
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	    setImages(400); // 拡大表示
	});

	// 画像の属性として緯度経度を記録しておく
	$('#img'+i)[0].lat = list[i].pos.lat
	$('#img'+i)[0].lng = list[i].pos.lng
	
 	$('#img'+i).attr('src',list[i].image)
	// 画像クリックで移動
	$('#img'+i).on('click', function(e){
	    curpos.lat = e.target.lat
	    curpos.lng = e.target.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	    /*
	    map.on('moveend', () => {
		console.log('flyTo 完了');
		setImages(400); // 拡大表示
		});
		*/
	    setImages(400); // 拡大表示
	})
    }
}

showlist(data)

map.on('dragend', () => {
    // ドラッグすると縮小画像を表示
    setImages(195)
});

map.on('moveend', function () {
    console.log("地図が動き終わった");
    curpos = map.getCenter();

    console.log("Moved");

    if(sortedByTitle){
	console.log('sortedByTitle');
        showlist(data.slice(topIndex,data.length))
    }
    else {
	// dataをソート
	data.map((e) => {
            e.distance = distance(e.pos.lat, e.pos.lng, curpos.lat, curpos.lng)
	})
	data.sort((a, b) => { // curposに近い順にソート
            return a.distance > b.distance ? 1 : -1;
	})
	showlist(data)
    }

});

$(window).keydown(function(e){
    e.preventDefault()
    // 38 が上, 40 が下
    console.log(`keyCode = ${e.keyCode}`)

    if(e.keyCode == 38 || e.keyCode == 40){
        if(! sortedByTitle){
            sortedByTitle = true
            var curtitle = data[0].title
	    console.log('sort data');
            data.sort((a, b) => {
                return a.title > b.title ? 1 : -1;
            })
            for(topIndex = 0; data[topIndex].title != curtitle; topIndex++);
        }
        else {
            if(e.keyCode == 38){
                if (topIndex > 0) {
                    topIndex -= 1
                }
            }
            else { // keyCode = 40
                if (topIndex < data.length - 1) {
                    topIndex += 1
                }
            }
        }

	console.log(`topindex=${topIndex}`)
        console.log(`datalen = ${data.slice(topIndex,data.length).length}`)
        showlist(data.slice(topIndex,data.length))

	curpos.lat = data[topIndex].pos.lat 
	curpos.lng = data[topIndex].pos.lng 
	
	map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	
	setImages(400); // 拡大表示

	console.log(`sortedByTitle=${sortedByTitle}`)

        let ind = topIndex
        let locstr = (data[ind].pos.lat > 0 ? `N${data[ind].pos.lat}` : `S${-data[ind].pos.lat}`)
            + (data[ind].pos.lng > 0 ? `E${data[ind].pos.lng}` : `W${-data[ind].pos.lng}`)
        locstr += `Z${map.getZoom()}`
        //history.pushState(state, null, `?loc=${locstr}`)
    }
})

