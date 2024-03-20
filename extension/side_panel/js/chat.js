console.log('Script loaded');

profileButton = document.getElementById('profile');
newChatButton = document.getElementById('new-chat');
menuIcon = document.getElementById('menu-icon');
navOverlay = document.getElementById('nav-overlay');
input = document.getElementById('input');
submitButton = document.getElementById('submit');
messagesContainer = document.getElementById('messages-container');

profileButton.addEventListener('click', () => navigateToPage('profile.html'));
newChatButton.addEventListener('click', async () => {
    setChatId(null).then(() =>
        openChat()
    );
});
menuIcon.addEventListener('click', toggleMenu);
submitButton.addEventListener('click', handleSubmitButtonClick);
input.addEventListener('keydown', handleKeyPress)
input.addEventListener('input', handleSubmitButton);

input.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = (event.originalEvent || event).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
});

window.addEventListener('load', () => {
    setProfileBackgroundImage();
    getChatId().then(chatId => {
        console.log(chatId)
        if (chatId) {
            fetchAndRenderConversation(chatId);
        }
    })
});