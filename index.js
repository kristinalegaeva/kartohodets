const game = {
    map: null,
    streetView: null,
    userMarker: null,
    ansMarker: null,
    ansPin: null,
    ansLoc: null,
    line: null,
};

// Инициализации

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    game.map = new Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapId: '4504f8b37365c3d0',
    });

    const userPin = new google.maps.marker.PinElement({
        background: "#000",
        borderColor: "#fff",
        glyphColor: "#fff",
    });

    game.userMarker = new AdvancedMarkerElement({
        map: game.map,
        position: { lat: 0, lng: 0 },
        gmpDraggable: true,
        content: userPin.element,
        title: "You wanna guess",
    });

    game.ansPin = new google.maps.marker.PinElement({
        background: "#fff",
        borderColor: "#000",
        glyphColor: '#000',
    });

    game.map.addListener("click", (event) => {
        if (game.userMarker.gmpDraggable)
            game.userMarker.position = event.latLng;
    });

    game.streetView = new google.maps.StreetViewPanorama(
        document.getElementById("street-view"),
        {
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            showRoadLabels: false,
            addressControl: false,
        }
    );

    attachUIEvents();
    updateStreetView();
}

function attachUIEvents() {
    document.getElementById("guess").addEventListener("click", resultGame);
    document.getElementById("next").addEventListener("click", resetGame);
}

// Игровая логика

function updateStreetView() {
    const coords = getRandomCoords();
    const svService = new google.maps.StreetViewService();
    showGameUI('search');

    svService.getPanorama({ location: coords, radius: 5000 }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
            game.ansLoc = data.location.latLng;
            game.streetView.setPosition(game.ansLoc);
            showGameUI('guess');
            console.log('нашлась панорама')
        } else {
            console.log("нет панорамы");
            updateStreetView();
        }
    });
}

function resultGame() {
    game.ansMarker = new google.maps.marker.AdvancedMarkerElement({
        map: game.map,
        position: game.ansLoc,
        gmpDraggable: false,
        content: game.ansPin.element,
        title: "This is answer lol",
    });

    drawLine(game.ansLoc, game.userMarker.position)
    //game.map.setZoom(4);
    game.map.setCenter(game.ansLoc);
    game.userMarker.gmpDraggable = false;

    let distance = google.maps.geometry.spherical.computeDistanceBetween(game.ansLoc, game.userMarker.position);
    if (distance < 1000) distance = distance + ' m';
    else if (distance < 10000) distance = (distance / 1000).toFixed(2) + ' km';
    else distance = (distance / 1000).toFixed(0) + ' km'
    document.getElementById("distanceDisplay").textContent = distance;

    showGameUI('next');
}

function resetGame() {
    document.getElementById("distanceDisplay").textContent = " ";
    game.userMarker.gmpDraggable = true;
    if (game.ansMarker) {
        game.ansMarker.map = null;
        game.ansMarker = null;
    }
    if (game.line) {
        game.line.setMap(null);
        game.line = null;
    }
    game.userMarker.position = { lat: 0, lng: 0 };
    game.map.setCenter(game.userMarker.position);
    game.map.setZoom(2);

    updateStreetView();
}

// UI и вспомогательные функции

function showGameUI(stage) {
    switch (stage) {
        case 'search':
            document.getElementById('next').classList.add('hidden');
            document.getElementById('maps').classList.add('blur');
            document.getElementById("guess").classList.remove('hidden');
            document.getElementById("guess").disabled = true;
            document.getElementById('street-view').querySelectorAll('table').forEach((t) => console.log(t.parentElement.classList.add('hidden')));
            document.getElementById('map').querySelectorAll('table').forEach((t) => console.log(t.parentElement.classList.add('hidden')));
            document.getElementById('search').classList.remove('hidden');
            break;
        case 'guess':
            document.getElementById('maps').classList.remove('blur');
            document.getElementById('maps').classList.remove('hidden');

            document.getElementById("guess").disabled = false;
            document.getElementById('search').classList.add('hidden');
            break;
        case 'next':
            document.getElementById('next').classList.remove('hidden');
            document.getElementById("guess").classList.add('hidden');
            break;
    }
}

function getRandomCoords() {
    const lat = -90 + Math.random() * 180;
    const lng = -180 + Math.random() * 360;
    return { lat, lng };
}

function drawLine(a, b) {
    game.line = new google.maps.Polyline({
        path: [a, b],
        strokeOpacity: 0,
        strokeColor: "#fff",
        icons: [{
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 1.5, fillOpacity: 0.5, strokeOpacity: 1 },
            offset: "0",
            repeat: "15px",
        }],
        map: game.map,
    });
}

initMap();