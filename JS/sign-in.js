//checks if the users logged in as remembered
if(localStorage.getItem('isRemembered') === 'true'){
  window.location.href = '../HTML/dashboard-page.html';
}

const signInForm = document.getElementById('sign-in-form');

//clear the input fields
clearInputField();
//display the address entered by the user in the landing page
document.getElementById('username-or-email').value = JSON.parse(localStorage.getItem('emailAddress'));
localStorage.removeItem('emailAddress'); //remove the item 

//executes when the sign in form is submitted
signInForm.addEventListener('submit', (event)=>{
  //initially prevent the form from submission
  event.preventDefault();
  const usernameOrEmail = document.getElementById('username-or-email').value;
  const password = document.getElementById('login-password').value;
  const rememberMe = document.getElementById('remember-me');

  //verify if the username or email exist in the storage
  if(!isUsernameEmailExist(usernameOrEmail))return;
  clearErrorDisplay();

  //checks if the stored email matches with the entered password
  if(!checkEmailPassword(usernameOrEmail, password)) return;
  clearErrorDisplay();
  
  //verifies if users checks remember me. If true, the user will be redirected to his dashboard.
  localStorage.setItem('isRemembered', rememberMe.checked? 'true':'false');

  //displays the successful login notification 
  displaySuccessfulLogin();
  clearInputField();

  //check and get the user who successfully logged in
  getUserAccount(usernameOrEmail);
})

//return true if the users exist in the database
function isUsernameEmailExist(usernameEmail){
  const users = getUsersFromLocalStorage();

  const exist = users.some(user => user._email === usernameEmail || user._username === usernameEmail
    );

  if(exist) return true;
  else {
    const message = ' The username or email is not yet registered'
    displayError(message, document.getElementById('username-email-error-display'));
    return false;
  }
}

//get the user who successfully logged in
function getUserAccount(usernameEmail){
  const users = getUsersFromLocalStorage();

  const userAccountIndex = users.findIndex(user => user._email === usernameEmail || user._username === usernameEmail) 
  localStorage.setItem('userIndex', JSON.stringify(userAccountIndex));
}

//display successful message and vanish after 1.5 seconds
function displaySuccessfulLogin(){
  const successBlock = document.querySelector('.successful-notification-block');
  successBlock.style.display = 'flex';
  setTimeout(()=>{
    successBlock.style.display = 'none';
    window.location.href = '../HTML/dashboard-page.html';
  },1500);
}

//clears the input fields
function clearInputField(){
  document.getElementById('username-or-email').value = '';
  document.getElementById('login-password').value = '';
}

//clears the error messages
function clearErrorDisplay(){
  document.getElementById('username-email-error-display').textContent = '';
  document.getElementById('login-password-error-display').textContent = '';
}

