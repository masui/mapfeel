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
// 決め打ちの規則ばかりで気持ち悪い
// api/, export default, etc.
//

export default async function handler(req, res) {
  const { project } = req.query;

  const url = `https://scrapbox.io/api/pages/${project}`;

  const r = await fetch(url);
  const data = await r.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(data);
}


/*
export default async function handler(req, res) {
  const { project } = req.query;

  if (!project) {
    res.status(400).json({ error: "project required" });
    return;
  }

  const url = `https://scrapbox.io/api/pages/${project}`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate"
    );

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
*/