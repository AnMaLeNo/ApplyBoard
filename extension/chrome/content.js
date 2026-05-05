// Expression régulière avec un groupe de capture (\d+) pour extraire l'ID
const uriPattern = /^\/en\/offers\/(\d+)$/;

const LABEL_TO_FIELD = {
  'company': 'company',
  'short description': 'short_description',
  'full description': 'full_description',
  'salary': 'salary',
  'contract type': 'contract_type',
  'email': 'email',
  "offer's address": 'address',
  'available offer on the website': 'availability',
  'campus': 'campus',
  'expertises': 'expertises',
  "offer's target": 'target'
};

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function scrapeOfferData() {
  const payload = { url: window.location.href };

  const titleEl = document.querySelector('.show-left.company-name h2');
  if (titleEl) {
    const title = normalizeText(titleEl.textContent);
    if (title) payload.title = title;
  }

  document.querySelectorAll('.flex-item').forEach((item) => {
    const left = item.querySelector('.show-left');
    const right = item.querySelector('.show-right');
    if (!left || !right) return;

    const label = normalizeText(left.textContent).toLowerCase();
    const field = LABEL_TO_FIELD[label];
    if (!field) return;

    let value;
    if (field === 'company') {
      const link = right.querySelector('.title a');
      value = link ? normalizeText(link.textContent) : normalizeText(right.textContent);
    } else if (field === 'full_description') {
      value = right.getAttribute('data-markdownable') || normalizeText(right.textContent);
    } else {
      value = normalizeText(right.textContent);
    }

    if (value) payload[field] = value;
  });

  return payload;
}

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
      if (response.status === 401 || response.error === "Unauthorized") {
        console.log("Exécution suspendue : Contexte non authentifié. Attente de la résolution JWT.");
        return; // Terminaison explicite, aucune mutation du DOM effectuée.
      }

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

      const offerPayload = scrapeOfferData();

      chrome.runtime.sendMessage(
        { action: "EXECUTE_OFFER_POST", data: offerPayload },
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

// Enregistrement du gestionnaire d'interception IPC
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validation de l'identifiant canonique de l'action
  if (message.action === "LOGIN_SUCCESS") {
    // Ré-invocation de l'orchestrateur de mutation suite au changement d'état d'authentification
    initIngestionFlow();
  }
});
