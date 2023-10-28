const fileBlock = document.querySelector('.files-block');
const editTaskInfo = document.getElementById('edit-to-save');
const addInputFile = document.getElementById('add-input-file');
const addInputFolder = document.getElementById('add-input-folder');
const setHighScore = document.getElementById('set-high-score');
const setAllGrade = document.getElementById('set-all-grade');
const fileMenu = document.querySelector('.file-menu-container');
const confirmWindow = document.querySelector('.confirm-files-removal');
const exportFiles = document.querySelector('.export-grade-book-button');

getTaskTitle();
setFiles();
displayFiles();
displayTaskInfo();

// Define a function for sorting and updating the file list
function sortAndUpdateFiles(sortFunction) {
  // Retrieve the selected task files from local storage
  const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));

  // Sort the files using the provided sort function
  selectedTaskFile.sort(sortFunction);

  // Update the selected task files in local storage with the sorted order
  updateLocalStorage('selectedTaskFile', selectedTaskFile);

  // Update the storage (if needed) and display the sorted files
  updateStorage();
  displayFiles();
}

// Add a click event listener to the 'fileMenu' element
fileMenu.addEventListener('click', (event) => {
  // Retrieve the selected task files from local storage
  const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));

  // Check if the clicked element is related to removing all files
  const removeAllFiles = event.target.closest('.remove-all-files');

  // Check if the clicked element is related to sorting by name
  const sortByName = event.target.closest('.sort-by-name');

  // Check if the clicked element is related to sorting by status
  const sortByStatus = event.target.closest('.sort-by-status');

  // Check if the clicked element is related to sorting by grade
  const sortByGrade = event.target.closest('.sort-by-grade');

  if (removeAllFiles) {
    // Handle the 'Remove All Files' action
    const confirmWindow = document.querySelector('.confirm-files-removal');
    confirmWindow.style.display = 'flex';

    confirmWindow.addEventListener('click', (event) => {
      // Check if the user confirms the removal
      const yes = event.target.closest('#yes');

      // Check if the user cancels the removal
      const no = event.target.closest('#no');

      if (yes) {
        // Clear the selected task files
        selectedTaskFile.splice(0);

        // Hide the confirmation window
        confirmWindow.style.display = 'none';

        // Update the selected task files in local storage
        updateLocalStorage('selectedTaskFile', selectedTaskFile);

        // Update the storage (if needed) and display the files
        updateStorage();
        displayFiles();
      } else if (no) {
        // Hide the confirmation window if the user cancels
        confirmWindow.style.display = 'none';
      }
    });
  } else if (sortByName) {
    // Sort and update the files by name
    sortAndUpdateFiles((a, b) => a.name.localeCompare(b.name));
  } else if (sortByStatus) {
    // Sort and update the files by status
    sortAndUpdateFiles((a, b) => a.status - b.status);
  } else if (sortByGrade) {
    // Sort and update the files by grade in descending order
    sortAndUpdateFiles((a, b) => b.fileGrade - a.fileGrade);
  }
});

// Function to enter edit mode
function enterEditMode() {
  // Clear displayed date information
  document.getElementById('display-date-due').textContent = '';
  document.getElementById('display-date-created').textContent = '';

  // Enable editing of the task description
  const description = document.getElementById('description');
  description.removeAttribute('readonly');

  // Display and set values for date fields (date created and date due)
  const dateCreated = document.getElementById('date-created');
  const dateDue = document.getElementById('date-due');
  dateCreated.style.display = 'flex';
  dateCreated.value = `${convertDateToNumericFormat(getTaskDateCreation())}`;
  dateDue.style.display = 'flex';
  dateDue.value = `${getTaskDateDue()}`;
}

// Function to exit edit mode and save changes
function exitEditModeAndSaveChanges() {
  // Restore the original date information
  document.getElementById('display-date-created').textContent = getTaskDateCreation();
  document.getElementById('display-date-due').textContent = convertDateToStringFormat(getTaskDateDue());

  // Disable editing of the task description
  const description = document.getElementById('description');
  description.setAttribute('readonly', 'true');

  // Retrieve date inputs
  const dateDue = document.getElementById('date-due');
  const dateCreated = document.getElementById('date-created');

  // Update the selected task with new values
  const selectedTask = JSON.parse(localStorage.getItem('selectedTask'));
  selectedTask._dateCreated = dateCreated.value;
  selectedTask._dateDue = dateDue.value;
  selectedTask._description = description.value;

  // Update the local storage and storage (if applicable)
  updateLocalStorage('selectedTask', selectedTask);
  updateStorage();

  // Hide date fields
  dateCreated.style.display = 'none';
  dateDue.style.display = 'none';

  // Update the UI to reflect changes
  displayFiles();
  displayTaskInfo();
}

