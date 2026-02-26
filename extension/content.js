// Mapfeel Chrome Extension - Content Script
// Scrapboxページ上で動作し、ページ情報をbackground.jsに送る
(function() {
    'use strict';

    // 重複注入を防ぐ
    if (window.__mapfeelContentLoaded) return;
    window.__mapfeelContentLoaded = true;

    // 地図画像のクリックでMapfeelを起動
    function hookMapImages() {
        var imgs = document.querySelectorAll('img[src*="google-map/static-map"]');
        imgs.forEach(function(img) {
            if (img.dataset.mapfeelHooked) return;
            img.dataset.mapfeelHooked = 'true';
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                if (e.shiftKey) return;
                e.preventDefault();
                e.stopPropagation();
                sendLaunch();
            }, true);
        });
    }

    hookMapImages();
    new MutationObserver(hookMapImages).observe(document.body, { childList: true, subtree: true });

    // background.jsからのメッセージを受信
    chrome.runtime.onMessage.addListener(function(message) {
        if (message.action === 'launchMapfeel') {
            sendLaunch();
        }
    });

    function sendLaunch() {
        var path = location.pathname;
        var pmatch = path.match(/^\/([^\/]+)/);
        if (!pmatch) return;
        var project = pmatch[1];
        if (['api', 'login', 'signup', 'settings', 'billing', 'stream'].includes(project)) return;

        var titleParts = document.title.split(' - ');
        var projectDisplayName = titleParts[titleParts.length - 1];
        var currentPage = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : null;

        chrome.runtime.sendMessage({
            action: 'launch',
            project: project,
            displayName: projectDisplayName,
            currentPage: currentPage
        });
    }
})();
