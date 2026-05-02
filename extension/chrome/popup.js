const API_LOGIN_ENDPOINT = "http://100.84.166.112:8042/api/login";

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const statusDiv = document.getElementById('status');

  statusDiv.textContent = "Authentification en cours...";
  statusDiv.style.color = "black";

  try {
    const response = await fetch(API_LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      statusDiv.textContent = "Authentification réussie.";
      statusDiv.style.color = "green";
      chrome.storage.local.set({ isAuthenticated: true });
  
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          // Transmission du payload IPC ciblé vers le Content Script
          chrome.tabs.sendMessage(tabs[0].id, { action: "LOGIN_SUCCESS" });
        }
      });
    } else {
      statusDiv.textContent = `Erreur : Code HTTP ${response.status}`;
      statusDiv.style.color = "red";
    }
  } catch (error) {
    statusDiv.textContent = "Échec de la transaction réseau.";
    statusDiv.style.color = "red";
    console.error(error);
  }
});