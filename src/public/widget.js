(function () {
  const scriptTag = document.currentScript || document.querySelector('script[data-bot-id]');
  if (!scriptTag) return;

  const botId = scriptTag.getAttribute('data-bot-id');
  if (!botId) return;

  const currentScriptUrl = new URL(scriptTag.src);
  const origin = currentScriptUrl.origin;

  // სტილების და ძირითადი HTML-ის შექმნა
  const container = document.createElement('div');
  container.id = 'yourbot-widget-container';
  container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 999999; font-family: system-ui, sans-serif;';

  container.innerHTML = `
    <div id="yb-chat-window" style="display: none; width: 380px; height: 520px; background: #0d0c14; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); flex-direction: column; overflow: hidden; margin-bottom: 16px; backdrop-filter: blur(16px);">
      <div style="padding: 16px 20px; background: linear-gradient(135deg, #7c3aed, #c026d3); color: white; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          🤖 AI Assistant
        </span>
        <button id="yb-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; opacity: 0.8; padding: 4px;">✕</button>
      </div>
      <div id="yb-messages" style="flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
        <div style="align-self: flex-start; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); padding: 10px 14px; border-radius: 16px; border-bottom-left-radius: 4px; max-width: 85%; line-height: 1.4;">
          გამარჯობა! რით შემიძლია დაგეხმაროთ?
        </div>
      </div>
      <form id="yb-form" style="padding: 12px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 8px;">
        <input id="yb-input" type="text" placeholder="დაწერეთ შეტყობინება..." style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 14px; color: white; font-size: 13px; outline: none;" />
        <button type="submit" style="background: linear-gradient(135deg, #7c3aed, #c026d3); border: none; color: white; padding: 0 16px; border-radius: 12px; font-weight: 600; font-size: 13px; cursor: pointer;">გაგზავნა</button>
      </form>
    </div>
    <button id="yb-toggle-btn" style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #c026d3); border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 10px 25px rgba(124,58,237,0.5); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
      💬
    </button>
  `;

  document.body.appendChild(container);

  const chatWindow = document.getElementById('yb-window') || document.getElementById('yb-chat-window');
  const toggleBtn = document.getElementById('yb-toggle-btn');
  const closeBtn = document.getElementById('yb-close-btn');
  const form = document.getElementById('yb-form');
  const input = document.getElementById('yb-input');
  const messagesContainer = document.getElementById('yb-messages');

  let isOpen = false;
  let history = [{ role: 'assistant', content: 'გამარჯობა! რით შემიძლია დაგეხმაროთ?' }];

  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    toggleBtn.innerHTML = isOpen ? '✕' : '💬';
  }

  toggleBtn.onclick = toggleChat;
  closeBtn.onclick = toggleChat;

  form.onsubmit = async function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    history.push({ role: 'user', content: text });

    // მომხმარებლის მესიჯის გამოჩენა
    messagesContainer.innerHTML += `
      <div style="align-self: flex-end; background: linear-gradient(135deg, #7c3aed, #c026d3); color: white; padding: 10px 14px; border-radius: 16px; border-bottom-right-radius: 4px; max-width: 85%; line-height: 1.4;">
        ${escapeHtml(text)}
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Loading ინდიკატორი
    const loadingId = 'yb-loading-' + Date.now();
    messagesContainer.innerHTML += `
      <div id="${loadingId}" style="align-self: flex-start; color: rgba(255,255,255,0.4); font-size: 12px; padding: 4px 8px;">
        იწერება პასუხი...
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const res = await fetch(`${origin}/api/relay/${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history })
      });
      const data = await res.json();

      document.getElementById(loadingId)?.remove();

      const reply = data.reply || 'ბოდიში, პასუხი ვერ მოხერხდა.';
      history.push({ role: 'assistant', content: reply });

      messagesContainer.innerHTML += `
        <div style="align-self: flex-start; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); padding: 10px 14px; border-radius: 16px; border-bottom-left-radius: 4px; max-width: 85%; line-height: 1.4;">
          ${escapeHtml(reply)}
        </div>
      `;
    } catch (err) {
      document.getElementById(loadingId)?.remove();
      messagesContainer.innerHTML += `
        <div style="align-self: flex-start; background: rgba(239,68,68,0.2); color: #f87171; padding: 10px 14px; border-radius: 16px; max-width: 85%;">
          სერვერთან კავშირის შეცდომა.
        </div>
      `;
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
  }
})();