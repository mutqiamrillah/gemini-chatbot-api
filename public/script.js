const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
 
// Handles form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();
 
  const userMessage = input.value.trim();
  if (!userMessage) return;
 
  // Display user's message and clear input
  appendMessage('user', userMessage);
  input.value = '';
 
  // Show a temporary "thinking" message from the bot
  const thinkingMessageElement = appendMessage('bot', 'Gemini is thinking...');
 
  try {
    // Send user message to the backend API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
 
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
 
    const data = await response.json();
 
    // Update the "thinking" message with the actual response or an error
    if (data && data.result) {
      // For better readability, convert simple markdown to HTML.
      // 1. Escape potential HTML characters in the response to prevent XSS.
      const escapedText = data.result
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      
      // 2. Convert markdown-like syntax (**bold**, newlines) to HTML tags.
      const formattedHtml = escapedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br>'); // Newlines

      thinkingMessageElement.innerHTML = formattedHtml;
    } else {
      thinkingMessageElement.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Error fetching chat response:', error);
    thinkingMessageElement.textContent = 'Failed to get response from server.';
  }
});
 
/**
 * Appends a new message to the chat box.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The content of the message.
 * @returns {HTMLElement} The newly created message element.
 */
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  // Scroll to the bottom of the chat box to see the new message
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
