const axios = require("axios");
const apiUrl = "https://api.github.com/orgs/boomtownroi";

// 1. OutputData:
// Follow all urls containing "api.github.com/orgs/BoomTownROI" in the path, and for responses with a 200 status code, retrieve and display all 'id' keys/values in the response objects. For all non-200 status codes, give some indication of the failed request. HINT: Devise a way for the end user to make sense of the id values, related to the original resource route used to retrieve the data.

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
    //all values into to an arr here...
    const isolatedValues = Object.values(response);
    //then filtered into a new arr if value contains url
    const matchesArr = isolatedValues.filter((value) => {
      if (JSON.stringify(value).includes("api.github.com/orgs/BoomTownROI")) {
        return value;
      }
    });
    return matchesArr;
  } catch (error) {
    console.log("error", error);
  }
};

returnMatches();

//need api calls for results of returnMatches (containing "api.github.com/orgs/BoomTownROI")
//for responses with a 200 status code, retrieve and display all 'id' keys/values in the response objects.

// 2. Perform Verifications:

// - On the top-level BoomTownROI organization details object, verify that the 'updated_at' value is later than the 'created_at' date.
const dateVerification = async () => {
  const details = await fetchTopLevelObject();
  if (details.updated_at > details.created_at) {
    console.log("Verified: updated_at occurs after created_at");
  } else {
    console.error("Failed: created_at occurs after updated_at date");
  }
};

dateVerification();

// - On the top-level details object, compare the 'public_repos' count against the repositories array returned from following the 'repos_url', verifying that the counts match. HINT: The public repositories resource only returns a default limit of 30 repo objects per request.
