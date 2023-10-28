//checks if the users logged in as remembered
if(localStorage.getItem('isRemembered') === 'true'){
  window.location.href = '../HTML/dashboard-page.html';
}

//declare a variable for the sign up form
const registerForm = document.getElementById('register-form');
//clears local storage
//localStorage.clear();


//When logo is clicked. It will go back to the landing page
document.querySelector('.logo').addEventListener('click',()=> window.location.href = '../HTML/index.html');

//clear input fields
clearInputField()

//Listen to the sign up form submit attribute. If no errors are detected base on the conditions laid out, the form will be successfully submitted 
registerForm.addEventListener('submit', (event)=>{
  //get local storage
  const users = getUsersFromLocalStorage();
  console.log(users);
  //prevent the form from submitting without undergoing the verfication
  event.preventDefault();

  //declare variables 
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  //accepted email format
  const emailRegex = /^[A-Za-z0-9._%+-]+@usc\.edu\.ph$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  //checks email format
  if (!isEmailFormatValid(email)) return; 
  else clearErrorDisplay();
  
  //verify if email already exist
  if(isEmailExist(email))return;
  else clearErrorDisplay();

  //verify if username already exist
  if(isUsernameExist(username)) return;
  else clearErrorDisplay();

  //checks password length
  if(!isPasswordLengthValid(password)) return;
  else clearErrorDisplay();

  //checks password if passed the requirements
  if(!isPasswordRequirementSatisfied(password)) return;
  else clearErrorDisplay();

  //checks if password & confirmPassword match
  if(!isPasswordConfirmMatch(password, confirmPassword))return;
  else clearErrorDisplay();

  //create an object user
  const user = new AccountSystem();
  //No erros detected. Proceed to sign up
  user.signUp(firstname, lastname, email, username, password);
  //add the new user to the storage
  users.push(user);
  saveUsersToLocalStorage(users);
  //display the successful message register
  displaySuccessfulRegister();
  clearInputField();
})
//clears the error message
function clearErrorDisplay(){
  document.getElementById('email-error-display').textContent = '';
  document.getElementById('username-error-display').textContent = '';
  document.getElementById('password-error-display').textContent = '';
  document.getElementById('confirm-password-error-display').textContent = '';
}

//clears input fields
function clearInputField(){
  document.getElementById('firstname').value = '';
  document.getElementById('lastname').value = '';
  document.getElementById('email').value = '';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('confirm-password').value = '';
}

//display successful message and vanish after 1.5 seconds
function displaySuccessfulRegister(){
  const successBlock = document.querySelector('.successful-notification-block');
  successBlock.style.display = 'flex';
  setTimeout(()=>{
    successBlock.style.display = 'none';
    window.location.href = '../HTML/sign-in-page.html';
  },1500);
}