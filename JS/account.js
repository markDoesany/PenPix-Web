const users = getUsersFromLocalStorage();
const userIndex = JSON.parse(localStorage.getItem('userIndex'))
const greeting = document.querySelector('header h2');

greeting.textContent = `Hi, ${users[userIndex]._username}`;