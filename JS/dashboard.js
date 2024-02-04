//declare and initialze variables
const taskContainer = document.querySelector('.task-container');
const newAddTask = document.querySelector('.new-add-task');
const createTaskContainer = document.querySelector('.create-new-task-container');
const filesContainer = document.querySelector('.files-container');
const back = document.getElementById('back-button');
const addInputFile = document.getElementById('add-input-file');
const addInputFolder = document.getElementById('add-input-folder');
const save = document.getElementById('save-button');
const userQuickOption = document.querySelector('#user-quick-account');
const logOut = document.getElementById('log-out');

//boolean variable to prevent a new task from opening when another window has been opened already
let newTaskWindowOpen = false;
//globale variable to contain the opened task edit container to prevent simultaneous forms being opened 
let openEditContainer = null;

//Display the user full name in the header
displayUser();
//Get the stored tasks from the logged in user
setTasks();
//Display the stored tasks upon landing the dashboard page
displayTasks();

//Triggered when user clicks the inverted arrow beside the full name
userQuickOption.addEventListener('click',()=>{
  const menuOption = document.querySelector('.user-quick-account-option');
  if(menuOption.style.display === 'flex') menuOption.style.display = "none";
  else menuOption.style.display = "flex";
})

//Triggered when user clicks the logout button
logOut.addEventListener('click', ()=>{
  //clears the item to prevent from direct sign in
  localStorage.setItem('isRemembered', 'false');
})

//Triggered when the new add task is clicked
newAddTask.addEventListener('click', (event)=> {
  //prevent the event from propagating to other event listeners
  event.stopPropagation();

  //checks if a create new task has been opened already. If so, return to prevent the proceeding code to execute
  if(newTaskWindowOpen) return;
  localStorage.removeItem('files');
  newTaskWindowOpen = true;
  createTaskContainer.style.display = 'flex'; //display the create task container
  setBlurBackground();
})


//Activates when the back button in the add task form is selected
back.addEventListener('click', ()=> {
  newTaskWindowOpen = false;
  createTaskContainer.style.display = 'none'; //hide the create task container
  localStorage.removeItem('files');
  filesContainer.textContent = '';
  clearInputField();
  removeBlurBackground();
})

//Saves the user inputs 
save.addEventListener('click', ()=>{
  //get the list of tasks. If none, pass an empty array
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  newTaskWindowOpen = false;
  createTaskContainer.style.display = 'none';
  
  //declare and initialized input fields
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const dueDate = document.getElementById('due-date').value;
  const currentDate = getCurrentDate();
  //get the stored files 
  const files = JSON.parse(localStorage.getItem('files'));
  //create a new task object which will contain the attributes in the TaskMangement class
  const newTask = createTask(title, description, currentDate, dueDate, files);
  //add the new task to the list of tasks
  tasks.push(newTask);
  
  clearFileData();  //clear file-related data
  updateLocalStorage('tasks', tasks); //store the updates tasks to the local storage
  updateStorage()
  clearInputField();
  displayTasks();
  removeBlurBackground();
})
function setBlurBackground(){
  document.querySelector('header').style.filter = "blur(1px)";
  document.querySelector('nav').style.filter = "blur(1px)";
  document.querySelector('.task-container').style.filter = "blur(1px)";
}
function removeBlurBackground(){
  document.querySelector('header').style.filter = "none";
  document.querySelector('nav').style.filter = "none";
  document.querySelector('.task-container').style.filter = "none";
}

// Function to create a new task object
function createTask(title, description, currentDate, dueDate, files) {
  const newTask = new TaskManagement();
  newTask.setTasks(title, description, currentDate, dueDate, files);
  return newTask;
}

// Function to clear file-related data
function clearFileData() {
  localStorage.removeItem('files');
  filesContainer.textContent = '';
}


//activates when user selects the add file icon
addInputFile.addEventListener('click', () => {
  //get the input field ID that was intentionally hidden 
  const fileInput = document.getElementById('add-file');
  //activate the input file type
  fileInput.click();
  
  //detects once user browse and selected a file
  fileInput.addEventListener('change', handleFileSelection);
});

