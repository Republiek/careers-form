exports.handler = async function (event, context) {
  try {
    const email = event.queryStringParameters.email;

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Entries?key=${process.env.API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    const entry = data.values.find((entry) => entry[1] === email);

    return {
      statusCode: 200,
      body: JSON.stringify(entry),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
