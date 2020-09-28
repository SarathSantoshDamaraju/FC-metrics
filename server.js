const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

const chromeLauncher = require('chrome-launcher');
const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
const request = require('request');
const util = require('util');
const { computeLogNormalScore } = require("lighthouse/lighthouse-core/audits/audit");

const options = {
  logLevel: 'info',
  disableDeviceEmulation: true,
  chromeFlags: ['--disable-mobile-emulation']
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/post',async (req, res) => {
  var url=req.body.url;
  computeLogNormalScore(url);
  let data = await lighthouseFromPuppeteer(url, options);
  res.end(JSON.stringify(data));
});

app.listen(3010,() => {
  console.log("Started on PORT 3010");
})


// functions

async function lighthouseFromPuppeteer(url, options, config = null) {
  // Launch chrome using chrome-launcher
  const chrome = await chromeLauncher.launch(options);
  options.port = chrome.port;

  // Connect chrome-launcher to puppeteer
  const resp = await util.promisify(request)(`http://localhost:${options.port}/json/version`);
  const { webSocketDebuggerUrl } = JSON.parse(resp.body);
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

  // Run Lighthouse
  const { lhr } = await lighthouse(url, options, config);
  await browser.disconnect();
  await chrome.kill();

  const json = reportGenerator.generateReport(lhr, 'json');

  const audits = JSON.parse(json).audits; // Lighthouse audits
  const first_contentful_paint = audits['first-contentful-paint'].displayValue;
  const total_blocking_time = audits['total-blocking-time'].displayValue;
  const time_to_interactive = audits['interactive'].displayValue;

  await browser.close();

  return {
    first_contentful_paint,
    total_blocking_time,
    time_to_interactive
  }
}