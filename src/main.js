//
// Mapfeelのメイン処理
//
import { initMap, distance } from "/src/map.js"
import { getData } from "/src/data.js";

// 右上に表示する画像の数
const NIMAGES = 20

var sortedByTitle = false
var topIndex = 0 // タイトルでソートしたときのトップ行のインデクス
var locSelected = false // 明示的に選択されたらtrueになる

var curpos = {}
navigator.geolocation.getCurrentPosition(
    (pos) => {
	curpos.lat = pos.coords.latitude;
	curpos.lng = pos.coords.longitude;
    },
    (err) => {
	console.error(err);
    }
)

console.log('地図表示')
const map = initMap();

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

setImages(195);

function showlist(){
    $('#poilist').empty()
    data.map((e) => {
	var div = $('<div>')

	var span = $('<span>')
	span.text(dirIcon(angle(curpos.lat, curpos.lng, e.pos.lat, e.pos.lng)) +
		  '　' + e.title + '　');
	span.on('click', function(evt){
	    if (evt.shiftKey) {
		// ShiftでScrapboxページを表示
		window.open(`https://scrapbox.io/${project}/${e.title}`)
	    }
	    else {
		curpos.lat = e.pos.lat
		curpos.lng = e.pos.lng
		map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	    }
	})
	div.append(span)
	
	span = $('<span style="color:#666">')
	span.text(e.descriptions.join('・'));
	div.append(span)

	$('#poilist').append(div)
    })

    // マーカー全部消す
    map.eachLayer(layer => {
	if (layer instanceof L.Marker) {
	    map.removeLayer(layer);
	}
    });
    // マーカー表示
    for(var i=0;i<NIMAGES && i<data.length;i++){
	var page = data[i]
	var marker = L.marker([page.pos.lat, page.pos.lng]);
	// hoverで内容を表示
	marker.addTo(map).bindTooltip(page.title);
	// マーカークリックで移動
	marker.on('click', function (e) {
	    curpos.lat = e.latlng.lat;
	    curpos.lng = e.latlng.lng;
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	});

	// 画像の属性として緯度経度を記録しておく
	$('#img'+i)[0].lat = data[i].pos.lat
	$('#img'+i)[0].lng = data[i].pos.lng
	
 	$('#img'+i).attr('src',data[i].image)
	// 画像クリックで移動
	$('#img'+i).on('click', function(e){
	    setImages(400); // 拡大表示
	    curpos.lat = e.target.lat
	    curpos.lng = e.target.lng
	    map.flyTo([curpos.lat, curpos.lng], map.getZoom())
	})
    }
}

showlist()

map.on('moveend', function () {
    console.log("地図が動き終わった");
    curpos = map.getCenter();

    setImages(195)

    // dataをソート
    data.map((e) => {
        e.distance = distance(e.pos.lat, e.pos.lng, curpos.lat, curpos.lng)
    })
    data.sort((a, b) => { // curposに近い順にソート
        return a.distance > b.distance ? 1 : -1;
    })

    showlist()

});

$(window).keydown(function(e){
    e.preventDefault()
    // 38 が上, 40 が下
    console.log(`keyCode = ${e.keyCode}`)

    if(e.keyCode == 38 || e.keyCode == 40){
        if(! sortedByTitle){
            sortedByTitle = true
            var curtitle = data[0].title
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

	/*
        $('#images').empty()
        $('<img>')
            .attr('src', `${data[topIndex].photo}/raw`)
            .attr('class', 'largeimage')
            .appendTo('#images')
	*/
	locSelected = true
	
        showlist()

	map.flyTo([curpos.lat, curpos.lng], map.getZoom())

        let ind = topIndex
        let locstr = (data[ind].pos.lat > 0 ? `N${data[ind].pos.lat}` : `S${-data[ind].pos.lat}`)
            + (data[ind].pos.lng > 0 ? `E${data[ind].pos.lng}` : `W${-data[ind].pos.lng}`)
        locstr += `Z${map.getZoom()}`
        //history.pushState(state, null, `?loc=${locstr}`)
    }
})

