// =========================
// DATABASE
// =========================

const DB_NAME = "RoutePlannerDB";
const DB_VERSION = 1;

const STORE_ROUTE_CACHE = "routeCache";

let db = null;


// =========================
// INIT DB
// =========================

function initDB() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

        request.onerror = () => {

            console.error(
                "IndexedDB open failed"
            );

            reject();
        };

        request.onsuccess = (event) => {

            db =
                event.target.result;

            console.log(
                "IndexedDB ready"
            );

            resolve(db);
        };

        request.onupgradeneeded =
            (event) => {

            const database =
                event.target.result;

            if (
                !database.objectStoreNames.contains(
                    STORE_ROUTE_CACHE
                )
            ) {

                database.createObjectStore(
                    STORE_ROUTE_CACHE,
                    {
                        keyPath: "id"
                    }
                );
            }
        };
    });
}


// =========================
// SAVE ROUTE CACHE
// =========================

function cacheRoute(route) {

    if (!db) return;

    const tx =
        db.transaction(
            STORE_ROUTE_CACHE,
            "readwrite"
        );

    const store =
        tx.objectStore(
            STORE_ROUTE_CACHE
        );

    store.put(route);
}


// =========================
// GET ALL CACHE
// =========================

function getCachedRoutes() {

    return new Promise(
        (resolve, reject) => {

        if (!db) {

            resolve([]);

            return;
        }

        const tx =
            db.transaction(
                STORE_ROUTE_CACHE,
                "readonly"
            );

        const store =
            tx.objectStore(
                STORE_ROUTE_CACHE
            );

        const request =
            store.getAll();

        request.onsuccess = () => {

            resolve(
                request.result
            );
        };

        request.onerror = () => {

            reject([]);
        };
    });
}


// =========================
// GET CACHE BY ID
// =========================

function getCachedRoute(id) {

    return new Promise(
        (resolve, reject) => {

        if (!db) {

            resolve(null);

            return;
        }

        const tx =
            db.transaction(
                STORE_ROUTE_CACHE,
                "readonly"
            );

        const store =
            tx.objectStore(
                STORE_ROUTE_CACHE
            );

        const request =
            store.get(id);

        request.onsuccess = () => {

            resolve(
                request.result
            );
        };

        request.onerror = () => {

            reject(null);
        };
    });
}


// =========================
// DELETE CACHE
// =========================

function deleteCachedRoute(id) {

    if (!db) return;

    const tx =
        db.transaction(
            STORE_ROUTE_CACHE,
            "readwrite"
        );

    const store =
        tx.objectStore(
            STORE_ROUTE_CACHE
        );

    store.delete(id);
}


// =========================
// CLEAR CACHE
// =========================

function clearRouteCache() {

    if (!db) return;

    const tx =
        db.transaction(
            STORE_ROUTE_CACHE,
            "readwrite"
        );

    const store =
        tx.objectStore(
            STORE_ROUTE_CACHE
        );

    store.clear();
}


// =========================
// AUTO START
// =========================

initDB();