require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});



/* const dbclient = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
}); */

app.use(bodyParser.json())



app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {title : 'world'})
})


app.post('/createuser', async function (req, res) {
  
  const id = req.body.id
  const token = req.body.token
  console.log(token);
  const qrCode = req.body.qrCode

  const params = {
    TableName: "whatsappapiclients",
    Item: marshall({
        id: id,
        token: token,
        qrCode: qrCode
    })
  };

  try {
    await dbclient.put(params);
    return { success: true }
    
  } catch (error) {
    return { success: false }
  }
})


/*
{
    "id" : "100",
    "token" : "123456token",
    "qrCode" : "123456qrCode"
}
*/


app.get('/getuser/:id', async function (req, res) {
  const id = req.params.id;
  console.log(id);

  const params = {
    TableName: "whatsappapiclients",
    Key: marshall({
      id: id
    })
  }

  try {
    const data = await client.send(new GetCommand(params));
    const item = data.Item;

    if (item) {
      res.send(item);
    } else {
      res.status(404).send({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});





app.get('/showclients', async function (req, res) {
  const params = {
    TableName: 'whatsappapiclients'
  };

  try {
    const data = await client.send(new ScanCommand(params));
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
    res.status(500).send('Error retrieving data from DynamoDB');
  }
})


let result = [
  {
      "id": {
          "N": "98"
      },
      "token": {
          "S": "999999"
      }
  },
  {
      "id": {
          "N": "99"
      },
      "token": {
          "S": "555555"
      }
  }
]

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Port listening on ${PORT}`)
})