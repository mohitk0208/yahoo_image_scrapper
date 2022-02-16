const rp = require("request-promise");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors")
const apiSlowDown = require("./middlewares/apiSlowDown")

const app = express();


const imagesRoutes = require("./routes/images-route");


const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

/**
 * this function extract some links and other info from a string using regex
 * @param {string} url
 * @author Mohit Kumar
 * @return {object}
 */
const extract_info = (url) => {
  const back = url.match(/(?<=back\=).*/)[0];
  const imgurl = back.match(/(?<=imgurl\=).*?(?=\&)/)[0];
  const rurl = back.match(/(?<=rurl\=).*?(?=\&)/)[0];
  const height = back.match(/(?<=h\=).*?(?=\&)/)[0];
  const width = back.match(/(?<=w\=).*?(?=\&)/)[0];
  const size = back.match(/(?<=size\=).*?(?=\&)/)[0];
  const name = back.match(/(?<=tt\=).*?(?=\&)/)[0].replace(/\+/g, " ");
  const info = {
    imgurl: "https://" + imgurl,
    rurl,
    height,
    width,
    size,
    name,
  };
  return info;
};

const getImages = async (query) => {
  const html = await rp(
    "https://in.images.search.yahoo.com/search/images?p=" + query
  ).catch((error) => console.log("Error : ", error));

  const $ = cheerio.load(html);

  const links = $("#sres li a.img");

  const urls = links
    .map((i, e) => {
      const url = decodeURIComponent($(e).prop("href"));
      const preview = $(e).children("img").prop("data-src");
      const data = {
        ...extract_info(url),
        preview,
      };
      return data;
    })
    .get();

  return Promise.all(urls);
};

app.get("/", (req, res) => {
  res.status(200);
  res.json({ message: "send requests at /api/getimage/:query" });
});

const response = {
  query: "",
  result: [
    {
      imgurl: "",
      rurl: "",
      height: "",
      width: "",
      size: "",
      name: "",
      preview: "",
    },
  ],
};

app.get("/test", (req, res) => {
  res.status(200).json(response);
});

app.get("/api/getimage/:query", async (req, res) => {
  const query = req.params.query;

  try {
    const result = await getImages(query);
    res.status(200).json({ query, result });
    console.log(`Successfully scrapped data (${query})`);
  } catch (err) {
    console.log("ERROR :", err);
  }

});

app.use("/api/images", apiSlowDown, imagesRoutes)

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => console.log(`Server started at http://localhost:${port} `));


/**
 * -> make a views folder that contain the frontend usage of the complete api.
 *
 * -> add rate limiting to the api
 * -> add error handling to the api
 * -> add documentation to the api
 * -> make README file
 */