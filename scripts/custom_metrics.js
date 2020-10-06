const puppeteer = require('puppeteer');

async function getLoadingTime({url, waitFor = '', searchFrame = false, frameName = '', searchInFrame = ''}) {
  let frame, frameSelector, startTime = Date.now(), endTime = 1, waitType = searchFrame ? 'networkidle0' : 'load';
  const browser = await puppeteer.launch(), page = await browser.newPage();

  console.log(`calculating load time for ${url} with ${waitFor} selector, waitUntil is ${waitType} and frame search ${searchFrame ? 'enabled': 'disabled'}`);

  await page.setDefaultTimeout(120000);
  await page.goto(url, { waitUntil : waitType});

  // if search frame is enabled
  if (searchFrame && frameName && searchInFrame) {
    console.log(`searching frame with name ${frameName}`);
    frame = page.frames().find(frame => frame.name() === 'fc_widget')
    frameSelector = await frame.$eval(searchInFrame, (element) => element.className);
  } else if(waitFor) { // if there is no frame and provided waitFor, wait for it
    await page.waitForSelector(waitFor);
  }

  // if search frame is enabled and nothing found
  if(searchFrame && !frameSelector) return 0;

  endTime = Date.now();
  await browser.close();
  console.log(`calculated is ${(endTime - startTime) / 1000}`)
  
  return (endTime - startTime) / 1000
}

module.exports = { getLoadingTime }