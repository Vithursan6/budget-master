const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = ({target}) => {
    const db = target.result;
    db.createObjectStore('newBudget', { autoIncrement: true });
  }

request.onsuccess = ({target}) => {
    db = target.result;
    if (navigator.onLine) {
        checkDb();
    }
  }; 
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };
  
function saveRecord(record) {
    const transaction = db.transaction(['newBudget'], 'readwrite');
    const storeDb = transaction.objectStore('newBudget');
    storeDb.add(record);
  }

  function checkDb() {
    const transaction = db.transaction(['newBudget'], 'readwrite');
    const storeDb = transaction.objectStore('newBudget');
    const getAll = storeDb.getAll();
  
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
            const transaction = db.transaction(['newBudget'], 'readwrite');
            const storeDb = transaction.objectStore('newBudget');
            storeDb.clear();
            });
        }
    };

}

window.addEventListener("online", checkDb);


