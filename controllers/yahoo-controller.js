const scarpYahooImages = require("../scrapper/yahoo/imagesScrapper");

async function getImages(req, res) {

  const query = req.params.query;

  try {
    const images = await scarpYahooImages(query);

    res.status(200).json({ query, results: images });
    console.log(`${query} images found`);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong!!" });
  }

}

exports.getImages = getImages;