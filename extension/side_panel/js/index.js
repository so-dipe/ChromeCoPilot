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
            const chatId = await getChatId();
            console.log(chatId)
            if (!chatId) {
                navigateToPage('profile.html');
            } else {
                navigateToPage('chat.html');
            }
        }
    } catch (error) {
        console.error('Error handling side panel content:', error);
    }
}

window.addEventListener('load', handleSidePanelContent);

