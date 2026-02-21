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

    // プロジェクト名のバリデーション
    if (!project || !/^[\w-]+$/.test(project)) {
        res.status(400).json({ error: "Invalid project name" });
        return;
    }

    const url = `https://scrapbox.io/api/pages/${project}?limit=1000`;

    const r = await fetch(url);

    // プロジェクトが存在しない場合
    if (!r.ok) {
        res.status(r.status).json({ error: "Project not found" });
        return;
    }

    const data = await r.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
}
