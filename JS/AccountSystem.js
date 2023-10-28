class AccountSystem{
  constructor(){
    this._firstname = null;
    this._lastname = null;
    this._email = null;
    this._username = null;
    this._password = null;
    this._profession = null;
    this._ID = null;
    this._taskManagement = [];
  }
  getPersonalInfo(){
    return {
      firstname: this._firstname,
      lastname: this._lastname,
      email: this._email,
      username: this._username,
      profession: this._profession
    }
  }
  signUp(firstname, lastname, email, username, password){
    this._firstname = firstname;
    this._lastname = lastname;
    this._email = email;
    this._username = username;
    this._password = password;

  }
  getEmail(){
    return this._email;
  }
  getTasks(){
    return this._taskManagement;
  }
  getNotification(){
    return this._notification;
  }
  addTask(newTask){
    this._taskManagement.push(newTask);
  }
  deleteTask(delTask){
    this._taskManagement.splice(delTask, 1);
  }
  editRole(newDegree){
    this._profession = newDegree;
  }
  editFirstname(newFirstname){
    this._firstname = newFirstname;
  }
  editLastname(newLastname){
    this._lastname = newLastname;
  }
  changePassword(newPassword){
    this._password = newPassword;
  }
}