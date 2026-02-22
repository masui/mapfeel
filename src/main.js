//
// Mapfeelのメイン処理
//
import { initMap, distance } from "/src/map.js"
import { getScrapboxData } from "/src/data.js";

// 表示する画像/マーカーの数
const NIMAGES = 20

var sortedByTitle = false // カーソルでPOI移動してるかどうか
var topIndex = 0 // タイトルでソートしたときのトップ行のインデクス
var state = {} // pushState() で使うもの
var curpos = {}  // 表示している地図の中心座標
var imageSize = 195

// URLの引数解析
let args = {}
document.location.search.substring(1).split('&').forEach((s) => {
    if (s != '') {
        let [name, value] = s.split('=')
        args[name] = decodeURIComponent(value)
    }
})
if (args.loc) { // ?loc=N35.12E135.12Z13 のように指定されていた場合
    var match
    match = args.loc.match(/([NS])([\d\.]+),?([EW])([\d\.]+),?(Z([\d\.]+))?/)
    if (match) {
        curpos.lat = Number(match[2]) * (match[1] == 'N' ? 1 : -1)
        curpos.lng = Number(match[4]) * (match[3] == 'E' ? 1 : -1)
        curpos.zoom = 12
        if (match[6])curpos.zoom = Number(match[6])
    }
    else {
	alert("?loc=N35E135 のような形式で位置を指定してください");
    }
}

function getCurrentPositionAsync(options) { // GPSから現在位置を得る
    return new Promise((resolve, reject) => {
	navigator.geolocation.getCurrentPosition(resolve, reject, options); // これは非同期関数らしい
    });
}
if(! curpos.lat){
    // 現在地の緯度経度を取得
    try {
        const pos = await getCurrentPositionAsync();
        curpos.lat = pos.coords.latitude;
        curpos.lng = pos.coords.longitude;
    } catch (error) {
        // GPS取得失敗時はデフォルト位置（東京駅）を使用
        console.warn('GPS取得失敗:', error.message);
        curpos.lat = 35.6812;
        curpos.lng = 139.7671;
    }
}

console.log('プロジェクト名取得')
var project = location.pathname.replace(/^\//, "");
if (!project) {
    alert("URLにプロジェクト名を指定してください");
    project = "masuimap"
}

console.log('Scrapboxのデータ取得')
var data;
try {
    data = await getScrapboxData(project);
} catch (error) {
    alert(error.message);
    data = [];
}

//
// 起動時の表示
//
console.log('地図表示')
console.log(`curpos = ${curpos.lat}, ${curpos.lng}`)
const map = initMap(curpos.lat, curpos.lng);
map.flyTo([curpos.lat, curpos.lng], map.getZoom())
imageSize = 195 // 195または400
setImages(imageSize); // 小さい画像を表示
sortData(data)
showData(data)

// 方向の角度計算
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
    if (angle < 360.0 * 1 / 16 /* 22.5 */) return '⬆️'
    if (angle < 360.0 * 3 / 16 /* 67.5 */) return '↗️'
    if (angle < 360.0 * 5 / 16 /* 112.5 */) return '➡️'
    if (angle < 360.0 * 7 / 16 /* 157.5 */) return '↘️'
    if (angle < 360.0 * 9 / 16 /* 202.5 */) return '⬇️'
    if (angle < 360.0 * 11 / 16 /* 247.5 */) return '↙️'
    if (angle < 360.0 * 13 / 16 /* 292.5 */) return '⬅️'
    if (angle < 360.0 * 15 / 16 /* 337.5 */) return '↖️'
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

function locstr(){
    return (curpos.lat > 0 ? `N${curpos.lat.toFixed(5)}` : `S${-curpos.lat.toFixed(5)}`)
	+ (curpos.lng > 0 ? `E${curpos.lng.toFixed(5)}` : `W${-curpos.lng.toFixed(5)}`)
        + `Z${map.getZoom()}`
}

window.addEventListener('popstate', (event) => {
    console.log('popstate')
    location.href = location
})

// POIリスト、画像などを表示
function showData(list){
    showPOIList(list)
    showImages(list)
    showMarkers(list)
}

// curposとの距離でデータをソート
function sortData(list){
    list.forEach((e) => {
	e.distance = distance(e.pos.lat, e.pos.lng, curpos.lat, curpos.lng)
    })
    list.sort((a, b) => { // curposに近い順にソート
	return a.distance > b.distance ? 1 : -1;
    })
}

//
// POIリストの表示
//
function showPOIList(list){
    $('#POIlist').empty()
    list.forEach((e) => {
	var div = $('<div>')
	var span;

	// 矢印表示
	span = $('<span class="clickable">')
	span.text(dirIcon(angle(curpos.lat, curpos.lng, e.pos.lat, e.pos.lng)))
	span.on('click', function(evt){ //クリックで移動
	    curpos.lat = e.pos.lat
	    curpos.lng = e.pos.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())

	    imageSize = 400
	    setImages(imageSize); // 拡大表示

	    // listをソート
	    sortData(data)
	    showData(data)

            history.pushState(state,null,`?loc=${locstr()}`)

	})
	div.append(span)
		
	div.append($('<span>　</span>'))

	span = $('<span style="color:#88f;">')
	span.text(e.title)
	span.on('click', function(evt){
	    // window.open(`https://scrapbox.io/${project}/${e.title}`)
	    curpos.lat = e.pos.lat
	    curpos.lng = e.pos.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())

	    imageSize = 400
	    setImages(imageSize); // 拡大表示

	    // listをソート
	    sortData(data)
	    showData(data)

            history.pushState(state,null,`?loc=${locstr()}`)
	})
	div.append(span)
	
	div.append($('<span>　</span>'))

	// description表示
	span = $('<span style="color:#666" class="clickable">')
	span.text(e.descriptions.join('・'));
	span.on('click', function(evt){ //クリックで移動
	    curpos.lat = e.pos.lat
	    curpos.lng = e.pos.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())

	    imageSize = 400
	    setImages(imageSize)

	    // listをソート
	    sortData(data)
	    showData(data)

            history.pushState(state,null,`?loc=${locstr()}`)

	})
	div.append(span)

	$('#POIlist').append(div)
    })
}

