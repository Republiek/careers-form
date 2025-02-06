exports.handler = async function (event, context) {
  try {
    const payload = JSON.parse(event.body);

    const scriptID = process.env.SCRIPT_ID;

    await fetch(`https://script.google.com/macros/s/${scriptID}/exec`, {
      method: "POST",
      redirect: "follow",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        values: payload.data,
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: "true" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        event: JSON.parse(event.body),
      }),
    };
  }
};
