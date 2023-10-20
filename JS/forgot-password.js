const notYou = document.querySelector('.change-password-container a');
const forgotPasswordContainer = document.querySelector('.forgot-password-container');
const changePasswordContainer = document.querySelector('.change-password-container');
const search = document.getElementById('search');
const cancel = document.getElementById('cancel');

let users = getUsersFromLocalStorage();

cancel.addEventListener('click', ()=> window.location.href = '../HTML/sign-in-page.html');

search.addEventListener('click', ()=>{
  const emailUserame = document.getElementById('email-username').value;
  const emailDisplay = document.querySelector('.email-display');

  if(!isUsernameEmailExist(emailUserame))return;
  else document.getElementById('email-username-error-display').textContent = '';

  emailDisplay.textContent = `${emailUserame}`;

  forgotPasswordContainer.style.display = 'none';
  changePasswordContainer.style.display = 'flex';
})

notYou.addEventListener('click', ()=>{
  forgotPasswordContainer.style.display = 'flex';
  changePasswordContainer.style.display = 'none';
})

function isUsernameEmailExist(usernameEmail){
  if(users.some(user => user._email === usernameEmail || user._username === usernameEmail
  )) return true;
  else {
    const message = ' The username or email is not registered'
    displayError(message, document.getElementById('email-username-error-display'));
    return false;
  }
}
