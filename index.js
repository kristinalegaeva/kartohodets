let map, userMarker, ansMarker, streetView;
const mapsCover = document.getElementById('maps');
const search = document.getElementById('search');
const guessButton = document.getElementById('guess');
const nextButton = document.getElementById('next');

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

    userMarker = new AdvancedMarkerElement({
        map,
        position: { lat: 0, lng: 0 },
        gmpDraggable: true,
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
        map.setZoom(3);
        map.setCenter(ansLoc);
        userMarker.gmpDraggable = false;

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
    const radius = 500; // метров

    svService.getPanorama({ location: coords, radius }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
            ansLoc = data.location.latLng;
            streetView.setPosition(ansLoc);
            mapsCover.classList.remove('hidden');
            search.classList.add('hidden');
            document.getElementById('map').querySelectorAll('table').forEach((t) => console.log(t.parentElement.classList.add('hidden')));
            document.getElementById('street-view').querySelectorAll('table').forEach((t) => console.log(t.parentElement.classList.add('hidden')));



        } else {
            mapsCover.classList.add('hidden');
            search.classList.remove('hidden');
            console.log("нет панорамы");
            updateStreetView(); // рекурсия
        }
    });
}
nextButton.addEventListener('click', (event) => {
    guessButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    initMap()

})

initMap();
