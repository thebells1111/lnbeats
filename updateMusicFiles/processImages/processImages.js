import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const IMAGE_FOLDER = path.resolve('images');
if (!fs.existsSync(IMAGE_FOLDER)) fs.mkdirSync(IMAGE_FOLDER);

function hashUrl(url) {
	return crypto.createHash('sha1').update(url).digest('hex');
}

async function downloadImage(url, index) {
	const hashedFilename = hashUrl(url);
	const filePath = path.join(IMAGE_FOLDER, hashedFilename + '.webp');

	// Check if the image already exists
	if (fs.existsSync(filePath)) {
		console.log(`Image already exists: ${filePath}`);
		return;
	}

	try {
		const { data, headers } = await axios.get(url, {
			responseType: 'arraybuffer'
		});
		const contentType = headers['content-type'];

		if (contentType.startsWith('image/gif')) {
			return;
		}

		await processImage(data, filePath);
		console.log(`Saved: ${index + 1} of ${length}`);
	} catch (err) {
		console.error(`Error downloading ${url}:`, err);
	}
}

async function checkGifAnimation(buffer) {
	const tempFile = path.join(IMAGE_FOLDER, 'temp.gif');
	fs.writeFileSync(tempFile, buffer);

	try {
		const { stdout } = await execAsync(`gifsicle --info ${tempFile}`);
		return stdout.includes('animation');
	} finally {
		fs.unlinkSync(tempFile);
	}
}

async function processImage(buffer, filePath) {
	const optimizedFile = filePath + '.webp';
	await sharp(buffer)
		.resize(120, 120, { fit: 'cover' })
		.toFormat('webp', { quality: 80 })
		.toFile(optimizedFile);
}

const dbAlbums = JSON.parse(fs.readFileSync('../../src/routes/dbAlbums.json', 'utf8'));
let length = dbAlbums.albums.length;

async function processAlbums() {
	for (let index = 0; index < length; index++) {
		const album = dbAlbums.albums[index];
		console.log(`\n${album.title}`);

		if (album.image) {
			await downloadImage(album.image, index);
		}

		album.item = [].concat(album.item || []);
		for (const song of album.item) {
			console.log(`\n${song.title}`);
			if (song.image) {
				await downloadImage(song.image, index);
			}
		}
	}
}

await processAlbums();
