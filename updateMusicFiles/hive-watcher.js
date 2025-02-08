import dhive from "@hiveio/dhive";

const MEDIUM_PODCAST = "podcast";
const MEDIUM_AUDIOBOOK = "audiobook";
const MEDIUM_BLOG = "blog";
const MEDIUM_FILM = "film";
const MEDIUM_MUSIC = "music";
const MEDIUM_NEWSLETTER = "newsletter";
const MEDIUM_VIDEO = "video";

const PodpingMedium = [
  MEDIUM_PODCAST,
  MEDIUM_AUDIOBOOK,
  MEDIUM_BLOG,
  MEDIUM_FILM,
  MEDIUM_MUSIC,
  MEDIUM_NEWSLETTER,
  MEDIUM_VIDEO,
];

const REASON_LIVE = "live";
const REASON_LIVE_END = "liveEnd";
const REASON_UPDATE = "update";

const PodpingReason = [REASON_LIVE, REASON_LIVE_END, REASON_UPDATE];

let lastBlockNumber = undefined;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const addressList = [
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.deathwing.me",
];

shuffleArray(addressList);
console.log(`Using API address "${addressList[0]}"`);
const client = new dhive.Client(addressList, {
  timeout: 6000,
  failoverThreshold: 1,
});

let validAccounts = ["podping"];

function handleBlock(block) {
  try {
    for (const transaction of block.transactions) {
      handleTransaction(transaction);
    }
  } catch (error) {
    console.error("Error handling block", error);
  }
}

function handleTransaction(transaction) {
  const blockNumber = transaction.block_num;
  lastBlockNumber = blockNumber;

  for (const operation of transaction.operations) {
    handleOperation(operation);
  }
}

function handleOperation(operation) {
  const operationType = operation[0];
  if (operationType === "custom_json") {
    const post = operation[1];
    handleCustomJsonPost(post);
  }
}

function handleCustomJsonPost(post) {
  if (post.id === "podping" || post.id.startsWith("pp_")) {
    handlePodpingPost(post);
  }
}

function handlePodpingPost(post) {
  if (!isAccountAllowed(post.required_posting_auths)) return;

  let postJson = JSON.parse(post.json);
  let version = postJson.version || postJson.v;
  let updateReason = postJson.reason || postJson.r || postJson.type;
  let medium = postJson.medium;

  let versionValue = parseFloat(version);
  if (isNaN(versionValue)) {
    if (
      updateReason !== undefined &&
      updateReason !== "feed_update" &&
      updateReason !== 1
    )
      return;
  } else {
    if (
      !(PodpingReason.includes(updateReason) && PodpingMedium.includes(medium))
    )
      return;
  }

  let iris = postJson.iris || [];
  let urls = postJson.urls || [];
  if (urls) iris = iris.concat(urls);
  if (postJson.url) iris = [postJson.url];

  console.log(`Update Reason: ${updateReason}, Medium: ${medium}`);
  console.log("URLs:", iris);
}

function isAccountAllowed(required_posting_auths) {
  const postingAuths = new Set(required_posting_auths);
  const accounts = new Set(validAccounts);
  const intersect = new Set([...accounts].filter((x) => postingAuths.has(x)));
  return intersect.size !== 0;
}

client.database
  .call("get_following", [validAccounts[0], null, "blog", 100])
  .then((followers) => {
    for (const follower of followers) {
      validAccounts = validAccounts.concat(follower.following);
    }
  })
  .then(startStream);

function startStream(blockNumber = undefined) {
  client.blockchain
    .getBlockStream({
      from: blockNumber,
      mode: dhive.BlockchainMode.Latest,
    })
    .on("data", handleBlock)
    .on("error", (error) => {
      console.error("Error occurred parsing stream", error);
    })
    .on("end", () => {
      console.log("Stream ended. Restarting...");
      startStream(lastBlockNumber);
    });
}
