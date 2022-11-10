// aqll dependencies
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const port = process.env.port || 5000

const app = express()
app.use(express.json())
app.use(cors())

const jwt = require('jsonwebtoken')

// connect to database


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l1pq8lk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}



const dbConnectRun = async()=>{
    try {
const benifitCollection = client.db('visa-concaltant').collection('benifits')
const serviceCollection = client.db('visa-concaltant').collection('services')
const reviewCollection = client.db('visa-concaltant').collection('review')
const blogsCollection = client.db('visa-concaltant').collection('blogs')


app.post('/jwt', (req, res) =>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
    console.log({token})
   res.send({token})
    
}) 


// get benifits data 

app.get('/benifits',async(req,res)=>{
    const query = {}
    const cursor = benifitCollection.find(query)
    const benifits =await cursor.toArray()
    res.send(benifits)

})

app.get('/blogs',async(req,res)=>{
    const query = {}
    const cursor = blogsCollection.find(query)
    const blogs =await cursor.toArray()
    res.send(blogs)

})

app.get('/service/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id:ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
});

app.get('/review', verifyJWT, async (req, res) => {
    const decoded = req.decoded;
            
    if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized access'})
    }
    let query = {};
    // conditoon
    if (req.query.uid) {
        query = {
            uid: req.query.uid
        }
    }
    // queray done
    const cursor = reviewCollection.find(query)
    const review =await cursor.toArray()
   res.send(review)
    
   
  });



app.get('/review',verifyJWT, async (req, res) => {
    const decoded = req.decoded;
            
    if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized access'})
    }

  const query = { id:req.query.id}
  const cursor = reviewCollection.find(query)
  const review =await cursor.toArray()
 res.send(review)
    
});

// post a review


app.post('/review', async (req, res) => {

    const review = req.body
   
    const result = await reviewCollection.insertOne(review);
    res.send(result)
    
});




app.post('/services', async (req, res) => {

    const services = req.body
    console.log(services)
   
    const result = await serviceCollection.insertOne(services);
    res.send(result)
    
});

app.delete('/review/:id', async (req, res) => {
    const id = req.params.id;
    
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.deleteOne(query)
    res.send(result)
   
})

// data update



app.get('/update/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const user = await reviewCollection.findOne(query);
   
    res.send(user);
})

app.put('/update/:id',async(req,res)=>{
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const review = req.body;
    const option = {upsert: true};
    const updateReview = {
        $set: {
            commentSingle: review.commentSingle,
            ratings: review.ratings,
           
        }
        
    }
    const result = await reviewCollection.updateOne(filter, updateReview, option);
    res.send(result)

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