import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config({ path: '../.env' });

export default async function getAlbumsFromIndex() {
	const { PI_API_KEY, PI_API_SECRET } = process.env;

	if (!PI_API_KEY || !PI_API_SECRET) {
		console.error('Missing PI_API_KEY or PI_API_SECRET.');
		return;
	}

	try {
		const apiHeaderTime = Math.floor(Date.now() / 1000);
		const data4Hash = PI_API_KEY + PI_API_SECRET + apiHeaderTime;
		const hash4Header = crypto.createHash('sha1').update(data4Hash).digest('hex');

		const headers = {
			'X-Auth-Date': apiHeaderTime.toString(),
			'X-Auth-Key': PI_API_KEY,
			Authorization: hash4Header,
			'User-Agent': 'CurioHoster'
		};

		const url = 'https://api.podcastindex.org/api/1.0/podcasts/bymedium?medium=music&max=5000';
		const response = await axios.get(url, { headers });

		if (response && response.data) {
			const albums = response.data.feeds;
			const lastUpdateTime = albums.reduce(
				(max, obj) => (obj.lastUpdateTime > max ? obj.lastUpdateTime : max),
				0
			);

			let data = { lastUpdateTime, albums };

			// fs.writeFileSync(
			//   "albums.json",
			//   JSON.stringify(data).replace(/\r\n|\r/g, "\n"),
			//   "utf-8"
			// );

			return data;
		}
	} catch (err) {
		console.error('queryindex err:', err);
	}
}
