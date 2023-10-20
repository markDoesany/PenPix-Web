//checks if the users logged in as remembered
if(localStorage.getItem('isRemembered') === 'true'){
  //direct to the dashboard page 
  window.location.href = '../HTML/dashboard-page.html';
}
//listens to to the quick sign in button
document.querySelector('.quick-to-sign-in-button').addEventListener('click', ()=> {
  const emailAddress = document.getElementById('email-address').value;
  //stores the value in a local storage
  localStorage.setItem('emailAddress', JSON.stringify(emailAddress));
  //direct to the sign in page
  window.location.href = '../HTML/sign-in-page.html'; 
})