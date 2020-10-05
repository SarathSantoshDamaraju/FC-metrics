const puppeteer = require('puppeteer');

async function getMetrics(url, waitFor = '') {
  console.log('metrics with URL', url);

  const browser = await puppeteer.launch({
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  await page.setDefaultTimeout(60000);
  await page.goto(url);
 
  if(waitFor) {
    console.log('waiting for', waitFor)
    await page.waitForSelector(waitFor);
  }
  const metrics = await page.metrics();

  console.log('metrics calculated')
  await browser.close();
  return metrics;
}

module.exports = {getMetrics};