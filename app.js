require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

app.use(bodyParser.json())
app.set('view engine', 'ejs')


// DYNAMO DB CONNECTION
const dynamoDB = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});





// SHOW ALL CLIENTS
app.get('/showclients', async function (req, res) {
  // res.render('index', {title : 'world'})
  const params = {
    TableName: 'whatsappapiclients'
  };

  try {
    const data = await dynamoDB.send(new ScanCommand(params));
    const items = data.Items.map(item => {
      return {
        id: item.id,
        token: item.token,
        // Add other attributes as needed
      };
    });
    res.send(items);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
})



const PORT = 3001
app.listen(PORT, () => {
  console.log(`Port listening on ${PORT}`)
})