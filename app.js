
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
// const { marshall } = require("@aws-sdk/util-dynamodb");
const fs = require('fs');
const path = require('path');
// const {parse, stringify, toJSON, fromJSON} = require('flatted');



require('dotenv').config();
app.use(bodyParser.json())
app.set('view engine', 'ejs')

// Middleware to handle URL encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const clientsFilePath = path.join(__dirname, 'clients.json');

// DYNAMO DB CONNECTION
const dynamoDB = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});



//SHOW BASIC WITH BUTTON TO GENERATE QR CODE
app.get('/', (req, res) => {
  res.render('index')
})



app.post('/generateqrcode', async (req, res) => {
  console.log('generateqrcode is called');
  const enteredPassword = req.body.password;
  if (enteredPassword === 'Mayur@130818') {
    try {
      let token = generateRandomString();
      console.log('client is being started ', token);
      const client = new Client({
        restartOnAuthFail: true,
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
           // '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
          ],
        },
        authStrategy: new LocalAuth({
          clientId: token
        })
      });
      
      client.initialize();
    
      client.on('qr', async (qr) => {
    
        try {
          const generatedQRCode = await new Promise((resolve) => {
            client.on('qr', (qr) => {
              const code = QRCode.toDataURL(qr)
              resolve(code);
            });
          });
        //  console.log(generatedQRCode);
          res.render('qrcode', { qrCode: generatedQRCode, tokenKey: token })
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      })
    
      client.on('ready', () => {
        console.log(`whatsapp is ready, id is ${token}`);
      })
      client.on('authenticated', () => {
        console.log('client is authenticated');
        // console.log("clientObject", client);
        sessions.push({
          id: token,
          client: client
        });
        // res.render('tokenKey', {tokenKey : token})
      })



    } catch (err) {
        console.log(err);
      }


    } else {
      console.log('unmatched');
    }  
    })
    
  
    





let sessions = [];
function test() {
  console.log("sessionsObject", sessions);
}
test()

app.get('/qrcode', async (req, res) => {
  let token = generateRandomString();
  console.log('client is being started ', token);
  const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
       // '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
    },
    authStrategy: new LocalAuth({
      clientId: token
    })
  });
  
  client.initialize();

  client.on('qr', async (qr) => {

    try {
      const generatedQRCode = await new Promise((resolve) => {
        client.on('qr', (qr) => {
          const code = QRCode.toDataURL(qr)
          resolve(code);
        });
      });
    //  console.log(generatedQRCode);
      res.render('qrcode', { qrCode: generatedQRCode, tokenKey: token })
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  })

  client.on('ready', () => {
    console.log(`whatsapp is ready, id is ${token}`);
  })
  client.on('authenticated', () => {
    console.log('client is authenticated');
    // console.log("clientObject", client);
    sessions.push({
      id: token,
      client: client
    });
    // res.render('tokenKey', {tokenKey : token})
  })
})




app.post('/sendmessage/:tokenKey', async (req, res) => {
  console.log('sendmessage called');
  let clientid = req.params.tokenKey;
  console.log(clientid);
  let obj = sessions.find((item) => item.id === clientid);
  if (obj) {
    let contact = req.body.contact;
    let stringedContact = contact.toString();
    console.log(stringedContact.length);
    let text = req.body.text;
    let client = obj.client;
    if (stringedContact.length === 10) {
      // console.log(client);
    let mobileNo = '7887892244'
    let mobNoAsUID = `91${stringedContact}@c.us`;
     await client.sendMessage(mobNoAsUID, text).then(response => {
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
    }
    // Return the client object if needed
    // return client;
  } else {
    console.log('Object with ID ' + clientid + ' not found');
    return null;
  }
  })



  app.post('/sendfile/:tokenKey', async (req, res) => {
    console.log('sendFile called');
    let clientid = req.params.tokenKey;
    let obj = sessions.find((item) => item.id === clientid);
  if (obj) {
    let contact = req.body.contact;
    let file = req.body.fileURL;
    let mimeType = req.body.mimeType;
    console.log(mimeType);
    // let file = req.body.message;
    // let filename = req.body.filename;
    let stringedContact = contact.toString();
    if (stringedContact.length === 10) {
      let client = obj.client;
      let mobNoAsUID = `91${stringedContact}@c.us`;
      // your code here
    //  const media = new MessageMedia(fileType, file)
    // const media = MessageMedia.fromFilePath('./AstralGreen.jpg');
    // const media = MessageMedia.fromFilePath('./123.pdf');
    const media = await MessageMedia.fromUrl(file, { unsafeMime: true });
    console.log(media);
     await client.sendMessage(mobNoAsUID, media).then(response => {
      res.status(200).json({
        status: true,
        response: response
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        response: err
      });
    });
    }
  }
  })



app.get('/logsessions', (req, res) => {
  sessions.forEach(session => {
    res.send(session.id);
  });
});





/* 
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

 */

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Port listening on ${PORT}`)
})



/* 
async function generateHashedPassword() {
  const enteredPassword = 'abc123';
  console.log(enteredPassword);
  const hashedpass = await bcrypt.hash(enteredPassword, 10) //used one time only to create hashed password to owner login
  console.log(hashedpass);
} */






// console.log(generateRandomString);

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
} 