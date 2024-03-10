
const googleLoginButton = document.getElementById('google-login');

async function isLoggedIn() {
    const loggedInStatus = await getLoggedInStatus();
    return loggedInStatus === true;
}

googleLoginButton.addEventListener('click', async () => {
    await handleGoogleLogin();
});

async function handleSidePanelContent() {
    try {
        if (await isLoggedIn()) {
            const chatId = await getCurrentChatIdFromStorage();
            if (!chatId) {
                openProfile();
            } else {
                openChat(chatId);
            }
        } else {
            // If not logged in, show the login screen
            // You can implement this part based on your UI design
        }
    } catch (error) {
        console.error('Error handling side panel content:', error);
    }
}

window.addEventListener('load', handleSidePanelContent);