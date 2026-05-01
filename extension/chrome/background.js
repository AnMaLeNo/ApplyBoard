const API_ENDPOINT = "http://100.84.166.112:8042/api/offers";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validation de l'identifiant d'action du message
  if (message.action === "EXECUTE_OFFER_POST") {
    
    const payload = message.data;

    fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Code HTTP : ${response.status}`);
      }
      console.log("Transmission réseau réussie pour l'URI :", payload.url);
    })
    .catch(error => {
      console.error("Échec de la transaction réseau :", error);
    });

    // Retourne true pour maintenir le canal de message ouvert de manière asynchrone (optionnel ici, requis si sendResponse est utilisé dans le fetch)
    return true; 
  }
});