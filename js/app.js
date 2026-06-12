const API = "http://127.0.0.1:5001";

let map;
let myLocation = null;
let routeLine = null;
let userMarker = null;

let currentRoute = null;


// =========================
// LOAD GOOGLE MAPS
// =========================

loadGoogleMaps();

async function loadGoogleMaps() {

    try {

        const res =
            await fetch(
                API + "/config"
            );

        const config =
            await res.json();

        const script =
            document.createElement(
                "script"
            );

        script.src =
            `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=geometry,places&callback=initMap`;

        script.async = true;
        script.defer = true;

        document.head.appendChild(
            script
        );

    } catch (err) {

        console.error(err);

        document.getElementById(
            "panel"
        ).innerHTML =
            "Cannot load Google Maps";
    }
}


// =========================
// INIT MAP
// =========================

window.initMap = function () {

    map = new google.maps.Map(
        document.getElementById("map"),
        {
            center: {
                lat: 13.7367,
                lng: 100.5231
            },
            zoom: 13
        }
    );

    renderFavorites();
    renderRoutes();

    loadSharedRoute();

    document.getElementById(
        "panel"
    ).innerHTML =
        "Ready";
};


// =========================
// MY LOCATION
// =========================

function useMyLocation() {

    navigator.geolocation
        .getCurrentPosition(

        (pos) => {

            myLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };

            document.getElementById(
                "origin"
            ).value =
                "My Location";

            if (userMarker) {
                userMarker.setMap(null);
            }

            userMarker =
                new google.maps.Marker({
                    position: myLocation,
                    map: map,
                    title: "You"
                });

            map.setCenter(
                myLocation
            );

            map.setZoom(15);

        },

        () => {

            alert(
                "Cannot get location"
            );
        }
    );
}


// =========================
// GET ROUTE
// =========================

async function getRoute() {

    try {

        const originInput =
            document.getElementById(
                "origin"
            ).value;

        const destination =
            document.getElementById(
                "destination"
            ).value;

        if (!destination) {

            alert(
                "Please enter destination"
            );

            return;
        }

        const origin =
            originInput === "My Location"
            ? myLocation
            : originInput;

        const res =
            await fetch(
                API + "/route",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        origin,
                        destination
                    })
                }
            );

        const data =
            await res.json();

        if (!data.routes) {

            document.getElementById(
                "panel"
            ).innerHTML =
                "Route not found";

            return;
        }

        const route =
            data.routes[0];

        const encoded =
            route.polyline
                .encodedPolyline;

        const path =
            google.maps.geometry
                .encoding
                .decodePath(
                    encoded
                );

        if (routeLine) {
            routeLine.setMap(null);
        }

        routeLine =
            new google.maps.Polyline({

                path,

                strokeColor:
                    "#ff0000",

                strokeWeight: 5
            });

        routeLine.setMap(map);

        const bounds =
            new google.maps
                .LatLngBounds();

        path.forEach(
            p => bounds.extend(p)
        );

        map.fitBounds(bounds);

        const km =
            (
                route.distanceMeters
                / 1000
            ).toFixed(2);

        const eta =
            Math.round(
                parseInt(
                    route.duration
                ) / 60
            );

        document.getElementById(
            "panel"
        ).innerHTML =
            `Distance: ${km} km | ETA: ${eta} min`;

        currentRoute = {

            id: Date.now(),

            origin,

            destination,

            distance: km,

            eta,

            polyline: encoded,

            createdAt:
                new Date()
                .toISOString()
        };

        cacheRoute(
            currentRoute
        );

    } catch (err) {

        console.error(err);

        document.getElementById(
            "panel"
        ).innerHTML =
            "Route Error";
    }
}


// =========================
// SAVE ROUTE
// =========================

function saveCurrentRoute() {

    if (!currentRoute) {

        alert(
            "No route selected"
        );

        return;
    }

    addSavedRoute(
        currentRoute
    );

    renderRoutes();

    alert(
        "Route saved"
    );
}


// =========================
// LOAD SAVED ROUTE
// =========================

function loadSavedRoute(index) {

    const routes =
        getSavedRoutes();

    const route =
        routes[index];

    document.getElementById(
        "destination"
    ).value =
        route.destination;

    document.getElementById(
        "panel"
    ).innerHTML =
        `Saved Route
         (${route.distance} km)`;
}


// =========================
// FAVORITES
// =========================

function saveFavorite() {

    const name =
        document.getElementById(
            "favoriteName"
        ).value;

    const destination =
        document.getElementById(
            "destination"
        ).value;

    if (!name ||
        !destination) {

        alert(
            "Missing information"
        );

        return;
    }

    addFavorite({
        name,
        destination
    });

    renderFavorites();

    document.getElementById(
        "favoriteName"
    ).value = "";
}


// =========================
// SHARE ROUTE
// =========================

function shareRoute() {

    const destination =
        document.getElementById(
            "destination"
        ).value;

    if (!destination) {

        alert(
            "No destination"
        );

        return;
    }

    const url =
        location.origin +
        location.pathname +
        "?dest=" +
        encodeURIComponent(
            destination
        );

    navigator.clipboard
        .writeText(url);

    alert(
        "Link copied"
    );
}


// =========================
// LOAD SHARE URL
// =========================

function loadSharedRoute() {

    const params =
        new URLSearchParams(
            location.search
        );

    const dest =
        params.get("dest");

    if (!dest) return;

    document.getElementById(
        "destination"
    ).value = dest;
}


// =========================
// OPEN GOOGLE MAPS
// =========================

function openGoogleMaps() {

    const destination =
        document.getElementById(
            "destination"
        ).value;

    if (!destination) {

        alert(
            "No destination"
        );

        return;
    }

    const url =
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

    window.open(
        url,
        "_blank"
    );
}


// =========================
// NEARBY SEARCH
// =========================

function searchNearby(type) {

    if (!myLocation) {

        alert(
            "Please select My Location first"
        );

        return;
    }

    const service =
        new google.maps.places
            .PlacesService(
                map
            );

    service.nearbySearch(

        {
            location:
                myLocation,

            radius: 3000,

            type
        },

        (
            results,
            status
        ) => {

            if (
                status !==
                google.maps.places
                .PlacesServiceStatus.OK
            ) {
                return;
            }

            const list =
                document.getElementById(
                    "nearbyList"
                );

            list.innerHTML = "";

            results.forEach(
                place => {

                const li =
                    document
                    .createElement(
                        "li"
                    );

                li.textContent =
                    place.name;

                li.onclick =
                    () => {

                    document
                    .getElementById(
                        "destination"
                    ).value =
                        place.name;
                };

                list.appendChild(
                    li
                );
            });
        }
    );
}