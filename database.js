const mysql = require('mysql2');
// creates a new MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'kalina1234',
  database: 'pastebinApp'
});

// connects to the MySQL database
connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL database:', error);
  } else {
    console.log('Connected to MySQL database!');
  }
});

// Insert post into the database
function insertPaste(title, content, programmingLanguage, callback) {
  connection.query('INSERT INTO pastes (title, content, programming_language, created_at) VALUES (?, ?, ?, NOW())',[title, content, programmingLanguage],(error, results) => {
      if (error) {
        callback(error);
        return;
      }
      callback(null);
    }
  );
}



//Method for retrieving posts from the database”
function getPasteuri(callback) {
  connection.query("SELECT id, title, content, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS formatted_created_at, DATE_FORMAT(last_modified_at, '%Y-%m-%d %H:%i:%s') AS formatted_last_modified_at, programming_language FROM pastes", (err, results) => {
      if (err) {
          callback(err, null);
          return;
      }
      console.log("Rezultatele interogării:", results);
      callback(null, results);
  });
}



// Function for deleting a post and its title from the database
function deletePaste(id, callback) {
  connection.query('DELETE FROM pastes WHERE id = ?', [id], (error, results) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null);
  });
}


// Method for resetting auto-increment IDs after deletion
function resetAutoIncrement(callback) {
  connection.query('ALTER TABLE pastes AUTO_INCREMENT = 1', (error, results) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null);
  });
}

function decrementIds(id, callback) {
  connection.query('UPDATE pastes SET id = id - 1 WHERE id > ?', [id], (error, results) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null);
  });
}

// Function for updating a specific post by ID
function updatePaste(id, title, content, callback) {
  connection.query(
    "UPDATE pastes SET title = ?, content = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?", 
    [title, content, id], 
    (err, results) => {
      if (err) {
          callback(err);
          return;
      }
      callback(null);
    }
  );
}

function updateLastModified(id, callback) {
  connection.query('UPDATE pastes SET last_modified_at = CURRENT_TIMESTAMP WHERE id = ?', [id], (error, results) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null);
  });
}

function getPasteById(id, callback) {
  connection.query("SELECT *, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS formatted_created_at, DATE_FORMAT(last_modified_at, '%Y-%m-%d %H:%i:%s') AS formatted_last_modified_at FROM pastes WHERE id = ?", [id], (err, results) => {
      if (err) {
          callback(err, null);
          return;
      }
      if (results.length === 0) {
          callback(null, null);
          return;
      }
      const paste = results[0];
      callback(null, paste);
  });
}

//Exports the connection, the insertPaste function, and the getPosts function to be used in other files
module.exports = {
  connection: connection,
  insertPaste: insertPaste,
  getPasteuri: getPasteuri,
  deletePaste: deletePaste,
  resetAutoIncrement: resetAutoIncrement,
  decrementIds: decrementIds,
  updatePaste: updatePaste,
  getPasteById: getPasteById,
  updateLastModified: updateLastModified
};
