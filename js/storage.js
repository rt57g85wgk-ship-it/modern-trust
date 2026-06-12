// =========================
// FAVORITES
// =========================

const FAVORITES_KEY = "favorites";

function getFavorites() {

    const data =
        localStorage.getItem(
            FAVORITES_KEY
        );

    return data
        ? JSON.parse(data)
        : [];
}

function addFavorite(favorite) {

    const favorites =
        getFavorites();

    favorites.push(favorite);

    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );
}

function deleteFavorite(index) {

    const favorites =
        getFavorites();

    favorites.splice(index, 1);

    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );

    renderFavorites();
}


// =========================
// ROUTES
// =========================

const ROUTES_KEY = "savedRoutes";

function getSavedRoutes() {

    const data =
        localStorage.getItem(
            ROUTES_KEY
        );

    return data
        ? JSON.parse(data)
        : [];
}

function addSavedRoute(route) {

    const routes =
        getSavedRoutes();

    routes.unshift(route);

    localStorage.setItem(
        ROUTES_KEY,
        JSON.stringify(routes)
    );
}

function deleteSavedRoute(index) {

    const routes =
        getSavedRoutes();

    routes.splice(index, 1);

    localStorage.setItem(
        ROUTES_KEY,
        JSON.stringify(routes)
    );

    renderRoutes();
}


// =========================
// RENDER FAVORITES
// =========================

function renderFavorites() {

    const list =
        document.getElementById(
            "favoriteList"
        );

    if (!list) return;

    list.innerHTML = "";

    const favorites =
        getFavorites();

    favorites.forEach(
        (fav, index) => {

            const li =
                document.createElement(
                    "li"
                );

            li.className =
                "route-item";

            li.innerHTML = `
                <span>
                    ⭐ ${fav.name}
                </span>

                <div>

                    <button
                        class="small-btn"
                        onclick="
                            document.getElementById('destination').value='${fav.destination}'
                        ">
                        Use
                    </button>

                    <button
                        class="small-btn"
                        onclick="
                            deleteFavorite(${index})
                        ">
                        Delete
                    </button>

                </div>
            `;

            list.appendChild(li);
        }
    );
}


// =========================
// RENDER ROUTES
// =========================

function renderRoutes() {

    const list =
        document.getElementById(
            "routeList"
        );

    if (!list) return;

    list.innerHTML = "";

    const routes =
        getSavedRoutes();

    routes.forEach(
        (route, index) => {

            const li =
                document.createElement(
                    "li"
                );

            li.className =
                "route-item";

            li.innerHTML = `
                <span>
                    ${route.destination}
                    (${route.distance} km)
                </span>

                <div>

                    <button
                        class="small-btn"
                        onclick="
                            loadSavedRoute(${index})
                        ">
                        Load
                    </button>

                    <button
                        class="small-btn"
                        onclick="
                            deleteSavedRoute(${index})
                        ">
                        Delete
                    </button>

                </div>
            `;

            list.appendChild(li);
        }
    );
}