function showMarkers(list){  // 地図にマーカー表示
    map.eachLayer(layer => { // マーカーを全部消す
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
	    imageSize = 400
	    setImages(imageSize); // 拡大表示

	    sortData(data)
	    showData(data)
	});
    }
}

function showImages(list){
    console.log(`showImages: listlen=${list.length}`)
    for(var  i=0;i<NIMAGES && i<list.length;i++){
	// 画像の属性として緯度経度を記録しておく
	$('#img'+i)[0].lat = list[i].pos.lat
	$('#img'+i)[0].lng = list[i].pos.lng

 	$('#img'+i).attr('src',list[i].image)
	// 画像クリックで移動
	$('#img'+i).on('click', function(e){
	    curpos.lat = e.target.lat
	    curpos.lng = e.target.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())

	    imageSize = 400
	    setImages(imageSize)

	    sortData(data)
	    showData(data)
	    
            history.pushState(state,null,`?loc=${locstr()}`)
	})
    }
}

map.on('dragend', () => {
    // 地図をドラッグすると縮小画像を表示
    imageSize = 195
    setImages(imageSize)
    
    curpos = map.getCenter();
    sortData(data)
    showData(data)
});

// 上下カーソル移動キー
$(window).keydown(function(e){
    e.preventDefault()
    const UP = 38
    const DOWN = 40

    if(e.keyCode == UP || e.keyCode == DOWN){
        if(! sortedByTitle){
            sortedByTitle = true
            var curtitle = data[0].title
            data.sort((a, b) => {
                return a.title > b.title ? 1 : -1;
            })
            for(topIndex = 0; data[topIndex].title != curtitle; topIndex++);
        }
        else {
            if(e.keyCode == UP && topIndex > 0) { topIndex -= 1 }
            if(e.keyCode == DOWN && topIndex < data.length - 1) { topIndex += 1 }
        }

	imageSize = 400
	setImages(imageSize); // 拡大表示
	
        showData(data.slice(topIndex,data.length))

	curpos.lat = data[topIndex].pos.lat 
	curpos.lng = data[topIndex].pos.lng 
	
	map.flyTo([curpos.lat, curpos.lng], map.getZoom())

        history.pushState(state,null,`?loc=${locstr()}`)
    }
})
