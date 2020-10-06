const puppeteer = require('puppeteer');

const getFCP = async (url, waitFor) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();

  console.log(`calculating FCP for ${url} with ${waitFor} selector`);

  await page.setDefaultTimeout(120000);
  await page.goto(url, { waitUntil : 'networkidle0'});
  await navigationPromise;
  await page.waitForSelector(waitFor);
  let frame = page.frames().find(frame => frame.name() === 'fc_widget');

  let firstContentfulPaint = JSON.parse(
    await frame.evaluate(() =>
      JSON.stringify(performance.getEntriesByName('first-contentful-paint'))
    )
  );

  console.log(`First paint: ${firstContentfulPaint[0].startTime}`);
  await browser.close();

  return firstContentfulPaint[0].startTime/1000;
};

module.exports = getFCP;