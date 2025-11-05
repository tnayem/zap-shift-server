const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const port = process.env.PORT || 3000;


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.etjzxzd.mongodb.net/?appName=Cluster0`;

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
    // Create Database and Client 
    const db = client.db("zap_shift")
    const parcelsCollection = db.collection("parcels")
    // Get Parcels
    app.get('/parcels', async (req, res) => {
      const result = await parcelsCollection.find().toArray()
      res.send(result)
    })
    // get parcels using email
    app.get('/parcels', async (req, res) => {
      const userEmail = req.query.email
      const query = userEmail ? { created_by: userEmail } : {};
      const options = {
        sort: { createdAt: -1 } // default newest first
      }
      const result = await parcelsCollection.find(query, options).toArray()
      res.send(result)
    })
    // Post Parcels 
    app.post('/parcels', async (req, res) => {
      try {
        const postParcel = req.body;
        const result = await parcelsCollection.insertOne(postParcel)
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })
    // Delete parcels api 
    app.delete('/parcels/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await parcelsCollection.deleteOne(query);
      res.send(result)
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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
