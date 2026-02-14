//
// Scrapboxのプロジェクトのデータを取得するモジュール
//

// Mapfeelに関係するページだけ抽出する
function getValidData(data){
    const datalist = []
    data.pages.map((page) => {
	let entry = {}
	entry.title = page.title;
	entry.description = ""
	page.descriptions.map((description) => {
	    let match = description.match(/\[([NS])([\d\.]+),([EW])([\d\.]+),Z([\d\.]+)(\s+\S+)?\]/) // 地図が登録されている場合
	    if(match){
		let pos = {}
		pos.lat = Number(match[2])
		if (match[1] == 'S') pos.lat = -pos.lat
		pos.lng = Number(match[4])
		if (match[3] == 'W') pos.lng = -pos.lng
		pos.zoom = 12
		if (match[6]) pos.zoom = Number(match[6])
		entry.pos = pos
	    }
	    else {
		// 画像の行などは飛ばす
		if(description.match(/gyazo.com/i)){
		}
		else {
		    entry.description += (' / ' + description)
		}
	    }
	});
	entry.image = page.image
	
	if(entry.pos){ // validなエントリ
	    datalist.push(entry)
	}
    })

    return datalist;
}

export async function getData(project) {
    const res = await fetch(`/api/scrapbox/${project}`);
    const sbdata = await res.json();

    console.log(sbdata);

    return getValidData(sbdata)
}
