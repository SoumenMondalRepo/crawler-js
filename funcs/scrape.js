const scrapeNewArrivals = async (base_url) => {
  // import launchChrome and newPage from the browser.js file in the same directory
  const { launchChrome } = require('./browser');

  // Flow 1 => Launching chrome and opening a new tab/page
  const [newPage, exitChrome] = await launchChrome();
  const [page] = await newPage();

  // exit the function if the tab is not properly opened
  if (!page) return;

  // Flow 2 => Visiting a website's home page
  //const base_url = "https://www.24s.com/en-us/women/new-arrivals";
  //const url = "https://www.24s.com/";
  console.log(`opening ${base_url}`);
  try {
    await page.goto(base_url, {
      //waitUntil: "networkidle0", // wait till all network requests has been processed
      waitUntil: 'domcontentloaded', timeout: 100000 // wait till dom load completed
    });
  } catch(e) {
    console.error(`unable to visit ${base_url}`, e);
    await exitChrome(); // close chrome on error
    return; // exiting the function
  }

  //Flow 3 => getting pagination page limit and extracting each page urls
  const paginationLimit = await page.evaluate(() => {
    let num = document.querySelector('.pagination_pagination-text__iJIuF').innerText.match(/\d+/g).pop();
    return num ? parseInt(num) : 0;
  });

  const urls = []
  for (let i = 1; i <= paginationLimit; i++) {
    urls.push(`${base_url}?page=${i}`);
  }

  console.log(`total pagination urls fetched ${urls.length}`);

  //Flow 4 => looping over each urls and extracting product details
  const newArrivalProductData = []
  
  for (const url of urls) {
    //const page = await browser.newPage();
    console.log(`opening ${url}`);

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded", timeout: 100000 // wait till dom load completed
      });
    } catch (e) {
      console.error(`unable to visit ${url}`, e);
    }

    const prodData = await page.evaluate(() => {
      let ret = []
      let item = document.querySelectorAll('.product_wrapper-products___2JCk a');

      for ( var i = 0; i< item.length; i++ ) {
        let href = item[i].getAttribute('href');
        let id = href.match(/\_(.*?)\?/)[1];
        ret.push({'id': id, 'url': `https://www.24s.com${href}`});
      }
      return ret;
    });

    //flat pushing
    console.log(`products fetched ${prodData.length}`);
    newArrivalProductData.push(...prodData);

    //console.log(`closing ${url}`);
    //await page.close();
  }

  console.log(`total products fetched ${newArrivalProductData.length}`);

  //Flow 5 => saving data as a CSV
  saveAsCsv(newArrivalProductData);

  await exitChrome(); // close chrome
};

const saveAsCsv = async (data) => {
  const fileName = "newArrivalProducts.csv";

  const ObjectsToCsv = require("objects-to-csv");
  const csv = new ObjectsToCsv(data);
  try {
    await csv.toDisk(fileName);
    console.log(`data successfully saved as ${fileName} at ${process.cwd()}`);
  } catch(e) {
    console.error(`unable to save ${fileName}`, e);
  }
};


module.exports = scrapeNewArrivals;