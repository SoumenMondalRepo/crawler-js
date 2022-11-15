const launchChrome = async () => {
  const puppeteer = require('puppeteer');

  const args = [
    '--window-size=1920,1080',
    '--disable-web-security',
    '--disable-features=IsolateOrigins',
    '--disable-site-isolation-trials',
    //"--lang=en-US,en"
  ];
 

  let chrome;
  try {
    chrome = await puppeteer.launch({
      headless: false, // run in not headless mode
      defaultViewport: null,
      //devtools: false, // disable dev tools
      //ignoreHTTPSErrors: true, // ignore https error
      args,
      //ignoreDefaultArgs: ["--disable-extensions"],
      executablePath: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, //using chrome instead of chromium
    });
  } catch(e) {
    console.error("Unable to launch chrome", e);
    return [() => {}, () => {}];
  }

  const exitChrome = async () => {
    if (!chrome) return;
    try {
      await chrome.close();
    } catch(e) {}
  }

  const newPage = async () => {
    try {
      const pages = await chrome.pages();
      const page = pages[0];
      const closePage = async () => {
        if (!page) return;
        try {
          await page.close();
        } catch(e) {}
      }
      return [page, closePage];
    } catch(e) {
      console.error("Unable to create a new page");
      return [];
    }
  };

  return [newPage, exitChrome];
};

module.exports = { launchChrome };