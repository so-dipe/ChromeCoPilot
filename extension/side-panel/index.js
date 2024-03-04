text = document.getElementById('text');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.type === 'explain') {
        text.innerText = message.text;
    } else if (message.type === 'start-session') {
        text.innerText = message.text;
    }
});