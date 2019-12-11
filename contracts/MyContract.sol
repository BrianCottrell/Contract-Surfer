pragma solidity 0.4.24;

import "../node_modules/chainlink/contracts/ChainlinkClient.sol";

contract MyContract is ChainlinkClient{
    uint256 private oraclePaymentAmount;
    bytes32 private jobId;

    mapping (int => bool) public resultReceived;
    mapping (int => bytes32) public result;
    mapping (bytes32 => int) public requestMap;

    constructor(
        address _link,
        address _oracle,
        bytes32 _jobId,
        uint256 _oraclePaymentAmount
        )
    public
    {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        oraclePaymentAmount = _oraclePaymentAmount;
    }

    function makeRequest(string location, int resultNumber) external returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, this, this.fulfill.selector);
        req.add("q", location);
        req.add("copyPath", "data.weather.6.hourly.2.swellHeight_ft");
        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), req, oraclePaymentAmount);
        requestMap[requestId] = resultNumber;
    }

    function getResult(int resultNumber) public view returns (bytes32 res) {
        res = result[resultNumber];
    }

   function getResultReceived(int resultNumber) public view returns (bool res) {
        res = resultReceived[resultNumber];
    }

    function fulfill(bytes32 _requestId, bytes32 _result)
    public
    recordChainlinkFulfillment(_requestId)
    {
        resultReceived[requestMap[_requestId]] = true;
        result[requestMap[_requestId]] = _result;
    }
}
