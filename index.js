let map, userMarker, ansMarker, streetView;
const mapsCover = document.getElementById('maps');
const search = document.getElementById('search');
const guessButton = document.getElementById('guess');
const nextButton = document.getElementById('next');

var distanceBetweenGuessAndAns = document.getElementById('distanceBetweenGuessAndAns');

let ansLoc;
async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 1,
        mapId: '4504f8b37365c3d0',
    });

    const guessPin = new google.maps.marker.PinElement({
        background: "#4285F4",
        borderColor: "#ffffff",
        glyphColor: "white" ,
    });

    userMarker = new AdvancedMarkerElement({
        map,
        position: { lat: 0, lng: 0 },
        gmpDraggable: true,
        content: guessPin.element,
        title: "You wanna guess",
    });

    map.addListener("click", (event) => {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', event.latLng);
        userMarker.position = event.latLng;
    });

    streetView = new google.maps.StreetViewPanorama(
        document.getElementById("street-view"),
        {
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            showRoadLabels: false,     // убирает названия улиц
            addressControl: false,     // убирает адрес в левом верхнем углу
        }
    );
    updateStreetView();

    guessButton.addEventListener('click', (event) => {
        ansMarker = new AdvancedMarkerElement({
            map,
            position: ansLoc,
            gmpDraggable: false,
            title: "This is answer lol",
        });
        const linePath = [
            ansLoc,
            userMarker.position,
        ];
        const lineSymbol = {
            path: google.maps.SymbolPath.CIRCLE, // small circle → dots
            scale: 2,
            fillOpacity: 0.5,
            strokeOpacity: 1,
        };
        const lineBetweenGuessAndAns = new google.maps.Polyline({
            path: linePath,
            strokeColor: "#000",
            strokeOpacity: 0,
            strokeWeight: 1,
            icons: [
                {
                    icon: lineSymbol,
                    offset: "0",
                    repeat: "20px", // spacing between dots
                },
            ]
        });
        distanceBetweenGuessAndAns = google.maps.geometry.spherical.computeDistanceBetween (ansLoc, userMarker.position);
        distanceBetweenGuessAndAns = (distanceBetweenGuessAndAns / 1000).toFixed(0); // переводим в километры
        document.getElementById('distanceDisplay').innerHTML = distanceBetweenGuessAndAns;
        lineBetweenGuessAndAns.setMap(map);
        map.setZoom(3);
        map.setCenter(ansLoc);
        userMarker.gmpDraggable = false;
        distanceDisplay.classList.remove('hidden');
        nextButton.classList.remove('hidden');
        guessButton.classList.add('hidden');
    })

}

function getRandomCoords(latMin, latMax, lngMin, lngMax) {
    const lat = latMin + Math.random() * (latMax - latMin);
    const lng = lngMin + Math.random() * (lngMax - lngMin);
    return { lat, lng };
}


function updateStreetView() {
    const mosLatMin = -90;
    const mosLatMax = 90;
    const mosLngMin = -180;
    const mosLngMax = 180;

    const coords = getRandomCoords(mosLatMin, mosLatMax, mosLngMin, mosLngMax);

    const svService = new google.maps.StreetViewService();
    const radius = 5000; // метров

    svService.getPanorama({ location: coords, radius }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
            ansLoc = data.location.latLng;
            streetView.setPosition(ansLoc);
            mapsCover.classList.remove('hidden');
            guessButton.disabled = false;
            search.classList.add('hidden');
            document.getElementById('map').querySelectorAll('table').forEach((t) => console.log(t.parentElement.classList.add('hidden')));
            document.getElementById('street-view').querySelectorAll('table').forEach((t) => console.log(t.parentElement.classList.add('hidden')));



        } else {
            mapsCover.classList.add('hidden');
            guessButton.disabled = true;
            search.classList.remove('hidden');
            console.log("нет панорамы");
            updateStreetView(); // рекурсия
        }
    });
}
nextButton.addEventListener('click', (event) => {
    guessButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    distanceDisplay.classList.add('hidden');
    initMap()

})

initMap();
