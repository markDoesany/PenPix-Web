class TaskManagement{
  constructor() {
    this._title = '';
    this._description = '';
    this._dateCreated = '';
    this._dateDue = '';
    this._files = '';
    this._progress = '';
  }
  setTasks(title, description, dateCreated, dateDue, files){
    this._title = title;
    this._description = description;
    this._dateCreated = dateCreated;
    this._dateDue = dateDue;
    this._files = files;
  }
  getTitle(){
    return this._title;
  }
  getDescription(){
    return this._description;
  }
  getDateCreated(){
    return this._dateCreated;
  }
  getDateDue(){
    return this._dateDue;
  }
  getFiles(){
    return this._files;
  }
  getProgress(){
    return this._progress;
  }
  setTitle(newTitle){
    this._title = newTitle;
  }
  setDescription(newDescription){
    this._description = newDescription;
  }
  setDateDue(newDue){
    this._dateDue = newDue;
  }
  addFiles(newFile){
    this._files.push(newFile);
  }
  removeFiles(delFile){
    this._files.splice(delFile, 1);
  }
  updateProgress(newProgress){
    this._progress = newProgress;
  }
  isDue(){
    const currentDate = new Date();
    if(currentDate > this._dateDue) return true;
    else return false
  }
  getStringDate(){
    const due_dateTemplate = new Date(this._dateDue); //Get the input due date
    const option = {year: 'numeric', month: 'long', day: 'numeric'}; //format option 

    let due_formattedDate = '';

    if(!isNaN(due_dateTemplate))return due_dateTemplate.toLocaleDateString(undefined, option); 
    else return due_formattedDate;
  }
}