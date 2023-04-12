
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

app.use(bodyParser.json())
app.set('view engine', 'ejs')

// Middleware to handle URL encoded data
app.use(express.urlencoded({ extended: true }));


// DYNAMO DB CONNECTION
const dynamoDB = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: 'AKIAXRFBOUIF7X4Z3K4D',
      secretAccessKey: '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'
  }
});


//SHOW BASIC WITH BUTTON TO GENERATE QR CODE
app.get('/', (req, res) => {
  res.render('index')
})


app.post('/generateqrcode', (req, res) => {
  console.log('called');
  res.send('I am called')
  const formData = req.body;
  // Do something with the form data here
  console.log(formData);
  res.send(formData)
})

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



