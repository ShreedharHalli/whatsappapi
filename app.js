
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { DynamoDBClient, ScanCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const bcrypt = require('bcrypt');
const venom = require('venom-bot');
app.use(bodyParser.json())
app.set('view engine', 'ejs')

// Middleware to handle URL encoded data
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());


// DYNAMO DB CONNECTION
const dynamoDB = new DynamoDBClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: '',
      secretAccessKey: ''
  }
});


//SHOW BASIC WITH BUTTON TO GENERATE QR CODE
app.get('/', (req, res) => {
  res.render('index')
})








app.get('/qrcode', async (req, res) => {

    // res.render('qrcode', {qrCodedd : 'ddee'})


  
  venom
  .create(
    //session
    'MayureshHalli', //Pass the name of the client you want to start the bot
    //catchQR
    (base64Qrimg, asciiQR, attempts, urlCode) => {
      console.log('Number of attempts to read the qrcode: ', attempts);
      res.render('qrcode', {qrCode : asciiQR })
      // console.log('Terminal qrcode: ', asciiQR);
      console.log('base64 image string qrcode: ', base64Qrimg);
      console.log('urlCode (data-ref): ', urlCode);
    },
    // statusFind
    (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    // options
      {
      multidevice: true, // for version not multidevice use false.(default: true)
      folderNameToken: 'tokens', //folder name when saving tokens
      mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
      headless: true, // Headless chrome
      devtools: false, // Open devtools by default
      useChrome: true, // If false will use Chromium instance
      debug: false, // Opens a debug session
      logQR: true, // Logs QR automatically in terminal
      browserWS: '', // If u want to use browserWSEndpoint
      browserArgs: [''], // Original parameters  ---Parameters to be added into the chrome browser instance
      browserArgs: ['--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'], // Add broserArgs without overwriting the project's original
      puppeteerOptions: {}, // Will be passed to puppeteer.launch
      disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
      disableWelcome: true, // Will disable the welcoming message which appears in the beginning
      updatesLog: true, // Logs info updates automatically in terminal
      autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
      createPathFileToken: false, // creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
      chromiumVersion: '818858', // Version of the browser that will be used. Revision strings can be obtained from omahaproxy.appspot.com.
      addProxy: [''], // Add proxy server exemple : [e1.p.webshare.io:01, e1.p.webshare.io:01]
      userProxy: '', // Proxy login username
      userPass: '' // Proxy password
    },
    // BrowserSessionToken
    // To receive the client's token use the function await clinet.getSessionTokenBrowser()
    {
      WABrowserId: '"UnXjH....."',
      WASecretBundle:
        '{"key":"+i/nRgWJ....","encKey":"kGdMR5t....","macKey":"+i/nRgW...."}',
      WAToken1: '"0i8...."',
      WAToken2: '"1@lPpzwC...."'
    },
    // BrowserInstance
    (browser, waPage) => {
      console.log('Browser PID:', browser.process().pid);
      waPage.screenshot({ path: 'screenshot.png', fullPage: true });
    }
  )
  .then((client) => {
    console.log(client);
    //start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });
})








app.post('/generateqrcode', async (req, res) => {
  const enteredPassword = req.body.password;
  
  if (enteredPassword.length > 0) {
    
    // Set up the parameters for the GetItem command
  const params = {
    TableName: 'owners',
    Key: { 'id': { N: '123456' } },
    ProjectionExpression: 'myPassword'
  };
    try {
      // Execute the GetItem command
    const command = new GetItemCommand(params);
    const response = await dynamoDB.send(command);
    
    // Access the string value
    const stringVal = response.Item.myPassword.S;
    console.log(stringVal);
    // const encryptedEnteredPass = await bcrypt.hash(enteredPassword, 10)
    const check = await bcrypt.compare(enteredPassword, stringVal); 
    console.log(check);
    if (await bcrypt.compare(enteredPassword, stringVal)) {
      console.log('matched');
    } else {
      console.log('unmatched');
    }  
    } catch (error) {
      
    }
    
    } else {
      console.log('empty password');
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



/* 
async function generateHashedPassword() {
  const enteredPassword = 'abc123';
  console.log(enteredPassword);
  const hashedpass = await bcrypt.hash(enteredPassword, 10) //used one time only to create hashed password to owner login
  console.log(hashedpass);
} */
