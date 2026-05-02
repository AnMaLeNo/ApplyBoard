const API_BASE_URL = "http://100.84.166.112:8042/api/offers";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CHECK_OFFER_STATUS") {
    const targetUrl = `${API_BASE_URL}/${message.data.id}`;
    
    // Ajout de credentials: "include" pour transmettre le cookie JWT
    fetch(targetUrl, { 
      method: "GET",
      credentials: "include" 
    })
      .then(response => {
        if (response.status === 200) {
          sendResponse({ exists: true, status: response.status });
        } else if (response.status === 404 || response.status === 204) {
          sendResponse({ exists: false, status: response.status });
        } else if (response.status === 401 || response.status === 403) {
           sendResponse({ exists: false, error: "Unauthorized", status: response.status });
        } else {
          sendResponse({ exists: false, error: true, status: response.status });
        }
      })
      .catch(error => sendResponse({ exists: false, error: error.toString() }));
      
    return true; 
  }

  if (message.action === "EXECUTE_OFFER_POST") {
    // Ajout de credentials: "include"
    fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(message.data)
    })
    .then(response => {
      if (response.ok) {
        sendResponse({ success: true, status: response.status });
      } else {
        sendResponse({ success: false, status: response.status });
      }
    })
    .catch(error => sendResponse({ success: false, error: error.toString() }));

    return true;
  }
});