// Add a click event listener to the 'editTaskInfo' element
editTaskInfo.addEventListener('click', () => {
  if (editTaskInfo.textContent === 'Edit') {
    // Toggle to edit mode
    editTaskInfo.textContent = 'Save Changes';
    enterEditMode();
  } else {
    // Toggle back to view mode and save changes
    editTaskInfo.textContent = 'Edit';
    exitEditModeAndSaveChanges();
  }
});

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
  const files = JSON.parse(localStorage.getItem('selectedTaskFile')) || [];
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
          updateLocalStorage('selectedTaskFile', files); //Update local storage
          updateStorage();
          displayFiles();  //display the added files
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
      updateLocalStorage('selectedTaskFile', files)
      displayFiles();
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
  const filteredFiles = JSON.parse(localStorage.getItem('selectedTaskFile')) || [];

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
      updateLocalStorage('selectedTaskFile', filteredFiles)
      updateStorage();
      // Display the file (if applicable)
      displayFiles();
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
// Function to update high scores or grades for all files
function updateHighScoresOrGrades(newValue, property) {
  const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));

  // Update the specified property for all files
  selectedTaskFile.forEach((file) => {
    file[property] = Number(newValue);
  });

  // Update local storage and refresh the UI
  updateLocalStorage('selectedTaskFile', selectedTaskFile);
  updateStorage();
  displayFiles();
}

// Add an input event listener for setting high scores
setHighScore.addEventListener('input', () => updateHighScoresOrGrades(setHighScore.value, 'highScore'));

// Add an input event listener for setting all grades
setAllGrade.addEventListener('input', () => updateHighScoresOrGrades(setAllGrade.value, 'fileGrade'));

// Function to export data to a CSV file
function exportToExcel(data) {
  if (data.length === 0) {
    return '';
  }

  // Create the CSV header using the keys from the first object in the data array
  const header = Object.keys(data[0]).map((key) => key.replace(/_/g, ' ')).join(',');

  // Create CSV rows by joining the values with commas
  const rows = data.map((item) => Object.values(item).join(','));

  // Join the header and rows with line breaks to form the CSV content
  return `${header}\n${rows.join('\n')}`;
}

// Function to download a CSV file
function downloadCSV(content, filename) {
  // Create a Blob with the CSV content
  const blob = new Blob([content], { type: 'text/csv' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element for downloading
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  // Programmatically click the anchor element to trigger the download
  a.click();

  // Revoke the URL to release resources
  URL.revokeObjectURL(url);
}

// Add a click event listener to the "exportFiles" button
exportFiles.addEventListener('click', () => {
  const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));
  const filteredData = selectedTaskFile.map(({ name, fileGrade, highScore }) => ({
    name,
    grade: fileGrade,
    high_score: highScore,
  }));

  // Call the exportToExcel function to create CSV content
  const csvContent = exportToExcel(filteredData);

  // Call the downloadCSV function to initiate the download
  downloadCSV(csvContent, 'exported_data.csv');
});

// Function to create a single file row for rendering in the file list
function createFileRow(file, index) {
  // Create a div element to represent the file row
  const tableRowBlock = document.createElement('div');
  tableRowBlock.classList.add('table-row-data');
  tableRowBlock.dataset.index = index;

  // Generate the HTML structure for the file row
  tableRowBlock.innerHTML = `
    <p class="filename">${file.name}</p>
    <p class="status">${getFileStatus(file)}</p>
    <p class="score">
      <input type="text" name="grade" class="grade" value="${file.fileGrade}"/>/${file.highScore}
    </p>
    <svg class="remove-file" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM7 13H17V11H7V13Z" fill="#61892f" fill-opacity="0.74"/>
    </svg>
  `;

  return tableRowBlock;
}

// Function to display the list of files
function displayFiles() {
  // Clear the existing content in the fileBlock
  fileBlock.textContent = '';

  // Retrieve the selected task files from local storage
  const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));

  // Iterate through the files and render each file row
  selectedTaskFile.forEach((file, index) => {
    const fileRow = createFileRow(file, index);
    fileBlock.appendChild(fileRow);
  });
}

// Add a change event listener to handle grade changes
fileBlock.addEventListener('change', (event) => {
  if (event.target.classList.contains('grade')) {
    // Find the index of the file being edited
    const index = event.target.closest('.table-row-data').dataset.index;

    // Retrieve the selected task files from local storage
    const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));

    // Update the grade of the selected file
    selectedTaskFile[index].fileGrade = Number(event.target.value);

    // Update local storage and refresh the file display
    updateLocalStorage('selectedTaskFile', selectedTaskFile);
    updateStorage();
    displayFiles();
  }
});

// Add a click event listener to handle file removal
fileBlock.addEventListener('click', (event) => {
  const removeFileIcon = event.target.closest('.remove-file');

  if (removeFileIcon) {
    // Find the index of the file to be removed
    const index = removeFileIcon.closest('.table-row-data').dataset.index;

    // Retrieve the selected task files from local storage
    const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));

    // Remove the selected file
    selectedTaskFile.splice(index, 1);

    // Update local storage and refresh the file display
    updateLocalStorage('selectedTaskFile', selectedTaskFile);
    updateStorage();
    displayFiles();
  }
});