//Handles the processes of getting, storing, and displaying each file the user entered
function handleFileSelection(event){
  //traverse all the input files
  const files = JSON.parse(localStorage.getItem('files')) || [];
  const selectedFiles = Array.from(event.target.files); // Convert File List to an array

  try {
    selectedFiles.forEach((selectedFile) => {
      if (selectedFile) {
        try {
          //represent each file as a binary large object
          const blob = new Blob([selectedFile], { type: selectedFile.type });
          //create an object with the following attributes
          const fileObject = {
            name: selectedFile.name,
            content: URL.createObjectURL(blob),
            status: false,
            fileGrade: 0,
            highScore: 0
          };
          //add the file object to the list of files
          files.push(fileObject);
          updateLocalStorage('files', files); //Update local storage
          displayFile();  //display the added files
        } catch (blobError) {
          console.error('Error creating Blob:', blobError);
        }
      }
    });
  } catch (filesError) {
    console.error('Error processing selected files:', filesError); //displays an error to console if error occurs during the process
  }
  // Remove the 'change' event listener to prevent memory leaks if no longer needed.
  event.target.removeEventListener('change', handleFileSelection);
}

//activates when the user selected the add folder icon
addInputFolder.addEventListener('click', () => {
  const folderInput = document.getElementById('add-folder');
  folderInput.click(); // Trigger the folder input element
  
  //triggers when a folder upload is detected
  folderInput.addEventListener('change', handleZipFile);
});

//Performs the handling of zip file particularly on error handling
async function handleZipFile(event){
  const zipFile = event.target.files[0];

    if (!zipFile) {
      console.log('No file selected.');
      return;
    }

    try {
      const files= await unzipAndFilterFiles(zipFile);
      console.log('Unzipped and filtered files:', files);
      localStorage.setItem('files',JSON.stringify(files));
    } catch (error) {
      console.error('Error unzipping or filtering files:', error);
    }
    //remove the event listener change to prevent unecesarry behavior
    event.target.removeEventListener('change', handleZipFile);
  }
  
//aysnchronous function that faciliates the unzipping of files and blobbing
async function unzipAndFilterFiles(zipFile) {
  const zip = new JSZip();
  
  //returns the extracted files if no error occured during the process
  return new Promise(async (resolve, reject) => {
    try {
      //get the blob content for each file
      const zipFileData = await getBlobFromFile(zipFile);
      const unzipped = await zip.loadAsync(zipFileData);
      
      //get the filtered files after the folder is unzipped
      const filteredFiles = await processUnzippedFiles(unzipped);
      resolve(filteredFiles);
      
    } catch (error) {
      reject(error);
    }
  });
}

async function processUnzippedFiles(unzipped) {
  // Retrieve the existing files or create an empty array
  const filteredFiles = JSON.parse(localStorage.getItem('files')) || [];

  // Iterate through each file in the unzipped archive
  unzipped.forEach(async (relativePath, zipEntry) => {
    if (isValidFileFormat(zipEntry.name)) {
      // If the file has a matching extension, extract and store it.
      const content = await zipEntry.async('blob');
      const fileObject = {
        name: zipEntry.name,
        content: URL.createObjectURL(content),
        status: false,
        fileGrade: 0, 
        highScore: 0
      };
      
      // Add the file object to the array and update the local storage
      filteredFiles.push(fileObject);
      updateLocalStorage('files', filteredFiles)
      
      // Display the file (if applicable)
      displayFile();
    } else {
      console.log('No valid file type is detected');
    }
  });
  
  return filteredFiles;
}

//checks if the image type format is correct
function isValidFileFormat(fileType){
  if(fileType.match(/\.(pdf|png|jpg|jpeg)$/i)) return true;
  else return false
}

