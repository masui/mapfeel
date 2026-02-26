//
// Scrapboxのプロジェクトのデータを取得するモジュール
//

// Mapfeelで使えるページだけ抽出する
function getValidData(data){
    const datalist = []
    data.pages.forEach((page) => {
	let entry = {}
	entry.title = page.title;
	entry.descriptions = []

	// page.descriptions にはScrapboxページの最初の5行だけ格納されるらしい
	page.descriptions.forEach((description) => {
	    let match = description.match(/\[([NS])([\d\.]+),([EW])([\d\.]+)(?:,Z([\d\.]+))?(\s+\S+)?\]/) // 地図が登録されている場合
	    if(match){
		let pos = {}
		pos.lat = Number(match[2])
		if (match[1] == 'S') pos.lat = -pos.lat
		pos.lng = Number(match[4])
		if (match[3] == 'W') pos.lng = -pos.lng
		pos.zoom = 12
		if (match[5]) pos.zoom = Number(match[5])
		entry.pos = pos
	    }
	    else {
		// 画像の行などは飛ばす
		if(description.match(/gyazo.com/i)){
		}
		else if(description.match(/\[.*\.jpeg\]/)){
		}
		else {
		    var s = description
		    s = s.replace(/\[.*\.icon\]/g, "😐")
		    s = s.replace(/\[([^\]]+)\]/g, "$1") // []は削除
		    s = s.replace(/#(\S*)/g, "($1)")
		    entry.descriptions.push(s)
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

export async function getScrapboxData(project) {
    const res = await fetch(`/api/scrapbox/${project}`);

    if (!res.ok) {
        throw new Error(`プロジェクト "${project}" が見つかりません`);
    }

    const sbdata = await res.json();

    return getValidData(sbdata)
}
