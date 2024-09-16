const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  let articles = [];

  // Continue fetching articles until we reach 100
  while (articles.length < 100) {
    // Wait for the articles to load
    await page.waitForSelector('.athing');

    // Extract articles from the current page
    const newArticles = await page.$$eval('.athing', articlesOnPage => {
      return articlesOnPage.map(article => ({
        id: article.id,
        title: article.querySelector('.titleline a').innerText,
        age: article.nextSibling.querySelector('.age').innerText
      }));
    });

    // Add newly fetched articles to the full list
    articles = articles.concat(newArticles);

    // If there are less than 100 articles, click the "More" button
    if (articles.length < 100) {
      const moreButton = await page.$('a.morelink');
      if (moreButton) {
        await moreButton.click();
        await page.waitForTimeout(2000); // Wait for the next page to load
      } else {
        break; // No more articles to load
      }
    }
  }

  console.log("Total articles fetched:", articles.length);
  console.log(articles);

  // Validate number of articles
  if (articles.length >= 100) {
    console.log("At least 100 articles found.");
  } else {
    console.error("Article count mismatch: found", articles.length);
  }

  // Output the article details for manual validation
  articles.forEach(article => {
    console.log(`${article.title} - Posted ${article.age}`);
  });

  // Close browser
  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();
