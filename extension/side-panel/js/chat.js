
// DOM Elements
logoutButton = document.getElementById('logout');
profileButton = document.getElementById('profile');
newChatButton = document.getElementById('new-chat');
menuIcon = document.getElementById('menu-icon');
navOverlay = document.getElementById('nav-overlay');
input = document.getElementById('input');
submitButton = document.getElementById('submit');
messagesContainer = document.getElementById('messages-container');

// Event Listeners
logoutButton.addEventListener('click', logout);
profileButton.addEventListener('click', openProfile);
newChatButton.addEventListener('click', openChat);
menuIcon.addEventListener('click', toggleMenu);
submitButton.addEventListener('click', handleSubmitButtonClick);
input.addEventListener('keydown', handleKeyPress)
input.addEventListener('input', handleSubmitButton);


// Initialize
setProfileBackgroundImage();
// handleSubmitButton();