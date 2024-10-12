const express = require('express');
const exphbs = require('express-handlebars');
const database = require('./database'); //Import database module

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// Configure Handlebars as a view template
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// Route for the main page
app.get('/', (req, res) => {
    res.render('home');
});

// Route for the postPaste page
app.get('/postPaste', (req, res) => {
    res.render('postPaste');
});

// Route for displaying the edit form for a specific post
app.get('/editPaste/:id', (req, res) => {
    const id = req.params.id;

    // Retrieves the post from the database using the ID
    database.getPasteById(id, (err, paste) => {
        if (err) {
            console.error('Error getting paste by ID:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Checks if the post exists
        if (!paste) {
            res.status(404).send('Paste not found');
            return;
        }
        // Renders the Handlebars page and pass the post data for editing”
        res.render('editPaste', { paste: paste });
    });
});

// Route for handling data submitted through the post update form”
app.post('/updatePaste/:id', (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const content = req.body.content;

    // Updates the post in the database
    database.updatePaste(id, title, content, (error) => {
        if (error) {
            console.error('Error updating paste in database:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        // Updates the post's last modified date
        database.updateLastModified(id, (error) => {
            if (error) {
                console.error('Error updating last modified date:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            // Redirects the user to the pasteuri.handlebars page
            res.redirect('/pastes');
        });
    });
});



// Import MySQL module
const mysql = require('mysql2');

// Connection to the MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kalina1234',
    database: 'pastebinApp'
});

// Route for handling data submitted through the post creation form
app.post('/submitPaste', (req, res) => {
    // Extracts the title, content, and programming language from the POST request body
    const title = req.body.title;
    const content = req.body.content;
    const programmingLanguage = req.body.language;

    // Checks if the title, content, and programming language are provided
    if (!title || !content || !programmingLanguage) {
        res.status(400).send('Title, content, and programming language are required');
        return;
    }

    // Insert the new post into the database
    database.insertPaste(title, content, programmingLanguage, (error) => {
        if (error) {
            console.error('Error inserting paste into database:', error);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Paste inserted successfully');
            res.redirect('/pastes');
        }
    });
});



//Route for displaying the posts”
app.get('/pastes', (req, res) => {
    // Query the database to retrieve the posts
    database.getPasteuri((err, pastes) => {
        if (err) {
            console.error('Eroare la obținerea pasteurilor:', err);
            res.status(500).send('Eroare la obținerea pasteurilor');
            return;
        }
        // Renders the Handlebars page and pass the posts as data
        res.render('pastes', { pastes: pastes });
    });
});

//Route for deleting posts
app.post('/deletePaste/:id', (req, res) => {
    const id = req.params.id;
    
    database.deletePaste(id, (error) => {
        if (error) {
            console.error('Error deleting paste from database:', error);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Paste deleted successfully');

            database.decrementIds(id, (error) => {
                if (error) {
                    console.error('Error decrementing IDs:', error);
                } else {
                    console.log('IDs decremented successfully');

                    // Resets the auto-increment value of IDs to start counting from the next available ID
                    database.resetAutoIncrement((error) => {
                        if (error) {
                            console.error('Error resetting auto increment:', error);
                        } else {
                            console.log('Auto increment reset successfully');
                        }
                    });
                    res.redirect('/pastes');
                }
            });
        }
    });
});

const port = 4000;
app.listen(port, () => {
    console.log(`Serverul rulează la adresa http://localhost:${port}`);
});
