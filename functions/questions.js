exports.handler = async function (event, context) {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Careers?key=${process.env.API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
