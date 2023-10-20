//returns false if email address is invalid
function isEmailFormatValid(email){
  const emailRegex = /^[A-Za-z0-9._%+-]+@usc\.edu\.ph$/;

   if (!emailRegex.test(email)) {
    const message = ' Invalid USC email address';
    displayError(message, document.getElementById('email-error-display'));
    return false;
  }else return true;
}

//returns true if email already exist
function isEmailExist(email){
  const users = getUsersFromLocalStorage();

  if(users.some(user => user._email === email)){
    const message = ' Email is already registered';
    displayError(message, document.getElementById('email-error-display'));
    return true;
  }else false;
}

//returns true if the username already exist
function isUsernameExist(username){
  const users = getUsersFromLocalStorage();

  if(users.some(user => user._username === username)){
    const message = ' Username is already used';
    displayError(message, document.getElementById('username-error-display'));
    return true;
  }else return false;
}

//returns false if password length is below 8 characters
function isPasswordLengthValid(password){
  if(password.length < 8){
    const message = ' Must at least 8 characters long';
    displayError(message, document.getElementById('password-error-display'));
    return false;
  }else return true;
}

//returns false if password requirements is not satisfied
function isPasswordRequirementSatisfied(password){
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if(!password.match(passwordRegex)){
    const message = ' Must have uppercase, lowercase, special characters, and numbers';
    displayError(message, document.getElementById('password-error-display'));
    return false;
  }else return true;
}

//returns false if the password and confirm password does not match
function isPasswordConfirmMatch(password, confirmPassword){
  if(password !== confirmPassword){
    const message = ' Password does not match';
    displayError(message, document.getElementById('confirm-password-error-display'));
    return false;
  }else return true;
} 

//return true if the user and password is in the database
function checkEmailPassword(usernameEmail, password){
  const users = getUsersFromLocalStorage();
  const user = users.find(user => (user._email === usernameEmail || user._username === usernameEmail));

  if(user && user._password === password) return true;
  else {
    const message = ' Password does not match'
    displayError(message, document.getElementById('login-password-error-display'));
    return false;
  }
}

//displays the error message
function displayError(errorMessage, errorContainer){
  errorContainer.textContent = errorMessage;
  errorContainer.style.color = 'red';
  errorContainer.style.fontSize = '.8rem';
}

//get user localstorage
function getUsersFromLocalStorage(){
  try{
    const usersJSON = localStorage.getItem('users');
    if(usersJSON) return JSON.parse(usersJSON) || [];  
    else return [];
  }catch(error){
    console.error('Error occured while retrieving users from local storage', error);
    return [];
  }
}

//store user to a localstorage
function saveUsersToLocalStorage(users){
  try{
    localStorage.setItem('users', JSON.stringify(users));

  }catch(error){
    console.error('Error occured whie saving users to local storage', error);
  }
}

// Function to update local storage
function updateLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}



