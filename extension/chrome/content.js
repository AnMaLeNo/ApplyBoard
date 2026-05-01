// Expression régulière avec un groupe de capture (\d+) pour extraire l'ID
const uriPattern = /^\/en\/offers\/(\d+)$/;

function initIngestionFlow() {
  const match = window.location.pathname.match(uriPattern);
  if (!match) return;

  const offerId = match[1]; // Extraction de l'identifiant issu du groupe de capture
  const targetNode = document.querySelector('h2');

  if (!targetNode) {
    console.warn("Échec de l'injection : Cible DOM <h2> introuvable.");
    return;
  }

  // Interrogation de l'état via IPC
  chrome.runtime.sendMessage(
    { action: "CHECK_OFFER_STATUS", data: { id: offerId } },
    (response) => {
      if (response.error) {
        console.error("Erreur lors de la vérification d'état réseau :", response.error);
        return;
      }
      
      // Exécution conditionnelle de l'injection basée sur la réponse du serveur
      injectButton(targetNode, response.exists);
    }
  );
}

function injectButton(targetNode, doesExist) {
  const ingestionButton = document.createElement('button');
  ingestionButton.id = "ingestion-btn-42";
  
  if (doesExist) {
    // État : Entrée existante (Désactivé)
    ingestionButton.textContent = "Offre déjà suivie";
    ingestionButton.disabled = true;
    Object.assign(ingestionButton.style, {
      marginLeft: "15px", padding: "5px 10px", backgroundColor: "#cccccc",
      color: "#666666", border: "1px solid #999999", borderRadius: "4px",
      cursor: "not-allowed", fontSize: "14px"
    });
  } else {
    // État : Nouvelle entrée (Actif)
    ingestionButton.textContent = "Ajouter à mon suivi";
    Object.assign(ingestionButton.style, {
      marginLeft: "15px", padding: "5px 10px", backgroundColor: "#00babc",
      color: "#ffffff", border: "none", borderRadius: "4px",
      cursor: "pointer", fontSize: "14px"
    });

    // Écouteur pour la transaction d'écriture
    ingestionButton.addEventListener('click', () => {
      // Verrouillage optimiste de l'interface
      ingestionButton.disabled = true;
      ingestionButton.textContent = "Traitement...";

      chrome.runtime.sendMessage(
        { action: "EXECUTE_OFFER_POST", data: { url: window.location.href } },
        (res) => {
          if (res && res.success) {
            // Mutation post-transaction réussie
            ingestionButton.textContent = "Transmis !";
            Object.assign(ingestionButton.style, { 
              backgroundColor: "#cccccc", color: "#666666", 
              border: "1px solid #999999", cursor: "not-allowed" 
            });
          } else {
            // Rétractation en cas d'échec de la transaction réseau
            console.error("Échec de l'insertion :", res);
            ingestionButton.textContent = "Erreur - Réessayer";
            ingestionButton.disabled = false;
          }
        }
      );
    });
  }

  targetNode.insertAdjacentElement('afterend', ingestionButton);
}

// Initialisation au chargement du document
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIngestionFlow);
} else {
  initIngestionFlow();
}