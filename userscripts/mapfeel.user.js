// ==UserScript==
// @name         Mapfeel
// @namespace    https://mapfeel.com/
// @version      1.0
// @description  Scrapboxプロジェクトの位置情報ページを地図上に表示
// @match        https://scrapbox.io/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      scrapbox.io
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Tampermonkeyツールバーメニューから起動
    GM_registerMenuCommand('Mapfeel', launchMapfeel);

    // 地図画像のクリックでMapfeelを起動
    function hookMapImages() {
        var imgs = document.querySelectorAll('img[src*="google-map/static-map"]');
        imgs.forEach(function(img) {
            if (img.dataset.mapfeelHooked) return;
            img.dataset.mapfeelHooked = 'true';
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                if (e.shiftKey) return; // Shift+クリックは元の挙動
                e.preventDefault();
                e.stopPropagation();
                launchMapfeel();
            }, true);
        });
    }

    // ScrapboxはSPAなのでDOMの変化を監視
    hookMapImages();
    new MutationObserver(hookMapImages).observe(document.body, { childList: true, subtree: true });

    function launchMapfeel() {
        var path = location.pathname;
        var pmatch = path.match(/^\/([^\/]+)/);
        if (!pmatch) return;
        var project = pmatch[1];
        if (['api', 'login', 'signup', 'settings', 'billing', 'stream'].includes(project)) return;

        var titleParts = document.title.split(' - ');
        var projectDisplayName = titleParts[titleParts.length - 1];
        var currentPage = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : null;

        if (currentPage) {
            var pageTitle = encodeURIComponent(currentPage.replace(/ /g, '_'));
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://scrapbox.io/api/pages/' + project + '/' + pageTitle,
                onload: function(response) {
                    var currentPageEntry = null;
                    if (response.status === 200) {
                        var pageData = JSON.parse(response.responseText);
                        var pos = null;
                        var descs = [];
                        pageData.lines.forEach(function(line) {
                            var m = line.text.match(/\[([NS])([\d\.]+),([EW])([\d\.]+)(?:,Z([\d\.]+))?/);
                            if (m && !pos) {
                                pos = {};
                                pos.lat = Number(m[2]) * (m[1] == 'S' ? -1 : 1);
                                pos.lng = Number(m[4]) * (m[3] == 'W' ? -1 : 1);
                                pos.zoom = m[5] ? Number(m[5]) : 12;
                            } else if (!m && line.text && !line.text.match(/gyazo\.com/i) && !line.text.match(/\[.*\.jpeg\]/)) {
                                var s = line.text;
                                s = s.replace(/\[.*\.icon\]/g, "\u{1F610}");
                                s = s.replace(/\[([^\]]+)\]/g, "$1");
                                s = s.replace(/#(\S*)/g, "($1)");
                                if (s.trim()) descs.push(s);
                            }
                        });
                        if (pos) {
                            currentPageEntry = {
                                title: pageData.title,
                                pos: pos,
                                descriptions: descs.slice(0, 5),
                                image: pageData.image
                            };
                        }
                    }
                    openMapfeel(project, currentPageEntry, projectDisplayName);
                },
                onerror: function() {
                    openMapfeel(project, null, projectDisplayName);
                }
            });
        } else {
            openMapfeel(project, null, projectDisplayName);
        }
    }

    function openMapfeel(proj, currentPageEntry, displayName) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://scrapbox.io/api/pages/' + proj + '?limit=1000',
            onload: function(response) {
                if (response.status !== 200) {
                    alert('プロジェクト "' + proj + '" のデータ取得に失敗しました');
                    return;
                }
                var sbdata = JSON.parse(response.responseText);
                var validData = getValidData(sbdata);
                if (validData.length === 0) {
                    alert('位置情報のあるページが見つかりませんでした');
                    return;
                }
                if (currentPageEntry) {
                    var found = false;
                    for (var i = 0; i < validData.length; i++) {
                        if (validData[i].title === currentPageEntry.title) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        validData.push(currentPageEntry);
                    }
                }
                launchMapWindow(proj, validData, currentPageEntry, displayName);
            },
            onerror: function() {
                alert('Scrapbox APIへの接続に失敗しました');
            }
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
                    if (description.match(/gyazo.com/i)) {
                    } else if (description.match(/\[.*\.jpeg\]/)) {
                    } else {
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

    function loadScript(doc, url, callback) {
        var script = doc.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = function() { alert('スクリプト読み込み失敗: ' + url); };
        doc.head.appendChild(script);
    }

    function launchMapWindow(proj, data, currentPageEntry, displayName) {
        var w = window.open('', '_blank');
        if (!w) {
            alert('ポップアップがブロックされました。ポップアップを許可してください。');
            return;
        }

        w.document.write(
            '<!doctype html><html lang="ja"><head><meta charset="UTF-8">' +
            '<title>Mapfeel - ' + displayName + '</title>' +
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>' +
            '<style>' +
            'body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:18px;}' +
            'a:link,a:visited{color:#0000f0;}a{text-decoration:none;}' +
            '.clickable{cursor:pointer;transition:background-color 0.2s,transform 0.15s;}' +
            '.clickable:hover{background-color:#f3f6ff;transform:translateY(-1px);}' +
            '</style></head><body>' +
            '<div style="font-size:18px;font-weight:bold;">' +
            '<a href="https://scrapbox.io/Mapfeel/">Mapfeel</a>: ' + displayName + '</div>' +
            '<div style="display:flex;margin:5px;">' +
            '<div id="map" style="position:relative;width:400px;height:400px;display:block;flex-grow:1;min-width:400px;max-width:400px;"></div>' +
            '<div style="flex-grow:0;"><div id="images" style="display:flex;flex-wrap:wrap;margin-left:5px;max-height:400px;overflow-y:hidden;"></div></div>' +
            '</div>' +
            '<div id="POIlist" style="margin:0px 5px 5px;"></div>' +
            '</body></html>'
        );
        w.document.close();

        loadScript(w.document, 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js', function() {
            loadScript(w.document, 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js', function() {
                runMapfeel(w, proj, data, currentPageEntry);
            });
        });
    }

    function runMapfeel(w, proj, data, currentPageEntry) {
        var $ = w.jQuery;
        var L = w.L;

        var NIMAGES = 20;
        var sortedByTitle = false;
        var topIndex = 0;
        var curpos = {};
        var imageSize = 195;
        var map = null;

        function initMap(lat, lng, zoom) {
            map = L.map("map", { keyboard: false });
            map.setView([lat, lng], zoom || 13);
            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                { attribution: "\u00a9 OpenStreetMap contributors" }
            ).addTo(map);
            return map;
        }

        function distance(lat1, lng1, lat2, lng2) {
            var R = Math.PI / 180;
            lat1 *= R; lng1 *= R; lat2 *= R; lng2 *= R;
            return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
        }

        function angle(lat1, lng1, lat2, lng2) {
            var R = Math.PI / 180;
            lat1 *= R; lng1 *= R; lat2 *= R; lng2 *= R;
            var deltax = lng2 - lng1;
            var y = Math.sin(deltax);
            var x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltax);
            var psi = Math.atan2(y, x) * 180 / Math.PI;
            if (psi < 0) psi += 360;
            return psi;
        }

        function dirIcon(a) {
            if (a < 22.5) return '\u2B06\uFE0F';
            if (a < 67.5) return '\u2197\uFE0F';
            if (a < 112.5) return '\u27A1\uFE0F';
            if (a < 157.5) return '\u2198\uFE0F';
            if (a < 202.5) return '\u2B07\uFE0F';
            if (a < 247.5) return '\u2199\uFE0F';
            if (a < 292.5) return '\u2B05\uFE0F';
            if (a < 337.5) return '\u2196\uFE0F';
            return '\u2B06\uFE0F';
        }

        function setImages(size) {
            $('#images').empty();
            for (var i = 0; i < NIMAGES; i++) {
                var img = $('<img id="img' + i + '" style="height:' + size + 'px;width:' + size + 'px;object-fit:cover;">');
                var div = $('<div style="margin:0px 5px 5px;cursor:zoom-in;">');
                div.append(img);
                $('#images').append(div);
            }
        }

        function showData(list) {
            showPOIList(list);
            showImages(list);
            showMarkers(list);
        }

        function sortData(list) {
            list.forEach(function(e) {
                e.distance = distance(e.pos.lat, e.pos.lng, curpos.lat, curpos.lng);
            });
            list.sort(function(a, b) {
                return a.distance > b.distance ? 1 : -1;
            });
        }

        function moveTo(e) {
            curpos.lat = e.pos.lat;
            curpos.lng = e.pos.lng;
            map.flyTo([curpos.lat, curpos.lng], map.getZoom());
            imageSize = 400;
            setImages(imageSize);
            sortData(data);
            showData(data);
        }

        function showPOIList(list) {
            $('#POIlist').empty();
            list.forEach(function(e) {
                var div = $('<div>');
                var span;

                span = $('<span class="clickable">');
                span.text(dirIcon(angle(curpos.lat, curpos.lng, e.pos.lat, e.pos.lng)));
                span.on('click', function() { moveTo(e); });
                div.append(span);
                div.append($('<span> </span>'));

                span = $('<span style="color:#77f;">');
                span.text(e.title);
                span.on('click', function() { moveTo(e); });
                div.append(span);
                div.append($('<span> </span>'));

                span = $('<span style="color:#22c;">');
                span.text('\u270E\uFE0F');
                span.on('click', function() {
                    w.open('https://scrapbox.io/' + proj + '/' + e.title);
                });
                div.append(span);
                div.append($('<span> </span>'));

                span = $('<span style="color:#666" class="clickable">');
                span.text(e.descriptions.join('\u30FB'));
                span.on('click', function() { moveTo(e); });
                div.append(span);

                $('#POIlist').append(div);
            });
        }

        function showMarkers(list) {
            map.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            for (var i = 0; i < NIMAGES && i < list.length; i++) {
                (function(page) {
                    var marker = L.marker([page.pos.lat, page.pos.lng]);
                    marker.addTo(map).bindTooltip(page.title);
                    marker.on('click', function(ev) {
                        curpos.lat = ev.latlng.lat;
                        curpos.lng = ev.latlng.lng;
                        map.flyTo([curpos.lat, curpos.lng], map.getZoom());
                        imageSize = 400;
                        setImages(imageSize);
                        sortData(data);
                        showData(data);
                    });
                })(list[i]);
            }
        }

        function showImages(list) {
            for (var i = 0; i < NIMAGES && i < list.length; i++) {
                (function(idx) {
                    var el = $('#img' + idx);
                    el[0].lat = list[idx].pos.lat;
                    el[0].lng = list[idx].pos.lng;
                    el.attr('src', list[idx].image);
                    el.on('click', function(ev) {
                        curpos.lat = ev.target.lat;
                        curpos.lng = ev.target.lng;
                        map.flyTo([curpos.lat, curpos.lng], map.getZoom());
                        imageSize = 400;
                        setImages(imageSize);
                        sortData(data);
                        showData(data);
                    });
                })(i);
            }
        }

        function start(lat, lng, zoom) {
            curpos.lat = lat;
            curpos.lng = lng;
            map = initMap(curpos.lat, curpos.lng, zoom);
            imageSize = 195;
            setImages(imageSize);
            sortData(data);
            showData(data);

            map.on('dragend', function() {
                sortedByTitle = false;
                imageSize = 195;
                setImages(imageSize);
                curpos = map.getCenter();
                sortData(data);
                showData(data);
            });

            $(w).keydown(function(ev) {
                ev.preventDefault();
                if (ev.keyCode == 38 || ev.keyCode == 40) {
                    if (!sortedByTitle) {
                        sortedByTitle = true;
                        var curtitle = data[0].title;
                        data.sort(function(a, b) { return a.title > b.title ? 1 : -1; });
                        for (topIndex = 0; data[topIndex].title != curtitle; topIndex++);
                    } else {
                        if (ev.keyCode == 38 && topIndex > 0) topIndex -= 1;
                        if (ev.keyCode == 40 && topIndex < data.length - 1) topIndex += 1;
                    }
                    imageSize = 400;
                    setImages(imageSize);
                    showData(data.slice(topIndex, data.length));
                    curpos.lat = data[topIndex].pos.lat;
                    curpos.lng = data[topIndex].pos.lng;
                    map.flyTo([curpos.lat, curpos.lng], map.getZoom());
                }
            });
        }

        if (currentPageEntry) {
            start(currentPageEntry.pos.lat, currentPageEntry.pos.lng, 16);
            imageSize = 400;
            setImages(imageSize);
            sortData(data);
            showData(data);
        } else if (w.navigator.geolocation) {
            w.navigator.geolocation.getCurrentPosition(
                function(pos) { start(pos.coords.latitude, pos.coords.longitude); },
                function() { start(35.6812, 139.7671); }
            );
        } else {
            start(35.6812, 139.7671);
        }
    }
})();