function getBlobFromFile(file) {
  return new Promise((resolve, reject) => {
    // Create a new FileReader
    const reader = new FileReader();
    
    // Event handler for when the reading is successful
    reader.onload = (event) => {
      // Resolve the Promise with the result
      resolve(event.target.result);
    };

    // Event handler for any errors during the reading process
    reader.onerror = (error) => {
      // Reject the Promise with the error
      reject(error);
    };

    // Start reading the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}
//Display the tasks created by the users in the dashboard
function displayTasks(){
  //task card
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  //Remove the children of the task container except fot the add new task child
  while (taskContainer.childElementCount > 1) {
    taskContainer.removeChild(taskContainer.firstElementChild);
  }
  //Traverse the array of tasks 
  tasks.forEach((task, index) =>{
    //create a div element to contain the html for each task card
    const taskDisplayTag = document.createElement('div');
    taskDisplayTag.classList.add('task-card'); 
    taskDisplayTag.dataset.index= index; //add a data attribute index for each class created
    taskDisplayTag.innerHTML = `
    <svg class = "meatballs-menu" xmlns="http://www.w3.org/2000/svg" width="5" height="21" viewBox="0 0 5 21" fill="none">
    <circle cx="2.5" cy="2.5" r="2.5" fill="#D9D9D9"/>
    <circle cx="2.5" cy="10.5" r="2.5" fill="#D9D9D9"/>
    <circle cx="2.5" cy="18.5" r="2.5" fill="#D9D9D9"/>
    </svg>
    <div class = "menu-container">
    <li class = "edit">Edit</li>
    <li class = "delete">Delete</li>
    </div>
    <h1>${truncateText(task._title)}</h1>
    <p class = "task-description">${truncateText(task._description)}</p>
    <p class = "date-created">Date created: ${convertDateToStringFormat(task._dateCreated)}</p>
    <p class = "date-due">Date due: ${convertDateToStringFormat(task._dateDue)}</p>
    <p class = "status">Status: ${task._progress}</p>
    
    <div class="edit-new-task-container">
    <svg id="back-edit-button" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 10L3.29289 10.7071L2.58579 10L3.29289 9.29289L4 10ZM21 18C21 18.5523 20.5523 19 20 19C19.4477 19 19 18.5523 19 18L21 18ZM8.29289 15.7071L3.29289 10.7071L4.70711 9.29289L9.70711 14.2929L8.29289 15.7071ZM3.29289 9.29289L8.29289 4.29289L9.70711 5.70711L4.70711 10.7071L3.29289 9.29289ZM4 9L14 9L14 11L4 11L4 9ZM21 16L21 18L19 18L19 16L21 16ZM14 9C17.866 9 21 12.134 21 16L19 16C19 13.2386 16.7614 11 14 11L14 9Z" fill="#33363F"/>
    </svg>
    <h1>Edit Task</h1>
    <div class="edit-task-info-block">
    <div class="edit-title-block">
    <label for="edit-title">Title:</label>
    <input type="text" name="title" id="edit-title" maxlength="20" value = "${task._title}">
    </div>  
    <div class="edit-description-block">
    <label for="edit-description">Description:</label>
            <input type="text" name="description" id="edit-description" value = "${task._description}">
            </div>
            <div class="edit-due-date-block">
            <label for="edit-due-date">Set Due Date:</label>
            <input type="date" name="date" id="edit-due-date" value = "${task._dateDue}">
          </div>
        </div>
        <div class="line"></div>
        <div class="edit-file-block">
          <h2>Recent Files</h2>
          <div class="files-container">
          <p id = 'check-files'>Check Files</p>
          </div>
          <div class="edit-add-file-folder-block">
          <button id="edit-save-button">Save</button>
          </div>
          </div>
          </div>
          `
    taskContainer.prepend(taskDisplayTag); //pre append the html above to the parent class. Each new task will be the first child of the parent class
})

}

// Attach a click event listener to the task container and handle task clicks
taskContainer.addEventListener('click', handleTaskClick);

function handleTaskClick(event) {
  // Parse tasks from local storage
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  
  // Find the clicked elements
  const card = event.target.closest('.task-card');
  const menuContainer = event.target.closest('.menu-container');
  const deleteSelected = event.target.closest('.delete');
  const editSelected = event.target.closest('.edit');
  
  if (card && !menuContainer) {
    // Handle click on a task card
    handleCardClick(card);
  }
  
  if (menuContainer) {
    if (deleteSelected) {
      // Handle delete action
      handleDeleteClick(deleteSelected, tasks);
    } else if (editSelected) {
      // Handle edit action
      handleEditClick(editSelected);
    }
  }
}

function handleCardClick(card) {
  // Extract the task index from the card's dataset
  const index = card.dataset.index;
  
  // Store the task index in local storage
  updateLocalStorage('taskIndex', index);

  // Redirect to the index page
  window.location.href = "../HTML/ai-tool-page.html";
}

function handleDeleteClick(deleteSelected, tasks) {
  // Find the task index associated with the delete button
  const index = deleteSelected.closest('.task-card').dataset.index;
  
  // Remove the task at the specified index from the tasks array
  tasks.splice(index, 1);
  
  // Update local storage with the modified tasks array
  updateLocalStorage('tasks', tasks);
  
  // Update the UI and display the updated tasks
  updateStorage();
  displayTasks();
}

function handleEditClick(editSelected) {
  // Extract the task index associated with the clicked edit button
  const index = editSelected.closest('.task-card').dataset.index;
  
  // Find the edit task container associated with the task
  const editTaskContainer = document.querySelector(`[data-index="${index}"] .edit-new-task-container`);
  
  // Check if another edit container is open and close it if necessary
  if (openEditContainer && openEditContainer !== editTaskContainer) {
    openEditContainer.style.display = 'none';
  }
  
  // Handle the edit task logic (not shown, should be in the editTask function)
  editTask(editSelected);
  
  // Set the current edit container as the open container
  openEditContainer = editTaskContainer;
}

function editTask(editSelected) {
  // Parse tasks from local storage
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  
  // Find the task index associated with the clicked edit button
  const index = editSelected.closest('.task-card').dataset.index;
  
  // Find the edit task container related to the task
  const editTaskContainer = document.querySelector(`[data-index="${index}"] .edit-new-task-container`);

  // Display the edit task container
  editTaskContainer.style.display = 'flex';

  // Find elements within the edit task container
  const backButton = editTaskContainer.querySelector('#back-edit-button');
  const saveButton = editTaskContainer.querySelector('#edit-save-button');
  const checkFiles = editTaskContainer.querySelector('#check-files');
  
  // Attach a click event listener to the edit task container
  editTaskContainer.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent event propagation to parent elements
    
    // Handle click events for the back button
    backButton.addEventListener('click', () => {
      editTaskContainer.style.display = 'none';
    });

    // Handle click events for the save button
    saveButton.addEventListener('click', () => {
      const title = editTaskContainer.querySelector('#edit-title').value;
      const description = editTaskContainer.querySelector(`#edit-description`).value;
      const dueDate = editTaskContainer.querySelector(`#edit-due-date`).value;
      
      // Check if the task at the specified index exists
      if (tasks[index]) {
        // Update task properties
        tasks[index]._title = title;
        tasks[index]._description = description;
        tasks[index]._dateDue = dueDate;
        
        console.log('Updated Task:', tasks[index]);
        
        // Update local storage with the modified tasks
        updateLocalStorage('tasks', tasks);
        updateStorage();
        displayTasks();
        editTaskContainer.style.display = 'none';
      } else {
        console.log('Task not found');
      }
    });
    
    // Handle click events for the "Check Files" action
    checkFiles.addEventListener('click', () => {
      updateLocalStorage('taskIndex', index);
      window.location.href = "../HTML/files-page.html";
    });
    
    // Handle Enter key events for back and save buttons while preventing propagation
    backButton.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        backButton.click();
      }
    });
  
    saveButton.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        saveButton.click();
      }
    });
  });
}

