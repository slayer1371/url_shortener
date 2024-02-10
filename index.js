require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient}= require('mongodb');
const dns=require('dns');
const urlparser=require('url')

const client=new MongoClient(process.env.DB_URL);
const db=client.db('urlshortner')
const urls=db.collection('urls')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body)
  const url=req.body.url
  const dnslookup=dns.lookup(urlparser.parse(url).hostname, async(err,address) => {
    if(!address)
      res.json({error:"Invalid Url"})
    else {
      const urlcount=await urls.countDocuments({})
      const urldoc = {
        url,
        short_url:urlcount
      }

      const result=await urls.insertOne(urldoc)
      res.json({original_url:url,short_url:urlcount})
    }
  })
});

app.get("/api/shorturl/:shorturl",async (req,res)=>{
  const shorturl=req.params.shorturl;
  const urldoc = await urls.findOne({
    short_url: +shorturl
  })
  res.redirect(urldoc.url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
