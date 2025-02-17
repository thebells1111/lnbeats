import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { LNB_BUNNY_PASSWORD } = process.env;

console.log(LNB_BUNNY_PASSWORD);

const LOCAL_FOLDER = './images';
const BUNNY_CDN_BASE = 'https://lnbeats.b-cdn.net/images/';
const FILES_URL = `https://lnbeats.b-cdn.net/`;

const BUNNY_UPLOAD_URL = `https://ny.storage.bunnycdn.com/lnbeats/images/`;

export async function checkFileExists(url) {
	try {
		const res = await fetch(url, { method: 'HEAD' });
		return res.ok;
	} catch (err) {
		console.error(`Error checking ${url}:`, err);
		return false;
	}
}

export async function uploadFile(filePath, fileName) {
	const fileBuffer = await fs.readFile(filePath);

	const res = await fetch(`${BUNNY_UPLOAD_URL}${fileName}`, {
		method: 'PUT',
		headers: {
			AccessKey: LNB_BUNNY_PASSWORD,
			'Content-Type': 'image/webp'
		},
		body: fileBuffer
	});

	if (res.ok) {
		console.log(`Uploaded: ${fileName}`);
	} else {
		console.error(`Failed to upload ${fileName}:`, await res.text());
	}
}

export async function processFile(file) {
	const filePath = path.join(LOCAL_FOLDER, file);
	const cdnUrl = `${BUNNY_CDN_BASE}${file}`;

	console.log(cdnUrl);
	const exists = await checkFileExists(cdnUrl);
	if (!exists) {
		console.log(`Missing on Bunny: ${file}, uploading...`);
		await uploadFile(filePath, file);
	} else {
		console.log(`Exists on Bunny: ${file}`);
	}
}

async function processFiles() {
	const files = await fs.readdir(LOCAL_FOLDER);
	const webpFiles = files.filter((f) => f.endsWith('.webp'));

	for (const file of webpFiles) {
		await processFile(file);
	}
}

processFiles().catch(console.error);
