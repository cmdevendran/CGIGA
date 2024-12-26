const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');  // Import MongoDB native driver

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI (Replace with your connection string or MongoDB Atlas URL)
const mongoURI = 'mongodb+srv://cgadmin:lcd3PBRRDF8dqOlB@cgiga.2yjzq.mongodb.net/?retryWrites=true&w=majority&appName=CGIGA'; // Local MongoDB URI
const dbName = 'CGIGA';  // Your database name
let db;
let employeesCollection;

// Connect to MongoDB and select the database
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db(dbName);  // Get the database
        console.log(db)
        employeesCollection = db.collection('EMPLOYEES');  // Reference to the employees collection
    })
    .catch(error => console.error('MongoDB connection error:', error));

// Create an employee
app.post('/employees', async (req, res) => {
    const { firstname, lastname, username, userid, password } = req.body;
    try {
        const newEmployee = { firstname, lastname, username, userid, password };
        const result = await employeesCollection.insertOne(newEmployee);
        res.status(201).json(result.ops[0]);  // Send back the newly created employee
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read all employees
app.get('/employees', async (req, res) => {
    try {
        const employees = await employeesCollection.find().toArray();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a specific employee by userid
app.get('/employees/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        const employee = await employeesCollection.findOne({ userid });
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an employee
app.put('/employees/:userid', async (req, res) => {
    const { userid } = req.params;
    const { firstname, lastname, username, password } = req.body;
    try {
        const result = await employeesCollection.updateOne(
            { userid },
            { $set: { firstname, lastname, username, password } }
        );
        
        if (result.matchedCount > 0) {
            const updatedEmployee = await employeesCollection.findOne({ userid });
            res.json(updatedEmployee);
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete an employee
app.delete('/employees/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
        const result = await employeesCollection.deleteOne({ userid });
        if (result.deletedCount > 0) {
            res.status(204).send();  // Successfully deleted
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

