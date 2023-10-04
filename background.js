// background.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.text && message.to === "pt") {
    const translatedText = simulateTranslation(message.text);
    sendResponse({ translatedText });
  }
});

function simulateTranslation(text) {
  // Simule uma tradução simples adicionando um prefixo "Traduzido: " ao texto original
  return "Traduzido: " + text;
}
