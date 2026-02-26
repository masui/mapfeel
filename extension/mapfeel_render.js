// Mapfeel地図レンダリング（chrome.scripting.executeScriptで注入される）
(function() {
    var $ = window.jQuery;
    var L = window.L;
    var params = window.__mapfeelData;
    if (!params || !$ || !L) return;

    var proj = params.project;
    var displayName = params.displayName;
    var data = params.validData;
    var currentPageEntry = params.currentPageEntry;

    // Leafletマーカー画像のパス設定
    L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/';

    var NIMAGES = 20;
    var sortedByTitle = false;
    var topIndex = 0;
    var curpos = {};
    var imageSize = 195;
    var map = null;

    // ページ内容を置き換え
    document.title = 'Mapfeel - ' + displayName;
    document.body.innerHTML =
        '<div style="font-size:18px;font-weight:bold;margin-left:5px;">' +
        '<a href="https://scrapbox.io/Mapfeel/">Mapfeel</a>: ' + displayName + '</div>' +
        '<div style="display:flex;margin:5px;">' +
        '<div id="map" style="position:relative;width:400px;height:400px;display:block;flex-grow:1;min-width:400px;max-width:400px;"></div>' +
        '<div style="flex-grow:0;"><div id="images" style="display:flex;flex-wrap:wrap;margin-left:5px;max-height:400px;overflow-y:hidden;"></div></div>' +
        '</div>' +
        '<div id="POIlist" style="margin:0px 5px 5px;"></div>';

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
                window.open('https://scrapbox.io/' + proj + '/' + e.title);
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

        $(window).keydown(function(ev) {
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
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(pos) { start(pos.coords.latitude, pos.coords.longitude); },
            function() { start(35.6812, 139.7671); }
        );
    } else {
        start(35.6812, 139.7671);
    }
})();
