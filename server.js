const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { computeLogNormalScore } = require("lighthouse/lighthouse-core/audits/audit");
const { lightHouse } = require('./scripts/lighthouse');
const { getLoadingTime } = require('./scripts/custom_metrics');
const getFCP = require('./scripts/fcp');
const getLCP = require('./scripts/lcp');
const options = {
  logLevel: 'info',
  disableDeviceEmulation: false,
  chromeFlags: ['--disable-mobile-emulation']
};


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('running');
});

app.post('/light-house', async (req, res) => {
  try {
    var url = req.body.url;
    computeLogNormalScore(url);
    let data = await lightHouse(url, options);
    res.end(JSON.stringify(data));
  }
  catch (err) {
    res.send(JSON.stringify(err))
  }
});

app.post('/metrics', async (req, res) => {
  try {
    var url = req.body.url;
    let fcp = await getFCP( url, '#fc_widget' );
    let tti = await getLoadingTime({ url, waitFor: '#fc_widget', searchInFrame: '.list-sub-title', searchFrame: true, frameName: 'fc_widget' });

    let data = {
      'fcp': fcp,
      'tti': tti,
      'tbt': tti - fcp
    };

    res.end(JSON.stringify(data));
  }
  catch (err) {
    console.log('error', err)
    res.send(JSON.stringify(err))
  }
});

app.post('/fcp', async (req, res) => {
  try {
    var url = req.body.url;
    let fcp = await getFCP(url, '#fc_widget');
    console.log('fcp', fcp)
    res.end(JSON.stringify({fcp}));
  }
  catch (err) {
    console.log('error', err)
    res.send(JSON.stringify(err))
  }
});

app.post('/lcp', async (req, res) => {
  try {
    var url = req.body.url;
    let tti = await getLCP(url, '#fc_widget');
    console.log('tti', tti)
    res.end(JSON.stringify(tti));
  }
  catch (err) {
    console.log('error', err)
    res.send(JSON.stringify(err))
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Started on PORT ${port}`);
});