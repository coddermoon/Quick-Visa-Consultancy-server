// aqll dependencies
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const port = process.env.port || 5000

const app = express()
app.use(express.json())
app.use(cors())

// connect to database


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l1pq8lk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const dbConnectRun = async()=>{
    try {
const benifitCollection = client.db('visa-concaltant').collection('benifits')
const serviceCollection = client.db('visa-concaltant').collection('services')


// get benifits data 

app.get('/benifits',async(req,res)=>{
    const query = {}
    const cursor = benifitCollection.find(query)
    const benifits =await cursor.toArray()
    res.send(benifits)

})

app.get('/service/:id',async(req,res)=>{
    const id = req.params.id;
    const query = { _id: ObjectId(id) };

    const service = benifitCollection.findOne(query)
   
    res.send(service)

})

app.get('/services',async(req,res)=>{
    
    let query = {}
    if (req.query.limit) {
        query = {
            limit:req.query.limit
        }
    }
    const limit= parseInt(query.limit)
  
    let cursor
    
if (!limit) {
     cursor = serviceCollection.find(query)
}else{
     cursor = serviceCollection.find().limit(limit)
}

   
    const benifits =await cursor.toArray()
    res.send(benifits)

})


        
    } finally {
        
    }

}

dbConnectRun().catch(err => console.error(err));


app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(`listening to port : ${port}`)
})