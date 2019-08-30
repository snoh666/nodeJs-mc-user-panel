const express = require('express');
const app = express();
const cors = require('cors');
const firebase = require('firebase');

const dotenv = require('dotenv');
dotenv.config();
const { HOST, PORT, PASSWORD, APIKEY, AUTHDOMAIN, DATABASEURL, PROJECTID, STORAGEBUCKET, MESSAGINGSENDERID, APPID } = process.env;

// Initialize Firebase
const firebaseConfig = {
  apiKey: APIKEY,
  authDomain: AUTHDOMAIN,
  databaseURL: DATABASEURL,
  projectId: PROJECTID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: MESSAGINGSENDERID,
  appId: APPID
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const Rcon = require('rcon');
// SETTINGS ===========

app.set('Content-type', 'application/json');
app.use(cors());
app.use(express.json());

// ROUTES =============

app.get('/', (req, res) => {
  res.send({text: 'Hello world'})
});

app.get('/online', function(req, res) {

  const conn = new Rcon(HOST, PORT, PASSWORD);


  conn.on('auth', () => {
    conn.send('list');

  }).on('response', (value) => {
    if (value.includes('There are')) {
      let players = value.split(':')[1];


      if(typeof players === 'string') {
        res.json({ playersOnline: players.split(',').length });
      } else {
        res.json({ playersOnline: 0 });
      }

      conn.disconnect();
    }
  });

  conn.connect();
});

app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  const userDB = db.collection('users').doc(user);
  userDB.get().then(doc => {
    if(!doc.exist) {
      if(doc.data().password === pass) {
        res.json({ logIn: true })
      } else {
        res.json({ logIn: false })
      }
    } else {
      res.json({ logIn: false })
    }
  }).catch(() => {
    res.json({ logIn: false })
  })
});

app.post('/time', (req, res) => {
  const { user } = req.body;
  const userDB = db.collection('users').doc(user);
  const updateTimeOnServer = () => {
    const conn = new Rcon(HOST, PORT, PASSWORD);
    const data = {text: `Dzien ustawiony przez ${user}`, color: "green"};

    conn.on('auth', () => {
      conn.send(`title @a title ${JSON.stringify(data)}`);
      conn.send('time set day');
    }).on('response', value => {
      if(value.includes('The time was set to')){
        conn.disconnect();
      }
    });

    conn.connect();

  };

  userDB.get().then(doc => {
    if (!doc.exist) {
      const data = doc.data();
      if('lastTime' in data){
        const nowTime = Math.floor(new Date().getTime() / 1000);

        if(nowTime - data.lastTime > 7200) {
          updateTimeOnServer();
          db.collection('users').doc(user).update({ lastTime: Math.floor(new Date().getTime() / 1000) });
          res.json({ lastTime: 'Time set' });
        } else {
          res.json({ info: `You need to wait: ${Math.floor( (7200 - ( nowTime - data.lastTime )) / 60 )} minutes.` });
        }

      } else {
        db.collection('users').doc(user).update({ lastTime: Math.floor(new Date().getTime() / 1000) });
        updateTimeOnServer();
        res.json({info: 'Time set'});
      }
    } else {
      res.json({ info: 'Something went wrong' });
    }
  });
});

app.post('/skin-change', (req, res) => {

  const { user, skinName } = req.body;
  const userDB = db.collection('users').doc(user);
  const updateSkinOnServer = () => {
    const conn = new Rcon(HOST, PORT, PASSWORD);
    const data = { text: `Skin zostal zmieniony`, color: "green" };
    const subtitleData = { text: `na ${skinName}`};

    conn.on('auth', () => {
      conn.send(`skin set ${user} ${skinName}`);
    }).on('response', value => {
      console.log(value);
      conn.send(`title ${user} subtitle ${JSON.stringify(subtitleData)}`);
      conn.send(`title ${user} title ${JSON.stringify(data)}`);
    });

    conn.connect();

  };

  userDB.get().then(doc => {
    if(doc.exists) {
      const data = doc.data();
      const nowTime = Math.floor(new Date().getTime() / 1000);

      if('lastSkinChange' in data) {
        if (nowTime - data.lastSkinChange > 1800) {
          db.collection('users').doc(user).update({ lastSkinChange: Math.floor(new Date().getTime() / 1000) });
          updateSkinOnServer();
          res.json({ info: 'Skin changed' });
        } else {
          res.json({ info: `You need to wait: ${Math.floor((1800 - (nowTime - data.lastSkinChange)) / 60)} minutes.` });
        }
      } else {
        db.collection('users').doc(user).update({ lastSkinChange: Math.floor(new Date().getTime() / 1000) });
        updateSkinOnServer();
        res.json({info: 'Skin changed'});
      }

    } else {
      res.json({info: 'Something went wrong'});
    }
  });

});

// SERVER =============
app.listen(80, () => {
  console.log('Listening on port');
});