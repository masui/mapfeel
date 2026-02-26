// コンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'mapfeel-launch',
        title: 'Mapfeel',
        contexts: ['page', 'image'],
        documentUrlPatterns: ['https://scrapbox.io/*']
    });
});

// content.jsを確実に注入してからメッセージを送る
function ensureContentScriptAndLaunch(tab) {
    if (!tab.url || !tab.url.startsWith('https://scrapbox.io/')) return;
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }, () => {
        chrome.tabs.sendMessage(tab.id, { action: 'launchMapfeel' });
    });
}

// ツールバーアイコンクリック時
chrome.action.onClicked.addListener((tab) => {
    ensureContentScriptAndLaunch(tab);
});

// コンテキストメニュークリック時
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'mapfeel-launch') {
        ensureContentScriptAndLaunch(tab);
    }
});

function fetchJSON(url) {
    return fetch(url, { credentials: 'include' })
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
}

function getValidData(data) {
    var datalist = [];
    data.pages.forEach(function(page) {
        var entry = {};
        entry.title = page.title;
        entry.descriptions = [];
        page.descriptions.forEach(function(description) {
            var m = description.match(/\[([NS])([\d\.]+),([EW])([\d\.]+)(?:,Z([\d\.]+))?(\s+\S+)?\]/);
            if (m) {
                var pos = {};
                pos.lat = Number(m[2]);
                if (m[1] == 'S') pos.lat = -pos.lat;
                pos.lng = Number(m[4]);
                if (m[3] == 'W') pos.lng = -pos.lng;
                pos.zoom = 12;
                if (m[5]) pos.zoom = Number(m[5]);
                entry.pos = pos;
            } else {
                if (!description.match(/gyazo.com/i) && !description.match(/\[.*\.jpeg\]/)) {
                    var s = description;
                    s = s.replace(/\[.*\.icon\]/g, "\u{1F610}");
                    s = s.replace(/\[([^\]]+)\]/g, "$1");
                    s = s.replace(/#(\S*)/g, "($1)");
                    entry.descriptions.push(s);
                }
            }
        });
        entry.image = page.image;
        if (entry.pos) {
            datalist.push(entry);
        }
    });
    return datalist;
}

var launching = false;

// content.jsからのメッセージを処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'launch') {
        if (launching) return;
        launching = true;
        handleLaunch(message).finally(() => { launching = false; });
        return;
    }
    if (message.action === 'fetch') {
        fetch(message.url, { credentials: 'include' })
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(data) { sendResponse({ ok: true, data: data }); })
            .catch(function(err) { sendResponse({ ok: false, error: err.message }); });
        return true;
    }
});

async function handleLaunch(params) {
    var project = params.project;
    var displayName = params.displayName;
    var currentPage = params.currentPage;
    var currentPageEntry = null;

    // 個別ページの位置情報を取得
    if (currentPage) {
        try {
            var pageTitle = encodeURIComponent(currentPage.replace(/ /g, '_'));
            var pageData = await fetchJSON('https://scrapbox.io/api/pages/' + project + '/' + pageTitle);
            var pos = null;
            var descs = [];
            pageData.lines.forEach(function(line) {
                var m = line.text.match(/\[([NS])([\d\.]+),([EW])([\d\.]+)(?:,Z([\d\.]+))?/);
                if (m && !pos) {
                    pos = {
                        lat: Number(m[2]) * (m[1] === 'S' ? -1 : 1),
                        lng: Number(m[4]) * (m[3] === 'W' ? -1 : 1),
                        zoom: m[5] ? Number(m[5]) : 12
                    };
                } else if (!m && line.text && !line.text.match(/gyazo\.com/i) && !line.text.match(/\[.*\.jpeg\]/)) {
                    var s = line.text.replace(/\[.*\.icon\]/g, "\u{1F610}").replace(/\[([^\]]+)\]/g, "$1").replace(/#(\S*)/g, "($1)");
                    if (s.trim()) descs.push(s);
                }
            });
            if (pos) {
                currentPageEntry = {
                    title: pageData.title, pos: pos,
                    descriptions: descs.slice(0, 5), image: pageData.image
                };
            }
        } catch (e) { /* ignore */ }
    }

    // プロジェクト全ページ取得
    try {
        var sbdata = await fetchJSON('https://scrapbox.io/api/pages/' + project + '?limit=1000');
        var validData = getValidData(sbdata);
        if (validData.length === 0) return;
        if (currentPageEntry && !validData.some(function(d) { return d.title === currentPageEntry.title; })) {
            validData.push(currentPageEntry);
        }

        // 新しいタブを開く
        var tab = await chrome.tabs.create({ url: 'https://scrapbox.io/' });

        // タブの読み込み完了を待つ
        await new Promise(function(resolve) {
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            });
        });

        // CSSを注入
        await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['leaflet.css'] });
        await chrome.scripting.insertCSS({ target: { tabId: tab.id }, css:
            'body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;margin:0;padding:5px;}' +
            'a:link,a:visited{color:#0000f0;}a{text-decoration:none;}' +
            '.clickable{cursor:pointer;transition:background-color 0.2s,transform 0.15s;}' +
            '.clickable:hover{background-color:#f3f6ff;transform:translateY(-1px);}'
        });

        // データを渡す
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function(data) { window.__mapfeelData = data; },
            args: [{ project: project, displayName: displayName, validData: validData, currentPageEntry: currentPageEntry }]
        });

        // jQuery注入
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['jquery.min.js'] });

        // Leaflet注入
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['leaflet.js'] });

        // 地図レンダリングスクリプト注入
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['mapfeel_render.js'] });

    } catch (e) {
        console.error('Mapfeel launch error:', e);
    }
}
