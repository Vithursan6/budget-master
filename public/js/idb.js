const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget-tracker", 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = ({target}) => {
    // save a reference to the database 
    const db = target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('newBudget', { autoIncrement: true });
  };

// upon a successful 
request.onsuccess = ({target}) => {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = target.result;
  
    // check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
        checkDb();
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };
  
  // This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['newBudget'], 'readwrite');
  
    // access the object store for `new_pizza`
    const storeDb = transaction.objectStore('newBudget');
  
    // add record to your store with add method
    storeDb.add(record);
  }

  function checkDb() {
    // open a transaction on your db
    const transaction = db.transaction(['newBudget'], 'readwrite');
  
    // access your object store
    const storeDb = transaction.objectStore('newBudget');
  
    // get all records from store and set to a variable
    const getAll = storeDb.getAll();
  
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => {
                return response.json();
            }).then(() => {
            // open one more transaction
            const transaction = db.transaction(['newBudget'], 'readwrite');
            // access the new_pizza object store
            const storeDb = transaction.objectStore('newBudget');
            // clear all items in your store
            storeDb.clear();
            });
        }
    };

}

window.addEventListener("online", checkDb);


