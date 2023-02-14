import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import { json, error, text, redirect } from '@sveltejs/kit';

if (!process.env.ALBY_JWT) {
	dotenv.config();
}

const { ALBY_ID, ALBY_SECRET, ALBY_JWT } = process.env;

export async function GET({ url, cookies }) {
	try {
		let awt = cookies.get('awt');
		let token = awt ? jwt.verify(awt, ALBY_JWT) : undefined;
		// let account = await axios({
		// 	url: 'https://api.getalby.com/user/value4value',
		// 	headers: { Authorization: `Bearer ${resolve.data.access_token}` }
		// }).catch((error) => {
		// 	// console.log('error: ', error.response.data);

		// 	throw error(500, { message: error.response.data.error_description });
		// });

		if (token) {
			let balance = await axios({
				url: 'https://api.getalby.com/user/summary',
				headers: { Authorization: `Bearer ${token.access_token}` }
			}).catch((error) => {
				throw error(500, { message: error.response.data.error_description });
			});

			return json({ balance: balance.data });
		}

		return json({ loggedIn: false });
	} catch (err) {
		console.error('alby err: ', err.response);
		throw error(500, { message: err.response?.data?.error_description });
	}
}
