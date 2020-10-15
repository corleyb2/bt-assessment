const axios = require("axios");
const apiUrl = "https://api.github.com/orgs/boomtownroi";

// 1. OutputData:
// Follow all urls containing "api.github.com/orgs/BoomTownROI" in the path, and for responses with a 200 status code, retrieve and display all 'id' keys/values in the response objects. For all non-200 status codes, give some indication of the failed request. HINT: Devise a way for the end user to make sense of the id values, related to the original resource route used to retrieve the data.

// get top level object
const fetchTopLevelObject = async () => {
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Top-level pull failed");
  }
};

// returns array of matches (each value in top level object that contain the specified url)
const returnMatches = async () => {
  try {
    const response = await fetchTopLevelObject();
    // isolate the values of the k/v pairs returned from the fetch using Object.values
    const isolatedValues = Object.values(response);
    // filter values including the url into a new array called matchesArr
    const matchesArr = isolatedValues.filter((value) => {
      if (JSON.stringify(value).includes("api.github.com/orgs/BoomTownROI")) {
        return value;
      }
    });
    return matchesArr;
  } catch (error) {
    console.error("error returning matches", error);
  }
};

// follow matches & handle status codes, successful id k/v pairs, failed error messages

const paginate = async (url, data = [], page = 1) => {
  const target = page === 1 ? url : url + "?page=" + page;
  // starts w page 1 passed in, increments in the if conditional
  const fetchResponse = await axios.get(target);
  const length = fetchResponse.data.length;
  const allData = data.concat(fetchResponse.data);
  if (length > 0) {
    page++;
    return paginate(url, allData, page);
    // while any data returns, keep looping back thru the pagination function.
  }
  return allData;
  // once no more new data pulling, terminates the loop and returns the full data array
};

const followMatches = async () => {
  const matchUrls = await returnMatches();
  Promise.allSettled(matchUrls.map((url) => paginate(url))).then((results) => {
    results.forEach((result, i) => {
      if (result.status == "fulfilled") {
        console.log(`${matchUrls[i]}: Success!`);
        // result.value is an array, each index has its own id property
        const data = result.value;
        if (Array.isArray(data)) {
          data.map((entry) => console.log("ID: " + Number(entry.id)));
        } else {
          console.log("%%%--data--%%%", data);
          // console.log({ id: data.id });
        }
      }
      if (result.status == "rejected") {
        console.log(`${matchUrls[i]}: ${result.reason}`);
      }
    });
  });
};
followMatches();

// // 2. Perform Verifications:

// // - On the top-level BoomTownROI organization details object, verify that the 'updated_at' value is later than the 'created_at' date.
const dateVerification = async () => {
  const details = await fetchTopLevelObject();
  if (details.updated_at > details.created_at) {
    console.log("Verified: updated_at occurs after created_at");
  } else {
    console.error("Failed: created_at occurs after updated_at date");
  }
};
dateVerification();

// - On the top-level details object, compare the 'public_repos' count against the repositories array returned from following the 'repos_url', verifying that the counts match.
const repoVerification = async () => {
  const details = await fetchTopLevelObject();
  const countPublicRepos = details.public_repos;
  const publicRepoUrl = details.repos_url;
  try {
    const allRepos = await paginate(publicRepoUrl);
    if (countPublicRepos === allRepos.length) {
      console.log("Repo counts matches at " + countPublicRepos);
    } else {
      console.log(
        "Failed: Repo counts do NOT match" +
          countPublicRepos +
          " !== " +
          allRepos +
          "."
      );
    }
  } catch (error) {
    console.log("Error fetching repos", error);
  }
};
repoVerification();
