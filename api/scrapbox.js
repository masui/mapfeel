//
// Vercelのサーバ(?)で動く関数
// CORS問題に対応するため使ってる
// (サーバからはScrapboxのAPIを呼べるため)
//
// Expressでいうところの
// app.get("/api/scrapbox", handler)
// みたいなのがVercelで自動的に動く
// export defaultな関数が /api/scrapbox で動くらしい
// サーバ関数というのだっけ
//
// フロントのJSからは
// const res = await fetch(`/api/scrapbox/${project}`);
// みたいに使う
//
// 決め打ちの規則ばかりで気持ち悪いが
// api/, export default, etc.
//

export default async function handler(req, res) {
    const { project } = req.query;

    const url = `https://scrapbox.io/api/pages/${project}?limit=1000`;

    const r = await fetch(url);
    const data = await r.json();

    const html = await fetch("https://scrapbox.io/${project}/").then(r => r.text());
    const title = html.match(/(<title>(.*?)<\/title>)/i)[1];
    data.title = title

    res.setHeader("Access-Control-Allow-Origin", "*");
    /*
    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate"
    );
    */
    res.status(200).json(data);
}
