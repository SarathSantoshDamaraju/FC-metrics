const puppeteer = require('puppeteer');

const Good3G = {
  'offline': false,
  'downloadThroughput': 1.5 * 1024 * 1024 / 8,
  'uploadThroughput': 750 * 1024 / 8,
  'latency': 40
};

function calcJank() {
  window.cumulativeLayoutShiftScore = 0;

  const observer = new PerformanceObserver((list) => {
   for (const entry of list.getEntries()) {
     if (!entry.hadRecentInput) {
       console.log("New observer entry for cls: " + entry.value);
       window.cumulativeLayoutShiftScore += entry.value;
     }
   }
  });

  observer.observe({type: 'layout-shift', buffered: true});

  document.addEventListener('visibilitychange', () => {
   if (document.visibilityState === 'hidden') {
     observer.takeRecords();
     observer.disconnect();
     console.log('CLS:', window.cumulativeLayoutShiftScore);
   }
  });
}


const getLCP = async (url, waitFor) => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox'],
    timeout: 10000
  });

 try {
   const page = await browser.newPage();
   const client = await page.target().createCDPSession();

   await client.send('Network.enable');
   await client.send('ServiceWorker.enable');
   await client.send('Network.emulateNetworkConditions', Good3G);
   await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
   // inject a function with the code from 
   // https://web.dev/cls/#measure-cls-in-javascript
   await page.evaluateOnNewDocument(calcJank);  
   await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000});
   await page.waitForSelector(waitFor);

   let cls = await page.evaluate(() => { 
     console.log(window)
       return window.cumulativeLayoutShiftScore;
   });

   browser.close();
   return cls;
 } catch (error) {
   console.log(error);
   browser.close();
 }
}

module.exports = getLCP