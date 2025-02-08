const requiredChannelTags = [
  "id",
  "title",
  "url",
  "image",
  "description",
  "author",
  "lastUpdateTime",
  "newestItemPubdate",
  "generator",
  "podcastGuid",
  "explicit",
  "medium",
  "item",
];

const requiredItemTags = [
  "id",
  "title",
  "description",
  "guid",
  "datePublished",
  "enclosureUrl",
  "enclosureType",
  "duration",
  "explicit",
  "image",
];

export default function cleanAlbums(albums) {
  const filteredAlbums = albums.map((v) => {
    return requiredChannelTags.reduce((acc, tag) => {
      acc[tag] = v.hasOwnProperty(tag) ? v[tag] : null;
      if (tag === "item") {
        acc.item = acc.item || [];
        acc.item = acc.item.map((v) => {
          let i = requiredItemTags.reduce((acc, tag) => {
            acc[tag] = v.hasOwnProperty(tag) ? v[tag] : null;
            return acc;
          }, {});
          if (i.enclosureUrl) {
            i.enclosure = {
              "@_url": i.enclosureUrl,
              "@_type": i.enclosureType,
            };
          }
          return i;
        });
      }

      if (tag === "image") {
        acc.image = v.image = v.artwork || v.image || "";
      }
      return acc;
    }, {});
  });

  return filteredAlbums;
}

// fs.writeFileSync(
//   "cleaned_albums_with_songs.json",
//   JSON.stringify(filteredAlbums, null, 2),
//   "utf-8"
// );
