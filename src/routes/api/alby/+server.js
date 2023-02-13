import dotenv from 'dotenv';
import { json, error } from '@sveltejs/kit';
if (!process.env.ALBY_ID) {
	dotenv.config();
}

const { ALBY_ID, ALBY_SECRET } = process.env;

export async function GET({ url }) {
	try {
		console.log(ALBY_ID, ' ', ALBY_SECRET);
		return json([]);
	} catch (err) {
		console.error('alby err: ', err);
		throw error(500, { message: err });
	}
}
