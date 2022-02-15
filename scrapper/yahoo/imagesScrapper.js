const rp = require('request-promise');
const cheerio = require('cheerio');

const extractInfoFromUrl = (url) => {
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
}

const scarpYahooImages = async (query) => {

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
        ...extractInfoFromUrl(url),
        preview,
      };
      return data;
    })
    .get();

  return Promise.all(urls);
}

module.exports = scarpYahooImages