// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import AvraToken_artifacts from '../../build/contracts/AvraToken.json'

// AvraToken is our usable abstraction, which we'll use through the code below.
var AvraToken = contract(AvraToken_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function () {
    var self = this;

    // Bootstrap the AvraToken abstraction for Use.
    AvraToken.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
      self.setTotalSupply();
    });

    AvraToken.deployed().then(function (instance) {
    var somebodyPayedEvent = instance.Received({}, { fromBlock: 0, toBlock: 'latest' });
    console.log("Start watching events");
    somebodyPayedEvent.watch(function (error, result) {
      if (!error) {
        console.log(result);
        sendCoin()
      } else {
        console.log(error);
      }
    });
  });

  },

  setStatus: function (message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  setTotalSupply: function () {
    var meta;
    AvraToken.deployed().then(function (instance) {
      meta = instance;
      return meta.totalSupply.call(account, { from: account });
    }).then(function (value) {
      var supp = document.getElementById("supply");
      supp.innerHTML = value.valueOf();
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error getting total supply value")
    })
  },

  refreshBalance: function () {
    var self = this;

    var meta;
    AvraToken.deployed().then(function (instance) {
      meta = instance;
      return meta.balanceOf.call(account, { from: account });
    }).then(function (value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
      console.log("balance " + value.valueOf())
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function (toAddress, amount) {
    
    var self = this;
    if(toAddress === "") {
    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;
    }
    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    AvraToken.deployed().then(function (instance) {
      meta = instance;
      return meta.transfer(receiver, amount, { from: account });
    }).then(function () {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function () {
  // // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  // if (typeof web3 !== 'undefined') {
  //   console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 AvraToken, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
  //   // Use Mist/MetaMask's provider
  //   window.web3 = new Web3(web3.currentProvider);
  // } else {
  //   console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  //   // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  //   window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  // }
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

  App.start();
});
