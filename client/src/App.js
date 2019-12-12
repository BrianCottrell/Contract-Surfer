import React, { Component } from "react";
import { Button, Typography, Grid, TextField } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

import MyContract from "./contracts/MyContract.json";
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';

import ReactTooltip from 'react-tooltip'

import getWeb3 from "./utils/getWeb3";

import { theme } from "./utils/theme";
import logo from './assets/logo.png'
import Header from "./components/Header";


import "./App.css";

const GAS = 500000;
const GAS_PRICE = "20000000000";
const REQUEST_INFO_TEXT = `This will tie 4 location transactions for today's forecast to the Contract Surfer blockchain`

const getFeetFromResult = (result) => Number(result.slice(6, 8)) / 10

const INITIAL_LOCATION_STATE = {
  location1: "33.878727, -118.427179",
  location2: "33.148605, -117.353412",
  location3: "34.406441, -119.836861",
  location4: "34.259463, -119.290774"
}

const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1IjoiY3NuIiwiYSI6ImNpdnRvam1qeDAwMXgyenRlZjZiZWc1a2wifQ.Gr5pLJzG-1tucwY4h-rGdA'
});


class App extends Component {
  state = {
    web3: null,
    accounts: null,
    ...INITIAL_LOCATION_STATE,
    contract: null,
    curIndex: 0,
    center: [-118.427179, 33.878727],
    zoom: [10],
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
        setTimeout(loopRefresh, 2000);
      }
      loopRefresh();
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  getLocations = () => {
    const {location1, location2, location3, location4} = this.state
    return [location1, location2, location3, location4]
  }

  refreshState = async () => {
    const resultReceived = {}
    const result = {}
    const locations = this.getLocations()
    for (var i = 0; i < locations.length; i ++) {
      const received_i = await this.state.contract.methods.getResultReceived(i).call();
      const result_i = (await this.state.contract.methods.getResult(i).call()).toString();
      resultReceived[i] = received_i
      result[i] = result_i
    }
    this.setState({ resultReceived, result });
    // console.group('refresh', resultReceived, result)
  };

  handleUpdateForm = (name, value) => {
    this.setState({ [name]: value });
  };

  handleRequestResult = async () => {
    const locations = this.getLocations()
    // TODO: group into one transaction or make parallel.
    for (var i = 0; i < locations.length; i ++) { 
      console.log('requesting', locations[i], i)
      const requestId = await this.state.contract.methods.makeRequest(locations[i].toString(), i).send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
      console.log('requested', requestId)
    }
  };

  _onClickMap(map, evt) {
    const locations = this.getLocations()
    const {curIndex} = this.state
    const loc = `${parseFloat(evt.lngLat.lat).toFixed(6)}, ${parseFloat(evt.lngLat.lng).toFixed(6)}`
    console.log('clicked', loc);
    switch (curIndex % locations.length) {
      case 0:
        this.setState({location1: loc})
        break
      case 1:
        this.setState({location2: loc})
        break
      case 2:
        this.setState({location3: loc})
        break
      case 3:
        this.setState({location4: loc})
        break
    }

    this.setState({curIndex: curIndex + 1})

  }

  handleResetResult = async () => {
    this.setState({...INITIAL_LOCATION_STATE})
    // await this.state.contract.methods
    //   .resetResult()
    //   .send({ from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE });
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

    const {result, resultReceived, center, zoom} = this.state
    const locations = this.getLocations()
    const parsedResults = []
    locations.map((loc, i) => {
      if (result[i]) {
        parsedResults.push(parseFloat(getFeetFromResult(result[i])))
      }
    })
    const hasAllResults = Object.values(resultReceived || {}).every(x => x)
    const bestResult = Math.max(...parsedResults)
    return (
      <ThemeProvider theme={theme}>
        <ReactTooltip />
        <div className="App" style={{background: "#e0c592"}}>
          <Header />

          <img src={logo} className='header-logo'/>

          <Typography variant="h5" style={{ marginTop: 12 }}>
            {`Please click the surf venue locations you would like to select from`}
          </Typography>
          <Map
                style="mapbox://styles/mapbox/outdoors-v10"
                containerStyle={{
                    height: 400,
                    width: "70vw",
                    marginLeft: "15vw",
                    marginTop: 20
                }}
                center={center}
                zoom={zoom}
                onClick={(a, b) => this._onClickMap(a, b)}>

            <Layer
            type="circle" radius={30} color={ 'red'} fillColor= 'red' fillOpacity= {1}>
                {/* <Feature coordinates={[-118.427179, 33.878727]}></Feature> */}
              {this.getLocations().map((point, i) => {
                point = point.split(',').map(parseFloat).reverse()
                return <Feature key={i} coordinates={point} />
              })}
            </Layer>

            </Map>

          <Grid container style={{ marginTop: 12 }}>
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
            {`Results ready: ${JSON.stringify(resultReceived)}`}
          </Typography>

          <Typography variant="h5" style={{ marginTop: 32 }}>
            {`Results: ${JSON.stringify(parsedResults)} Feet`}
          </Typography>

          {hasAllResults && <div>
            <Typography variant="h5" style={{ marginTop: 32 }}>
                Best Result: <b>{`${bestResult} Feet at Location ${parsedResults.indexOf(bestResult) + 1}`}</b>
            </Typography>
            <p className='success-text'>Looks like some good waves ahead.</p>
          </div>}

          <Grid container style={{ marginTop: 32 }}>
            <Grid item xs>
              <Button
                data-place='top'
                data-tip={REQUEST_INFO_TEXT}
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
