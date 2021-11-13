const rp = require("request-promise");
const cheerio = require("cheerio");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

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

	const links = $("#sres li a");

	const urls = links
		.map((i, e) => {
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
	res.status(200);
	res.json({ message: "send requests at /{query}" });
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

app.get("/testsejvnajergu423bar453knmf423oi8r789egunaljnv", (req, res) => {
	res.status(200).json(response);
});

app.get("/api/getimage/:query", async (req, res) => {
	const query = req.params.query;
	try {
		const result = await getImages(query);
		res.status(200).json({ query, result });
		console.log(`Successfullly scrapped data (${query})`);
	} catch (err) {
		console.log("ERROR :", err);
	}

	// .then((result) => {
	// 	res.status(200);
	// 	res.json({ query, result });
	// });

	// .then(() => {
	// 	console.log(`Successfullly Scrapped data (${query})`);
	// })
	// .catch((err) => {
	// 	console.log("error : ", err);
	// });
});

let port = process.env.PORT;
if (port == null || port == "") {
	port = 8000;
}
app.listen(port, () => console.log("Server started"));
