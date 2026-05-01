// Définition de l'expression régulière pour validation stricte de l'URI.
// Cible la structure exacte : /en/offers/ suivi d'un ou plusieurs chiffres (ID).
const uriPattern = /^\/en\/offers\/\d+$/;

function injectIngestionButton() {
  // Validation de l'URI courante
  if (!uriPattern.test(window.location.pathname)) {
    return; // Interruption de l'exécution si le pattern ne correspond pas.
  }

  // Sélection du premier nœud <h2> dans l'arbre DOM
  const targetNode = document.querySelector('h2');

  if (!targetNode) {
    console.warn("Échec de l'injection : Aucun élément <h2> trouvé dans le DOM.");
    return;
  }

  // Instanciation de l'élément bouton
  const ingestionButton = document.createElement('button');
  ingestionButton.textContent = "Ajouter à mon suivi";
  ingestionButton.id = "ingestion-btn-42";
  
  // Application de règles de style en ligne pour l'isolation visuelle
  Object.assign(ingestionButton.style, {
    marginLeft: "15px",
    padding: "5px 10px",
    backgroundColor: "#00babc",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px"
  });

  // Définition de l'écouteur d'événement pour la transmission de données
  ingestionButton.addEventListener('click', () => {
    const payload = {
      url: window.location.href
    };

    // Émission d'un message IPC vers le Service Worker
    chrome.runtime.sendMessage({
      action: "EXECUTE_OFFER_POST",
      data: payload
    });
    
    // Feedback visuel optionnel (changement d'état du bouton)
    ingestionButton.textContent = "Transmis !";
    ingestionButton.disabled = true;
  });

  // Injection du nœud dans le DOM de manière adjacente au nœud cible
  targetNode.insertAdjacentElement('afterend', ingestionButton);
}

// Exécution conditionnelle après analyse de l'état de préparation du document
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectIngestionButton);
} else {
  injectIngestionButton();
}