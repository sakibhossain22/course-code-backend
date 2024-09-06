const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
let jwt = require('jsonwebtoken');
// const ACCESS_TOKEN = '3ede879e106f08b718b555805a2f2eab2faeb8ec8c96700b7e4fb6c8ac6b029c50afe63cdb2631ff94dc92c43631c35183b65b621bfb54a73d5308b1fa5d2b8b'
const stripe = require("stripe")('sk_test_51NgMf2SJZsIhUwm5TWFi9g4SrqXCK64lm6uRTaywDhymkuX5Umy9WaPjs5DqZwFSo6h8KMzLhXKBwRpzJKUfUpdF00wrja3qm3');

// middleWare
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())
require('dotenv').config()
// mongodb
const uri = `mongodb+srv://sakib01181:Sakib_22@cluster0.60qibw3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const courseCollection = client.db('courses').collection('course')
        const enrolledCollection = client.db('courses').collection('enrolled')
        const userCollection = client.db('courses').collection('user')

        // Get Hotels
        app.get('/course', async (req, res) => {
            try {
                const hotels = await courseCollection.find().toArray();
                res.send(hotels);
            } catch (err) {
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });
        app.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body
                console.log(email, password);
                if (email && password) {
                    const findUser = await userCollection.findOne({ email: email })
                    if (!findUser) {
                        userCollection.insertOne({ email, password })
                    }
                }
                res.send({ token: `${email, password}` })
            } catch (err) {
                res.status(500).send({ message: 'Internal Server Error' });
            }
        })
        // Get All Cart By User
        app.get('/cart/:email', async (req, res) => {
            const { email } = req.params
            const query = { email: email.toLowerCase() }
            const results = await enrolledCollection.find(query).toArray()
            res.send(results)
        })
        app.post('/cart', async (req, res) => {
            try {
                const data = req.body
                console.log(data);
                const query = {id : data?.course?.id}
                const filter = await enrolledCollection.findOne(query)
                if(filter) return
                const results = await enrolledCollection.insertOne(data)
                res.send(results)
            } catch (err) {
                res.status(500).send({ message: 'Internal Server Error' });
            }
        })
        app.delete('/cart/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const query = { _id: id }
                const result = await enrolledCollection.deleteOne(query)
                res.send(result)

            } catch (err) {
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });



        // Cart Post 
        app.post('/cart', async (req, res) => {
            try {
                const newData = req.body; // Get the new data from the request body
                if (newData) {
                    // Check if the item already exists in the collection
                    const cartItem = await cartCollection.findOne({ _id: newData._id });
                    if (cartItem) {
                        res.status(400).send({ message: 'You have already added this item.' });
                    } else {
                        // Insert the new data into the collection
                        const postData = await cartCollection.insertOne(newData);
                        res.status(201).send(postData);
                    }
                } else {
                    res.status(400).send({ message: 'Invalid data received.' });
                }
            } catch (err) {
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Course Code Is Waiting')
})
app.listen(port, console.log('Course Code is running'))