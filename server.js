const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { computeLogNormalScore } = require("lighthouse/lighthouse-core/audits/audit");

const options = {
  logLevel: 'info',
  disableDeviceEmulation: true,
  chromeFlags: ['--disable-mobile-emulation']
};

const {getMetrics} = require('./scripts/metrics');
const {lightHouse} = require('./scripts/lighthouse');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/light-house',async (req, res) => {
  try {
  var url=req.body.url;
  computeLogNormalScore(url);
  let data = await lightHouse(url, options);
  res.end(JSON.stringify(data));
  }
  catch(err) {
    res.send(JSON.stringify(err))
  }
});

app.post('/metrics',async (req, res) => {
  try {
  var url=req.body.url;
  let data = await getMetrics(url);
  res.end(JSON.stringify(data));
}
catch(err) {
  res.send(JSON.stringify(err))
}
});


const port = process.env.PORT || 5000;

app.listen(port,() => {
  console.log(`Started on PORT ${port}`);
});