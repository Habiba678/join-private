/** Storage key and Firebase endpoint for contact data. */
const STORAGE_KEY = "join_contacts_v1";
const dbTask = "https://join-projekt-ca51d-default-rtdb.europe-west1.firebasedatabase.app/";
const firebaseApiKey = "AIzaSyBBW5Nar3SGKaTT_lpRmShPd1N9Dmx3jrw";
const firebaseSessionKey = "join_firebase_anonymous_session";

let firebaseSession = null;
let firebaseSignInPromise = null;

/** Signs in anonymously to Firebase and returns a valid ID token. */
async function getFirebaseToken() {
  if (firebaseSession && Date.now() < firebaseSession.expiresAt - 60000)
    return firebaseSession.idToken;
  if (firebaseSignInPromise) return firebaseSignInPromise;

  firebaseSignInPromise = (async function () {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(firebaseSessionKey) || "null");
    } catch {}

    let result;
    if (saved?.refreshToken) {
      try {
        const response = await fetch(
          "https://securetoken.googleapis.com/v1/token?key=" + firebaseApiKey,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: saved.refreshToken
            })
          }
        );
        if (!response.ok) throw new Error("Token refresh: " + response.status);
        const data = await response.json();
        result = {
          idToken: data.id_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000
        };
      } catch (error) {
        console.warn("Firebase session refresh failed.", error);
      }
    }

    if (!result) {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + firebaseApiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnSecureToken: true })
        }
      );
      if (!response.ok) throw new Error("Firebase sign-in: " + response.status);
      const data = await response.json();
      result = {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + Number(data.expiresIn || 3600) * 1000
      };
    }

    firebaseSession = result;
    try {
      localStorage.setItem(firebaseSessionKey, JSON.stringify(result));
    } catch {}
    return result.idToken;
  })();

  try {
    return await firebaseSignInPromise;
  } finally {
    firebaseSignInPromise = null;
  }
}

/** Sends an authenticated request to Firebase. */
async function firebaseContactsRequest(method, body) {
  const token = await getFirebaseToken();
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const response = await fetch(
    dbTask + "contacts.json?auth=" + encodeURIComponent(token),
    options
  );
  if (!response.ok)
    throw new Error("Firebase " + method + ": " + response.status);
  return response.json();
}

/** Loads contacts from Firebase. */
async function loadContacts() {
  try {
    const data = await firebaseContactsRequest("GET");
    if (!data) contacts = [];
    else if (Array.isArray(data)) contacts = data.filter(Boolean);
    else contacts = Object.entries(data).map(([k, v]) => ({
      ...(v || {}), id: v?.id || k
    }));
    ensureUniqueColors();
    return true;
  } catch (error) {
    console.error("Error loading contacts:", error);
    alert("Contacts could not be loaded. Please check Firebase.");
    return false;
  }
}

/** Saves contacts to Firebase. */
async function saveContacts(list = contacts) {
  const map = {};
  for (let c of list) {
    if (!c.id) c.id = generateId();
    map[c.id] = c;
  }
  await firebaseContactsRequest("PUT", map);
  return true;
}

/** Displays a Firebase error without deleting existing contacts. */
function showFirebaseError(action, error) {
  console.error("Firebase contacts " + action + " failed:", error);
  alert("Firebase-Fehler: Kontakte konnten nicht " + action +
    " werden. Bitte prüfe deine Internetverbindung und die Firebase-Datenbankregeln.");
}