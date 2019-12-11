const MyContract = artifacts.require("MyContract");

module.exports = async function() {
  const myContract = await MyContract.deployed();
  await myContract.resetResult();

  resultReceived = await myContract.resultReceived();
  result = await myContract.result();
  console.log(`Received result: ${resultReceived}`);
  console.log(`Initial result: ${result.toString()}`);

  console.log("Making a Chainlink request using a Honeycomb job...");
  requestId = await myContract.makeRequest.call("33.878727, -118.427179");
  await myContract.makeRequest("33.878727, -118.427179");
  console.log(`Request ID: ${requestId}`);

  console.log("Waiting for the request to be fulfilled...");
  while (true) {
    const responseEvents = await myContract.getPastEvents(
      "ChainlinkFulfilled",
      { filter: { id: requestId } }
    );
    if (responseEvents.length !== 0) {
      console.log("Request fulfilled!");
      break;
    }
  }

  resultReceived = await myContract.resultReceived();
  result = await myContract.result();
  console.log(`Received result: ${resultReceived}`);
  console.log(`Final result: ${result.toString()}`);

  process.exit();
};
