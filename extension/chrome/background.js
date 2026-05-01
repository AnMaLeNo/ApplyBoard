const API_BASE_URL = "http://100.84.166.112:8042/api/offers";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Traitement de la requête de vérification (GET)
  if (message.action === "CHECK_OFFER_STATUS") {
    const targetUrl = `${API_BASE_URL}/${message.data.id}`;

    fetch(targetUrl, { method: "GET" })
      .then(response => {
        if (response.status === 200) {
          sendResponse({ exists: true, status: response.status });
        } else if (response.status === 404) {
          sendResponse({ exists: false, status: response.status });
        } else {
          sendResponse({ exists: false, error: true, status: response.status });
        }
      })
      .catch(error => {
        sendResponse({ exists: false, error: error.toString() });
      });

    // Maintien explicite du canal de communication ouvert pour la réponse asynchrone
    return true;
  }

  // Traitement de la requête d'ingestion (POST)
  if (message.action === "EXECUTE_OFFER_POST") {
    fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.data)
    })
      .then(response => {
        if (response.ok) {
          sendResponse({ success: true, status: response.status });
        } else {
          sendResponse({ success: false, status: response.status });
        }
      })
      .catch(error => {
        sendResponse({ success: false, error: error.toString() });
      });

    return true;
  }
});