"use strict";
const functions = require("firebase-functions");
const axios = require("axios");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { onRequest, onCall } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const express = require("express");
const app = express();
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ keyFilename: "./service-account.json" });
require("firebase-functions/logger/compat");
const zlib = require("zlib");
const pako = require("pako");
const fetch = require("node-fetch");
const { Readable } = require("stream");
const Gunzip = require("gunzip-stream");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors")({ origin: true });
const {
  EndUserDetailsRequest,
  HttpBearerAuth,
  LinkTokenApi,
  AccountTokenApi,
  EmployeesApi,
} = require("@mergeapi/merge-hris-node");
const { JobsApi } = require("@mergeapi/merge-ats-node");
const { Duda } = require("@dudadev/partner-api");




exports.linkedinLogin = functions.https.onRequest(async (req, res) => {
  const code = req.body.code;
  const uri = req.body.uri;

  const token_link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://www.linkedin.com/oauth/v2/accessToken?code=${code}&grant_type=authorization_code&client_id=${
    functions.config().linkedin.client_id
  }&client_secret=${
    functions.config().linkedin.client_secret
  }&redirect_uri=${uri}`;

  let token;
  axios.post(token_link, { Origin: "linkedin.com" }).then((toke) => {
    token = toke.data.access_token;
  });
  res.status(200).json({ accessToken: token });
});

exports.getUser = onCall({ cors: true }, async (req) => {
  const email = req.data.email;
  initializeApp({
    credential: applicationDefault(),
  });
  const user = await getAuth().getUserByEmail(email);
  console.log(user);
  return user;
});

exports.getJobData = functions.https.onRequest(async (req, res) => {
  const url =
    "https://storage.googleapis.com/crewmate-job-data/job/202307/000992f2eeaba2197216d0d7803998f3.json.gz";
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      // Use the zlib module to decompress the file
      const buffer = Buffer.from(arrayBuffer);
      zlib.gunzip(buffer, (error, decompressedData) => {
        if (error) {
          console.error("Error decompressing JSON file:", error);
          return;
        }

        const jsonData = JSON.parse(decompressedData.toString());
        console.log(jsonData);
      });
    });
});

exports.getYoutubeVideos = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const google_api_key = "AIzaSyC06WK6zFThCw5OAdf2SBGEyNzksjYVeT0";
    try {
      const notable_companies = [
        "Meta",
        "Apple",
        "Amazon",
        "Netflix",
        "Google",
        "Microsoft",
        "McKinsey & Company",
        "Tesla",
        "PwC",
        "NVIDIA",
        "MongoDB",
        "JPMorgan Chase & Co.",
        "GE",
        "Figma",
        "Deloitte",
        "Citi",
        "Capital One",
        "Canva",
      ];
      let returned_videos = [];
      if (notable_companies.includes(req.body.company_name)) {
        const company_response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              key: google_api_key,
              part: "snippet",
              q: `How to become a ${req.body.title} at ${req.body.company_name}`,
              type: "video",
              maxResults: 3, // You can adjust this to get more or fewer results
            },
          }
        );

        returned_videos = company_response.data.items;

        const job_response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              key: google_api_key,
              part: "snippet",
              q: `${req.body.title} Interview Preparation`,
              type: "video",
              maxResults: 2, // You can adjust this to get more or fewer results
            },
          }
        );

        job_response.data.items.map((job_vid) => {
          returned_videos.push(job_vid);
        });
      } else {
        const job_response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              key: google_api_key,
              part: "snippet",
              q: `${req.body.title} Interview Preparation`,
              type: "video",
              maxResults: 4, // You can adjust this to get more or fewer results
            },
          }
        );

        returned_videos = job_response.data.items;

        const company_response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              key: google_api_key,
              part: "snippet",
              q: `${req.body.company_name}`,
              type: "video",
              maxResults: 1, // You can adjust this to get more or fewer results
            },
          }
        );

        company_response.data.items.map((job_vid) => {
          returned_videos.push(job_vid);
        });
      }
      res.status(200).json(returned_videos);
    } catch (error) {
      console.error("Error searching videos:", error);
      res.status(500).json([]);
    }
  });
});

exports.getJobRec = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const openai_url = "https://api.openai.com/v1/embeddings";
    const openai_key = "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";
    console.log("Text: " + req.body.text);
    let response = await axios.post(
      openai_url,
      {
        input: req.body.text,
        model: "text-embedding-ada-002",
      },
      {
        headers: {
          Authorization: `Bearer ${openai_key}`,
          "Content-Type": "application/json",
        },
      }
    );

    const embedding = response.data.data[0].embedding;
    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("jobs"); // Replace with your database name.

    const collection = db.collection(req.body.company_name); // Replace with your collection name.

    // Query for similar documents.
    const documents = await collection
      .aggregate([
        {
          $search: {
            index: "default",
            knnBeta: {
              vector: embedding,
              path: "plot_embedding",
              k: 3,
            },
          },
        },
      ])
      .toArray();

    await client.close();

    res.status(200).json(documents);
  });
});

const cachedData = {};

exports.getAllJobs = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const company_name = req.body.company_name;

    if (cachedData[company_name]) {
      // If cached, return the cached data
      res.status(200).json(cachedData[company_name]);
      return;
    }
    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("jobs"); // Replace with your database name.

    const collection = db.collection(req.body.company_name);

    const documents = await collection.find({}).toArray(); // Replace with your collection name.

    await client.close();

    cachedData[company_name] = documents;

    res.status(200).json(documents);
  });
});

exports.getComments = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db(req.body.collection); // Replace with your database name.

    const collection = db.collection(req.body.post);

    const documents = await collection.find({}).toArray(); // Replace with your collection name.

    await client.close();

    // cachedData[company_name] = documents;

    res.status(200).json(documents);
  });
});

exports.getCommentsUpdate = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("chat"); // Replace with your database name.

    const collection = db.collection(req.body.company);

    const result = await collection.findOne({title: req.body.title}); // Replace with your collection name.

    await client.close();

    // cachedData[company_name] = documents;

    res.status(200).json({
      result: result
    });
  });
});

exports.uploadComment = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db(req.body.collection); // Replace with your database name.

    const collection = db.collection(req.body.post);

    const newDocument = {
      text: req.body.text,
    };

    await collection.insertOne(newDocument);

    await client.close();

    // cachedData[company_name] = documents;

    res.status(200).json({});
  });
});

exports.uploadCommentUpdate = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("chat"); // Replace with your database name.

    const collection = db.collection(req.body.company);

    const newDocument = {
      text: req.body.text,
    };


    const result = await collection.updateOne(
      { title: req.body.title },
      { $push: { comments: req.body.text } }
    );

    await client.close();

    // cachedData[company_name] = documents;

    res.status(200).json({});
  });
});

exports.getMergeToken = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const auth = new HttpBearerAuth();

    auth.accessToken = "yJgTMVgQzzdpsxL7HTS2Z3-cxRciwq-D3RUiUm2GziFVHbSwlqzBVA";

    const apiInstance = new LinkTokenApi();
    apiInstance.setDefaultAuthentication(auth);

    const details = new EndUserDetailsRequest();
    details.end_user_origin_id = req.body.origin_id; // unique entity ID
    details.end_user_organization_name = req.body.organization_name; // your user's organization name
    details.end_user_email_address = req.body.email; // your user's email address
    details.categories = ["ats"]; // choose your category

    console.log(details);

    apiInstance
      .linkTokenCreate(details)
      .then(({ body }) => {
        res.status(200).json(body.link_token);
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

exports.getMergeAccount = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const auth = new HttpBearerAuth();
    // Swap YOUR_API_KEY below with your production key from:
    // https://app.merge.dev/keys
    auth.accessToken = "yJgTMVgQzzdpsxL7HTS2Z3-cxRciwq-D3RUiUm2GziFVHbSwlqzBVA";

    const apiInstance = new AccountTokenApi();
    apiInstance.setDefaultAuthentication(auth);

    const publicToken = req.body.token;

    apiInstance
      .accountTokenRetrieve(publicToken)
      .then(({ body }) => {
        res.status(200).json(body.account_token);
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

exports.getMergeJobs = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const auth = new HttpBearerAuth();
    auth.accessToken = "yJgTMVgQzzdpsxL7HTS2Z3-cxRciwq-D3RUiUm2GziFVHbSwlqzBVA";

    const apiInstance = new JobsApi();
    apiInstance.setDefaultAuthentication(auth);
    const xAccountToken =
      "gglo63Vt4pX9zLECcWErUz9g2uLZEL9tmS44114dn281zMQovzRQdg";
    const opts = {};

    apiInstance
      .jobsList(xAccountToken, opts)
      .then(({ body }) => {
        console.log(body);
        res.status(200).json(body.results);
      })
      .catch((err) => {
        console.log(error);
      });
  });
});

// exports.uploadMergeJobs = functions.https.onRequest(async (req, res) => {
//   cors(req, res, async () => {
//     const jobs = req.body.jobs

//   });
// });

exports.getDudaURL = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const duda = new Duda({
      user: "a11091ae7a",
      pass: "yYrSuAkmPu19",
    });

    const site_response = await duda.sites.create({
      template_id: "1068771",
      lang: "en",
      site_data: {
        external_uid: req.body.uid,
        site_business_info: {
          business_name: req.body.companyName,
          email: req.body.email,
          phone_number: "816-500-7458",
        },
      },
    });

    const site_name = site_response.site_name;

    console.log(site_response);

    if (req.body.isNewAccount == true) {
      await duda.accounts.create({
        account_name: req.body.email,
      });
      console.log("Worked");
    } else {
      await duda.accounts.get({
        account_name: req.body.email,
      });
    }

    await duda.accounts.permissions.grantSiteAccess({
      account_name: req.body.email,
      site_name: site_name,
      permissions: [
        "PUSH_NOTIFICATIONS",
        "REPUBLISH",
        "EDIT",
        "INSITE",
        "PUBLISH",
        "CUSTOM_DOMAIN",
        "RESET",
        "SEO",
        "STATS_TAB",
      ],
    });

    // const updates = [
    //   {
    //     type: "INNERHTML",
    //     key: "title",
    //     value: "Crewmate",
    //   },
    //   {
    //     type: "INNERHTML",
    //     key: "subtitle",
    //     value:
    //       "Are you looking to jump into a new industry? Watch our courses to learn the skills required to do so.",
    //   },
    //   {
    //     type: "DOMATTR",
    //     key: "title",
    //     value: "title-custom-value",
    //     refs: ["data-custom"],
    //   },
    //   {
    //     type: "DOMATTR",
    //     key: "subtitle",
    //     value: "subtitle-custom-value",
    //     refs: ["data-custom"],
    //   },
    //   {
    //     type: "CSS",
    //     key: "title",
    //     value: "red",
    //     refs: ["color"],
    //     important: true,
    //   },
    //   {
    //     type: "CSS",
    //     key: "subtitle",
    //     value: "red",
    //     refs: ["color"],
    //     important: true,
    //   },
    // ];

    // await duda.content.injectedContent.create({
    //   site_name: site_name,
    //   updates: updates,
    // });

    duda.accounts.authentication
      .getSSOLink({
        account_name: req.body.email,
        site_name: site_name,
        target: "EDITOR",
      })
      .then((response) => {
        res.status(200).json({
          url: response.url,
          response: response,
          site_name: site_name,
        });
      });
  });
});

exports.getAllDudaTemplates = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const duda = new Duda({
      user: "a11091ae7a",
      pass: "yYrSuAkmPu19",
    });

    duda.templates
      .list()
      .then((templates) =>
        res.status(200).json({
          templates: templates,
        })
      )
      .catch((err) => console.error(err));
  });
});

exports.getDudaURL = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    console.log(req.body.data.logo_url);
    const duda = new Duda({
      user: "a11091ae7a",
      pass: "yYrSuAkmPu19",
    });

    const site_response = await duda.sites.create({
      template_id: "1068771",
      lang: "en",
      site_data: {
        external_uid: req.body.uid,
        site_business_info: {
          business_name: req.body.companyName,
          email: req.body.email,
          phone_number: "816-500-7458",
        },
      },
    });

    const site_name = site_response.site_name;

    console.log(site_response);

    if (req.body.isNewAccount == true) {
      await duda.accounts.create({
        account_name: req.body.email,
      });
      console.log("Worked");
    } else {
      await duda.accounts.get({
        account_name: req.body.email,
      });
    }

    await duda.accounts.permissions.grantSiteAccess({
      account_name: req.body.email,
      site_name: site_name,
      permissions: [
        "PUSH_NOTIFICATIONS",
        "REPUBLISH",
        "EDIT",
        "INSITE",
        "PUBLISH",
        "CUSTOM_DOMAIN",
        "RESET",
        "SEO",
        "STATS_TAB",
      ],
    });

    const updates = [
      {
        type: "INNERHTML",
        key: "title",
        value: req.body.companyName,
      },
      {
        type: "INNERHTML",
        key: "subtitle",
        value:
          "Are you looking to jump into a new industry? Watch our courses to learn the skills required to do so.",
      },
      {
        type: "DOMATTR",
        key: "title",
        value: "title-custom-value",
        refs: ["data-custom"],
      },
      {
        type: "DOMATTR",
        key: "subtitle",
        value: "subtitle-custom-value",
        refs: ["data-custom"],
      },
      {
        type: "CSS",
        key: "title",
        value: "red",
        refs: ["color"],
        important: true,
      },
      {
        type: "CSS",
        key: "subtitle",
        value: "red",
        refs: ["color"],
        important: true,
      },
    ];

    await duda.content.injectedContent.create({
      site_name: site_name,
      raw_body: updates,
    });

    // await duda.sites.publish({
    //   site_name: site_name,
    // });

    duda.accounts.authentication
      .getSSOLink({
        account_name: req.body.email,
        site_name: site_name,
        target: "EDITOR",
      })
      .then((response) => {
        res.status(200).json({
          url: response.url,
          response: response,
          site_name: site_name,
        });
      });
  });
});

exports.getExistingDudaSite = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const duda = new Duda({
      user: "a11091ae7a",
      pass: "yYrSuAkmPu19",
    });

    const site_response = await duda.sites.create({
      template_id: "1068771",
      lang: "en",
      site_data: {
        external_uid: req.body.uid,
        site_business_info: {
          business_name: req.body.companyName,
          email: req.body.email,
          phone_number: "816-500-7458",
        },
      },
    });

    const site_name = req.body.site_name;

    console.log(site_response);

    if (req.body.isNewAccount == true) {
      await duda.accounts.create({
        account_name: req.body.email,
      });
      console.log("Worked");
    } else {
      await duda.accounts.get({
        account_name: req.body.email,
      });
    }

    await duda.accounts.permissions.grantSiteAccess({
      account_name: req.body.email,
      site_name: site_name,
      permissions: [
        "PUSH_NOTIFICATIONS",
        "REPUBLISH",
        "EDIT",
        "INSITE",
        "PUBLISH",
        "CUSTOM_DOMAIN",
        "RESET",
        "SEO",
        "STATS_TAB",
        "BLOG",
      ],
    });

    duda.accounts.authentication
      .getSSOLink({
        account_name: req.body.email,
        site_name: site_name,
        target: "EDITOR",
      })
      .then((response) => {
        res.status(200).json({
          url: response.url,
          response: response,
          site_name: site_name,
        });
      });
  });
});

exports.generateTopics = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const openai_url = "https://api.openai.com/v1/chat/completions";
    const openai_key = "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";
    let topics = ["Bras", "Undies", "Product Creation", "Girl Talk"]
    let result = []
    let titles = []
    
    for(var i = 0; i < topics.length; i++) {

      const topic = topics[i]

      const title_response = await axios.post(
        openai_url,
        {
          model: "gpt-4-1106-preview",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant designed to output JSON. For a given sub-topic related to a company which I will give you information about. I want you to output a list of 5 titles for posts related to that topic and company that can be posted in a reddit-style community built specifically for that company and their brand. The output of the JSON should be structured like so {titles: [title1, title2, title3, title4, title5]}",
            },
            {
              role: "user",
              content:
                `The company is Iteration Era. This is their story: iteration is a female-founded brand on a journey to discover the next era of intimates. We know what it’s like to step into a store and find nothing that fits or feels like you. We’ve seen the inside of fast fashion companies who dismiss or don't ask for what you actually want. So we are consciously creating a new brand—one that’s centered around you. You should have a say in what you put on your body—especially when it comes to intimates. You’ve been telling us your biggest pain points, the important details you’ve been searching for, and we hear you. With your feedback, our team is trailblazing to create sustainably-made intimates that make you feel comfortable, supported, and free. We’ve even kicked off our brand before we have products to sell, because we want your voice woven into everything we do. This is their vision: We believe in embracing the opportunity for continuous improvement.Our bodies are constantly growing and changing, while our minds are always discovering new elements of who we are. As we become better iterations of ourselves, our undergarments need to keep up. At iteration, our products are as dynamic as you—that's why we're exploring cutting-edge innovations and materials that solve problems with a sustainable mindset.You deserve to feel good about the businesses you buy from. We're a company dedicated to always improving to meet your needs and we know that it doesn't have to come at the cost of our planet. From design to production and shipping, we’re making a clean brand. Generate me a list of 5 titles for reddit-style topics for a Iteration Era community under the subtopic of ${topic}`,
            },
          ],
          max_tokens: 1000,
          seed: 42069
        },
        {
          headers: {
            "Authorization": `Bearer ${openai_key}`,
            "Content-Type": "application/json",
          },
        }
      )


      const topicJSON = JSON.parse(title_response.data.choices[0].message.content)
      console.log(topicJSON)
      const topicTitles = topicJSON["titles"]    
      console.log(topicTitles)

      for (var s = 0; s < topicTitles.length; s++) {
        titles.push({
          title: topicTitles[s],
          category: topic

        })
      }
    }

    const open_ai_image_url = "https://api.openai.com/v1/images/generations";

    for (const titleObject of titles) {
      const title = titleObject.title
      const category = titleObject.category
      console.log(titleObject)
      const imgResponse = await axios.post(
        open_ai_image_url,
        {
          model: "dall-e-3",
          prompt: `Generate an image for a reddit-style community post for the comopany Iteration Era. The title of the post is ${title} under the sub-topic ${category}. This is their story: iteration is a female-founded brand on a journey to discover the next era of intimates. We know what it’s like to step into a store and find nothing that fits or feels like you. We’ve seen the inside of fast fashion companies who dismiss or don't ask for what you actually want. So we are consciously creating a new brand—one that’s centered around you. You should have a say in what you put on your body—especially when it comes to intimates. You’ve been telling us your biggest pain points, the important details you’ve been searching for, and we hear you. With your feedback, our team is trailblazing to create sustainably-made intimates that make you feel comfortable, supported, and free. We’ve even kicked off our brand before we have products to sell, because we want your voice woven into everything we do. This is their vision: We believe in embracing the opportunity for continuous improvement.Our bodies are constantly growing and changing, while our minds are always discovering new elements of who we are. As we become better iterations of ourselves, our undergarments need to keep up. At iteration, our products are as dynamic as you—that's why we're exploring cutting-edge innovations and materials that solve problems with a sustainable mindset.You deserve to feel good about the businesses you buy from. We're a company dedicated to always improving to meet your needs and we know that it doesn't have to come at the cost of our planet. From design to production and shipping, we’re making a clean brand.`,
          n: 1,
          size: "1024x1024",
        },
        {
          headers: {
            "Authorization": `Bearer ${openai_key}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log(imgResponse.data)
      result.push({
        title: title,
        category: category,
        img_url: imgResponse.data.data[0].url,
        date: Date.now(),
        comments: [],
        imgPrompt: imgResponse.data.data[0].revised_prompt
      })
      await delay(1000); 
    }

    console.log(result)

    res.status(200).json({
      results: result

    })

  });
});


exports.searchPosts = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const openai_url = "https://api.openai.com/v1/embeddings";
    const openai_key = "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";
    console.log("Text: " + req.body.text);
    let response = await axios.post(
      openai_url,
      {
        input: req.body.text,
        model: "text-embedding-ada-002",
      },
      {
        headers: {
          Authorization: `Bearer ${openai_key}`,
          "Content-Type": "application/json",
        },
      }
    );

    const embedding = response.data.data[0].embedding;
    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("chat"); // Replace with your database name.

    const collection = db.collection(req.body.company_name); // Replace with your collection name.

    // Query for similar documents.
    const documents = await collection
      .aggregate([
        {
          $search: {
            index: "default",
            knnBeta: {
              vector: embedding,
              path: "plot_embedding",
              k: 5,
            },
          },
        },
      ])
      .toArray();

    await client.close();

    res.status(200).json(documents);
  });
});


exports.getPostsByCategory = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const category = req.body.category;

    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("chat"); // Replace with your database name.

    const collection = db.collection("massinvest");

    const documents = await collection.find({category: category}).toArray(); // Replace with your collection name.

    await client.close();

    res.status(200).json(documents);
  });
});

exports.getPostsByCategoryIteration= functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const category = req.body.category;

    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("chat"); // Replace with your database name.

    const collection = db.collection("iteration");

    const documents = await collection.find({category: category}).toArray(); // Replace with your collection name.

    await client.close();

    res.status(200).json(documents);
  });
});


exports.getPostsByCategoryVans = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const category = req.body.category;

    const mongodb_url =
      "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("chat"); // Replace with your database name.

    const collection = db.collection("vans-2");

    const documents = await collection.find({category: category}).toArray(); // Replace with your collection name.

    await client.close();

    res.status(200).json(documents);
  });
});



exports.voteForPoll = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const company = req.body.company;
    const id = new ObjectId(req.body.id);
    const optionIndex = req.body.index;

    const mongodb_url = "mongodb+srv://raj:Chicago23@crewmate-production.2ezis.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(mongodb_url);

    await client.connect();

    const db = client.db("chat"); // Replace with your database name.

    const collection = db.collection(company);

    const updateOperation = {
      $inc: {
        [`options.${optionIndex}.votes`]: 1,
        totalVotes: 1, // Increment totalVoted by 1
      },
    };

    const result = await collection.findOneAndUpdate(
      { _id: id },
      updateOperation,
      { returnDocument: 'after' } // Returns the updated document
    );

    console.log("Result")
    console.log(result)

    const votesArray = result.value.options.map(option => option.votes);
    console.log("Votes")
    console.log(votesArray)
    console.log("Total")
    console.log(result.value.totalVotes)

    await client.close();

    res.status(200).json({
      votes: votesArray,
      totalVotes: result.value.totalVotes,
    });
  });
});




exports.midjourneyTest = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const BASE_URL = 'https://api.thenextleg.io/v2';
    const AUTH_TOKEN = '0f00cd91-5c45-4bb3-b009-ab01983a2cdf';
    const AUTH_HEADERS = {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };
   const  prompt = 'A Rhinoceros in the Amazon with sun shining through, photorealistic, 4k'


   var data = JSON.stringify({
    "msg": prompt,
    "ref": "",
    "webhookOverride": "",
    "ignorePrefilter": "false"
  });
  
  var config = {
    method: 'post',
    url: 'https://api.thenextleg.io/v2/imagine',
    headers: { 
      'Authorization': `Bearer ${AUTH_TOKEN}`, 
      'Content-Type': 'application/json'
    },
    data : data
  };
  const postResponse = await axios(config);


  console.log(postResponse);


  var imgConfig = {
    method: 'get',
    url: `https://api.thenextleg.io/v2/message/${postResponse.data.messageId}`,
    headers: { 
      'Authorization': `Bearer ${AUTH_TOKEN}` 
    },
    params: {
      data: data
    }
  };
  
  

  const imgResponse = await axios(imgConfig);
  console.log(imgResponse);
  res.status(200).json({
    res: imgResponse.data

  });
  });
});


