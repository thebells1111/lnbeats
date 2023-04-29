## LN Beats

First, you'll need a Podcast Index API Key and Secret. Go here [https://api.podcastindex.org/](https://api.podcastindex.org/) to request your Key and Secret. Your Key and Secret can't have a `#` symbol in either, because `#` is interpreted as a comment in the `.env` file, so a `#` will result in API call errors. If you're first attempt results in a Key or Secret with a `#`, delete that attempt and try again.

Next, copy your key and secret into the `.env copy` file. Rename that file to `.env`

Now, in your terminal, type `npm install`.

Once the install is complete, type `npm run dev` and open your browser to view the site.
