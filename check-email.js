const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const { email } = event.queryStringParameters;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email is required!" }),
    };
  }

  const API_KEY = process.env.HIBP_API_KEY;
  const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${email}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Netlify-Email-Checker",
        "hibp-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: response.statusText }),
      };
    }

    const breaches = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ email, breaches }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};