function displayFile(){
  //filesContainer
  filesContainer.textContent= '';
  const files = JSON.parse(localStorage.getItem('files')) || [];
  files.forEach((file,index) =>{
    const fileDisplayTag = document.createElement('div');
    fileDisplayTag.classList.add('file-display-child');
    fileDisplayTag.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.83325 1.83337C3.1764 1.83337 1.83325 3.17652 1.83325 4.83338V17.1667C1.83325 18.8236 3.1764 20.1667 4.83325 20.1667H11.8333V15.5834L11.8332 15.5232V15.5232C11.8332 14.9268 11.8331 14.3831 11.8925 13.9414C11.9578 13.4561 12.1107 12.9471 12.5289 12.529C12.947 12.1109 13.4559 11.9579 13.9413 11.8926C14.383 11.8332 14.9267 11.8333 15.5231 11.8334L15.5833 11.8334H20.1666V4.83337C20.1666 3.17652 18.8234 1.83337 17.1666 1.83337H4.83325ZM19.8576 13.8334H15.5833C14.9068 13.8334 14.5001 13.8355 14.2078 13.8748C14.0733 13.8929 14.004 13.9144 13.9708 13.9281C13.9465 13.9381 13.9433 13.9428 13.9431 13.9432L13.9431 13.9432L13.9431 13.9432C13.9427 13.9435 13.938 13.9466 13.9279 13.9709C13.9143 14.0041 13.8927 14.0735 13.8747 14.2079C13.8354 14.5002 13.8333 14.9069 13.8333 15.5834V19.8578C14.1251 19.714 14.3942 19.5224 14.6286 19.288L19.2879 14.6287C19.5223 14.3943 19.7139 14.1252 19.8576 13.8334Z" fill="white"/>
      </svg>
      <div class = "filename">${truncateText(file.name)}</div>
      <svg class = "remove-file" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M19 12C19 16.9706 14.9706 21 10 21C5.02944 21 1 16.9706 1 12C1 7.02944 5.02944 3 10 3C14.9706 3 19 7.02944 19 12ZM5.29289 16.7071C4.90237 16.3166 4.90237 15.6834 5.29289 15.2929L8.58579 12L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L11.4142 12L14.7071 15.2929C15.0976 15.6834 15.0976 16.3166 14.7071 16.7071C14.3166 17.0976 13.6834 17.0976 13.2929 16.7071L10 13.4142L6.70711 16.7071C6.31658 17.0976 5.68342 17.0976 5.29289 16.7071Z" fill="#FF5C00"/>
      </svg>
      `;
      
      filesContainer.append(fileDisplayTag);
    })
    
  }
  
  // Use event delegation to handle remove file clicks
  filesContainer.addEventListener('click', (event) => {
    const files = JSON.parse(localStorage.getItem('files'));
    const removeFile = event.target.closest('.remove-file');
    
    if (removeFile) {
    // Find the index of the clicked remove file button's parent element within the files container
    const index = Array.from(filesContainer.children).indexOf(removeFile.parentElement);
    
    // Remove the file at the specified index from the files array
    files.splice(index, 1);
    
    // Update the local storage with the modified files array
    updateLocalStorage('files', files);

    // Update the display of files in the UI
    displayFile();
  }
});


/**
 * Get the current date in a specific format.
 * @returns {string} The current date in the specified format (e.g., "October 19, 2023").
*/
function getCurrentDate() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }; // Date format options
  const currentDate = new Date(); // Create a new Date object
  return currentDate.toLocaleDateString(undefined, options); // Format the date and return it
}

// Clear input fields by setting their values to empty strings.
function clearInputField() {
  // Find and clear input fields with specific IDs
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('due-date').value = '';
}


//Set the tasks for the current user by updating the 'tasks' key in local storage.
function setTasks() {
  // Get users and user index from local storage
  const users = JSON.parse(localStorage.getItem('users'));
  const userIndex = JSON.parse(localStorage.getItem('userIndex'));

  // Find the current user
  const currentUser = users[userIndex];

  // Get the user's current task management or an empty array if it doesn't exist
  const currentTaskManagement = currentUser._taskManagement || [];
  const tasks = currentTaskManagement;

  // Update the 'tasks' key in local storage with the tasks
  updateLocalStorage('tasks', tasks);
}

// Update the local storage with the user's task management data.
function updateStorage() {
  // Get users, user index, and tasks from local storage
  const users = getUsersFromLocalStorage();
  const userIndex = JSON.parse(localStorage.getItem('userIndex'));
  const tasks = JSON.parse(localStorage.getItem('tasks'));

  // Find the current user
  const currentUser = users[userIndex];

  // Update the user's task management with the tasks or an empty array if it doesn't exist
  currentUser._taskManagement = tasks || [];

  // Update the 'users' key in local storage with the modified user data
  updateLocalStorage('users', users);
}

// Display user information on the page, such as username and profession.
function displayUser() {
  // Retrieve users and user index from local storage
  const users = getUsersFromLocalStorage();
  const userIndex = JSON.parse(localStorage.getItem('userIndex'));

  // Find the current user based on the user index
  const currentUser = users[userIndex];
  console.log(currentUser)
  // Find the elements to display username and profession
  const username = document.querySelector('.username-profession-block #username');
  const profession = document.querySelector('.username-profession-block #profession');

  // Set the text content of the username element to the user's full name
  username.textContent = `${currentUser.firstname} ${currentUser.lastname}`;
  
  // Set the text content of the profession element to the user's profession or an empty string
  profession.textContent = currentUser._profession || '';
}