const express = require('express');
const fs = require('fs');
const assert = require('assert');
const { randomBytes } = require('bcrypto');
const bodyParser = require('body-parser');

const log = (string) => {
  if (process.env.LOGGER) {
    console.log(string);
  }
};

class KeyServer {
  constructor(port) {
    this.app = express();
    this.app.use(bodyParser.json({ extended: true }));
    this.port = port;
    this.store = {
      user: {},
      device: {}
    };
    this.token = null;

    this.getPubkey = this.getPubkey.bind(this);
    this.addPubkey = this.addPubkey.bind(this);
    this.init();
  }

  init() {
    this.getToken()
    this.registerRoutes();
    this.start();
  }

  typeMap() {
    return {
      0x00: 'user',
      0x01: 'device'
    }
  }
  typeMapRev() {
    return {
      user: 0x00,
      device: 0x01
    }
  }

  start() {
    this.app.listen(this.port, () => console.log(`listening on ${this.port}`));
  }

  getToken() {
    let token;
    if (process.env.TOKEN) {
      token = process.env.TOKEN;
    } else if (fs.existsSync('token')) {
      token = fs.readFileSync('token').toString()
    } else {
      token = randomBytes(32).toString('hex');
      fs.writeFileSync('token', token);
    }
    this.token = token;
  }

  registerRoutes() {
    this.app.get('/', (req, res) => res.json({ message: 'success' }));
    this.app.get('/pubkey/:type/:id', this.getPubkey)
    this.app.post('/pubkey/:type/:id', (req, res) => this.addPubkey(req, res));
    // TODO: auth this endpoint
    this.app.get('/all', (req, res) => res.json({ data: this.store }))
  }

  auth(req, res) {
    const { query } = req;
    if (query.token !== this.token) {
      res.status(403).json({ message: 'unauthorized' });
    }
  }

  getPubkey(req, res, auth) {
    this.auth(req, res);
    const { params } = req;
    const { type, id } = params;
    // may need to manipulate type here
    assert(type in this.store);
    // stringify?
    const key = this.store[type][id];
    if (key === undefined) {
      res.status(404).json({ message: 'not found' })
    } else {
      res.json({ pubkey: key })
    }
  }

  addPubkey(req, res) {
    const { params, query, body } = req;
    const { type, id } = params;
    const { key } = body;

    log(`type: ${type}, id: ${id}`)
    // user must send key query param
    if (key === undefined) {
      return res.status(400).json({ message: 'please send key query param' });
    }
    // send 404 not found instead...
    // assert known type
    if (!(type in this.store)) {
      return res.status(404).json({ message: 'not found' });
    }
    // assert not already in
    if (id in this.store[type]) {
      return res.status(404).json({ message: 'not found' });
    }

    this.store[type][id] = key;
    log(`added ${type}.${id} = ${key}`);

    res.json({message:"success"});
  }
}

if (require.main) {
  const PORT = parseInt(process.env.PORT, 10) || 8080;
  const server = new KeyServer(PORT);
}
