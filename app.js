
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
const mime = require('mime');

// const {parse, stringify, toJSON, fromJSON} = require('flatted');



require('dotenv').config();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.set('view engine', 'ejs')


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
      let fileContent = req.body.file;
      let fileName = req.body.fileName;
      let mimeType = req.body.mimeType;
      let stringedContact = contact.toString();
      if (stringedContact.length === 10) {
        let client = obj.client;
        let mobNoAsUID = `91${stringedContact}@c.us`;
  
        // Decode the base64-encoded file content
        const buffer = Buffer.from(fileContent.split(',')[1], 'base64');
  
        // Save the file to a local directory with the appropriate extension
        const ext = mime.getExtension(mimeType);
        const filePath = `./path/to/${fileName}`;
        // const filePath = `./path/to/${fileName}.${ext}`;
        await fs.promises.writeFile(filePath, buffer);
  
        // Once the file is saved, create a MessageMedia object and send it
        const media = await MessageMedia.fromFilePath(filePath);
        await client.sendMessage(mobNoAsUID, media).then(async response => {
          // Delete the file after it has been sent
          await fs.promises.unlink(filePath);
          res.status(200).json({
            status: true,
            response: response
          });
        }).catch(async err => {
          // Delete the file if there was an error sending it
          await fs.promises.unlink(filePath);
          res.status(500).json({
            status: false,
            response: err
          });
        });
      }
    }
  });
  















app.get('/logsessions', (req, res) => {
  sessions.forEach(session => {
    res.send(session.id);
  });
});




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