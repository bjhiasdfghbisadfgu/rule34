const cheerio = require('cheerio');
const got = require('got');
const {createWriteStream} = require('fs');
const {join} = require('path');

async function getImageUrlFromPageUrl(url) {
	const {body} = await got(url);
	const $ = cheerio.load(body);
	let imageUrl = null;

	try {
		imageUrl = $('img#image').toArray()[0].attribs.src.split('?')[0];
	} catch (e) {}

	return imageUrl;
}

function prepareImageUrl(url, idx) {
	return {
		url,
		filename: `${idx}.${url.slice(url.lastIndexOf('/') + 1).split('.')[1]}`
	};
}

function download(urlObject) {
	return new Promise((resolve) => {
		const pipeStream = createWriteStream(join(__dirname, 'data', urlObject.filename));

		pipeStream.on('finish', () => {
			resolve();
		});

		got.stream(urlObject.url).pipe(pipeStream);
	});
}

function wait(time = 60000) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

const STARTPOST = 0
const ENDPOST = 3421043;

const main = async () => {
	const compStart = Date.now();

	for (let i = STARTPOST; i <= ENDPOST;) {
		console.log(`POST ${i}/${ENDPOST}`);

		try {
			const iUrl = await getImageUrlFromPageUrl(`https://rule34.xxx/index.php?page=post&s=view&id=${i}`);

			if (iUrl) {
				await download(prepareImageUrl(iUrl, i));
			}

			i++
		} catch (e) {
			console.log('ERROR WHILE DOWNLOADING, WAITING');
			console.log(e);

			await wait();
		}
	}

	console.log(`TOOK: ${Date.now() - compStart}ms`);
};

main().then(() => {
	process.exit();
});
