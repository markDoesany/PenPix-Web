const users = JSON.parse(localStorage.getItem('users'));
const userIndex = JSON.parse(localStorage.getItem('userIndex'));
const taskIndex = JSON.parse(localStorage.getItem('taskIndex'));

const currentUser = users[userIndex];
const currentTask = currentUser._taskManagement[taskIndex];

const fileContainer = document.querySelector('.file-container');
fileContainer.innerHTML = JSON.stringify(currentTask._files[0]);