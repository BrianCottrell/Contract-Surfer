import React, { Component } from "react";
import { Button, Typography, Grid, TextField } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

import MyContract from "./contracts/MyContract.json";
import getWeb3 from "./utils/getWeb3";

import { theme } from "./utils/theme";
import Header from "./components/Header";
import "./App.css";

const GAS = 500000;
const GAS_PRICE = "20000000000";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    location1: "33.878727, -118.427179",
    location2: "33.148605, -117.353412",
    location3: "33.878727, -118.427179",
    location4: "33.148605, -117.353412",
    resultReceived: false,
    result: "0"
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      if (networkId !== 3) {
        throw new Error("Select the Ropsten network from your MetaMask plugin");
      }
      const deployedNetwork = MyContract.networks[networkId];
      const contract = new web3.eth.Contract(
        MyContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({ web3, accounts, contract });

      window.ethereum.on("accountsChanged", async accounts => {
        const newAccounts = await web3.eth.getAccounts();
        this.setState({ accounts: newAccounts });
      });

      // Refresh on-chain data every 1 second
      const component = this;
      async function loopRefresh() {
        await component.refreshState();
        setTimeout(loopRefresh, 1000);
      }
      loopRefresh();
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  refreshState = async () => {
    const resultReceived = await this.state.contract.methods
      .resultReceived()
      .call();
    const result = (
      await this.state.contract.methods.result().call()
    ).toString();
    this.setState({ resultReceived, result });
  };

  handleUpdateForm = (name, value) => {
    this.setState({ [name]: value });
  };

  handleRequestResult = async () => {
    await this.state.contract.methods
      .makeRequest(this.state.location1.toString())
      .send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
  };

  handleResetResult = async () => {
    await this.state.contract.methods
      .resetResult()
      .send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
  };

  render() {
    if (!this.state.web3) {
      return (
        <ThemeProvider theme={theme}>
          <div className="App">
            <Header />

            <Typography>Loading Web3, accounts, and contract...</Typography>
          </div>
        </ThemeProvider>
      );
    }
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <Header />

          <Typography variant="h5" style={{ marginTop: 32 }}>
            {`Please enter the surf venue locations you would like to select from`}
          </Typography>

          <Grid container style={{ marginTop: 32 }}>
            <Grid item xs>
              <Typography variant="h5" style={{ marginTop: 32 }}>
                Location 1
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" style={{ marginTop: 32 }}>
                Location 3
              </Typography>
            </Grid>
          </Grid>

          <Grid container style={{ marginTop: 32 }}>
            <Grid item xs>
              <TextField
                id="bet-amount"
                className="input"
                value={this.state.location1}
                onChange={e =>
                  this.handleUpdateForm("location1", e.target.value)
                }
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="bet-amount"
                className="input"
                value={this.state.location3}
                onChange={e =>
                  this.handleUpdateForm("location3", e.target.value)
                }
              />
            </Grid>
          </Grid>

          <Grid container style={{ marginTop: 32 }}>
            <Grid item xs>
              <Typography variant="h5" style={{ marginTop: 32 }}>
                Location 2
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" style={{ marginTop: 32 }}>
                Location 4
              </Typography>
            </Grid>
          </Grid>

          <Grid container style={{ marginTop: 32 }}>
            <Grid item xs>
              <TextField
                id="bet-amount"
                className="input"
                value={this.state.location2}
                onChange={e =>
                  this.handleUpdateForm("location2", e.target.value)
                }
              />
            </Grid>
            <Grid item xs>
              <TextField
                id="bet-amount"
                className="input"
                value={this.state.location4}
                onChange={e =>
                  this.handleUpdateForm("location4", e.target.value)
                }
              />
            </Grid>
          </Grid>

          <Typography variant="h5" style={{ marginTop: 32 }}>
            {`Result received: ${this.state.resultReceived}`}
          </Typography>

          <Typography variant="h5" style={{ marginTop: 32 }}>
            {`Result: ${Number(this.state.result.slice(6, 8)) / 10} Feet`}
          </Typography>

          <Grid container style={{ marginTop: 32 }}>
            <Grid item xs>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleResetResult()}
              >
                Reset Result
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleRequestResult()}
              >
                Request Result
              </Button>
            </Grid>
          </Grid>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
