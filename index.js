const express = require('express');
const fs = require('fs');
const assert = require('assert');
const { randomBytes } = require('bcrypto');

const PORT = parseInt(process.env.PORT, 10) || 8080;

class KeyServer {
  constructor() {
    this.app = express();
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
    this.app.listen(PORT, () => console.log(`listening on ${PORT}`));
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
    this.app.post('/pubkey/:type/:id', this.addPubkey)
  }

  auth(req, res) {
    const { query } = req;
    if (query.token !== this.token) {
      res.status(403).json({ message: 'unauthorized' });
    }
  }

  getPubkey(req, res) {
    this.auth(req, res);
    const { params } = req;
    const { type, id } = params;
    // may need to manipulate type here
    assert(type in this.store);
    // stringify?
    const key = this.store[type][id];
    res.json({ pubkey: key })
  }

  addPubkey(req, res) {
    const { params, query } = req;
    const { type, id } = params;
    const { key } = body;

    // user must send key query param
    if (key === undefined) {
      res.status(400).json({ message: 'please send key query param' });
    }
    // send 404 not found instead...
    // assert known type
    if (!(type in this.store)) {
      res.status(404).json({ message: 'not found' });
    }
    // assert not already in
    if (id in this.store[type]) {
      res.status(404).json({ message: 'not found' });
    }

    this.store[type][id] = key;

    res.json({ message: 'success' });
  }
}

if (require.main) {
  const server = new KeyServer();
}
