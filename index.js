const rp = require("request-promise");
const cheerio = require("cheerio");
const express = require("express");
var fs = require("fs");
const { error } = require("console");

const app = express();
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
	const query = back.match(/(?<=p\=).*?(?=\&)/)[0];
	const height = back.match(/(?<=h\=).*?(?=\&)/)[0];
	const width = back.match(/(?<=w\=).*?(?=\&)/)[0];
	const size = back.match(/(?<=size\=).*?(?=\&)/)[0];
	const nameX = back.match(/(?<=tt\=).*?(?=\&)/)[0];
	const name = nameX.replace(/\+/g, " ");
	const info = {
		imgurl: "https://" + imgurl,
		rurl,
		query,
		query,
		height,
		width,
		size,
		name,
	};
	// console.log(info);
	return info;
};

const getImages = async (query) => {
	const html = await rp(
		"https://in.images.search.yahoo.com/search/images?p=" + query
	).catch((error) => console.log("Error : ", error));

	const $ = cheerio.load(html);

	const urls = $("#sres li a")
		.map(async (i, e) => {
			const url = decodeURIComponent($(e).prop("href"));
			extract_info(url);
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
	res.send("send requests at /{query}");
});

app.get("/favicon.ico", (req, res) => {
	res.statusCode = 404;
	res.send("");
});

app.get("/:query", (req, res) => {
	const query = req.params.query;
	getImages(query)
		.then((result) => {
			res.send({ result: result });
		})
		.then(() => {
			console.log(
				"Successfullly Scrapped data (",
				query.replace("+", " "),
				")"
			);
		})
		.catch((error) => {
			console.log("error : ", error);
		});
});

let port = process.env.PORT;
if (port == null || port == "") {
	port = 8000;
}
app.listen(port);
