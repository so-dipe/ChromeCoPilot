getUserDataFromStorage()
  .then((userData) => {
    displayUserInfo(userData);
  })
  .catch((error) => {
    console.error(error);
  });

document.getElementById("logout").addEventListener("click", () => {
  logout();
});

document.getElementById("new-chat").addEventListener("click", () => {
  openChat();
});

document.getElementById("closeProfile").addEventListener("click", () => {
  openChat();
});