// Function to display task information
function displayTaskInfo() {
  // Retrieve DOM elements for dateCreated, dateDue, and description
  const dateCreated = document.getElementById('display-date-created');
  const dateDue = document.getElementById('display-date-due');
  const description = document.getElementById('description');

  // Set the content of these elements based on task data
  dateCreated.textContent = convertDateToStringFormat(getTaskDateCreation());
  dateDue.textContent = convertDateToStringFormat(getTaskDateDue());
  description.textContent = getTaskDescription();
}

//Function to get the file's status
function getFileStatus(file){
  return file.status? 'Completed': 'incomplete';
}

function updateStorage(){
  const users = JSON.parse(localStorage.getItem('users'));
  const userIndex = JSON.parse(localStorage.getItem('userIndex'));
  const taskIndex = JSON.parse(localStorage.getItem('taskIndex'));
  const selectedTask = JSON.parse(localStorage.getItem('selectedTask'));
  const selectedTaskFile = JSON.parse(localStorage.getItem('selectedTaskFile'));
  // Find the current user
  const currentUser = users[userIndex];

  // Get the user's current task management or an empty array if it doesn't exist
  const currentTaskManagement = currentUser._taskManagement || [];
  const task = currentTaskManagement;
  selectedTask._files = selectedTaskFile;
  task[taskIndex] = selectedTask;

  updateLocalStorage('users', users);
}

function setFiles(){
  // Get users and user index from local storage
  const users = JSON.parse(localStorage.getItem('users'));
  const userIndex = JSON.parse(localStorage.getItem('userIndex'));
  const taskIndex = JSON.parse(localStorage.getItem('taskIndex'));

  // Find the current user
  const currentUser = users[userIndex];

  // Get the user's current task management or an empty array if it doesn't exist
  const currentTaskManagement = currentUser._taskManagement || [];
  const tasks = currentTaskManagement;
  const selectedTaskFile = tasks[taskIndex]._files || [];
  const selectedTask = tasks[taskIndex];

  //update local storage
  updateLocalStorage('selectedTaskFile', selectedTaskFile);
  updateLocalStorage('selectedTask', selectedTask);
  console.log(selectedTaskFile)
}

//Set the tasks for the current user by updating the 'tasks' key in local storage.
function getTaskTitle() {
  // Get users and user index from local storage
  const users = JSON.parse(localStorage.getItem('users'));
  const userIndex = JSON.parse(localStorage.getItem('userIndex'));
  const taskIndex = JSON.parse(localStorage.getItem('taskIndex'));

  // Find the current user
  const currentUser = users[userIndex];

  // Get the user's current task management or an empty array if it doesn't exist
  const currentTaskManagement = currentUser._taskManagement || [];
  const tasks = currentTaskManagement;

  if(tasks[taskIndex]._title === "") document.querySelector('.task-title').innerHTML = 'Untitled';
  else document.querySelector('.task-title').innerHTML = `${tasks[taskIndex]._title}`
}

function getTaskDateCreation(){
   // Get users and user index from local storage
   const users = JSON.parse(localStorage.getItem('users'));
   const userIndex = JSON.parse(localStorage.getItem('userIndex'));
   const taskIndex = JSON.parse(localStorage.getItem('taskIndex'));
 
   // Find the current user
   const currentUser = users[userIndex];
 
   // Get the user's current task management or an empty array if it doesn't exist
   const currentTaskManagement = currentUser._taskManagement || [];
   const tasks = currentTaskManagement;
   //return the datecreated
   return tasks[taskIndex]._dateCreated;
}

function getTaskDateDue(){
  // Get users and user index from local storage
   const users = JSON.parse(localStorage.getItem('users'));
   const userIndex = JSON.parse(localStorage.getItem('userIndex'));
   const taskIndex = JSON.parse(localStorage.getItem('taskIndex'));
 
   // Find the current user
   const currentUser = users[userIndex];
 
   // Get the user's current task management or an empty array if it doesn't exist
   const currentTaskManagement = currentUser._taskManagement || [];
   const tasks = currentTaskManagement;
   //return the due date
   return tasks[taskIndex]._dateDue;
}

function getTaskDescription(){
 // Get users and user index from local storage
 const users = JSON.parse(localStorage.getItem('users'));
 const userIndex = JSON.parse(localStorage.getItem('userIndex'));
 const taskIndex = JSON.parse(localStorage.getItem('taskIndex'));

 // Find the current user
 const currentUser = users[userIndex];

 // Get the user's current task management or an empty array if it doesn't exist
 const currentTaskManagement = currentUser._taskManagement || [];
 const tasks = currentTaskManagement;
 //return the description
 return tasks[taskIndex]._description;
}
