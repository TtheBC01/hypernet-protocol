import HypernetWebIntegration, { IHypernetWebIntegration } from "@hypernetlabs/web-integration";

// Just an implementation to have the front end galileo package for development purposes
// do npm login and yarn install @hypernetwork/galileo-frontend to make it work in your local
/* import "./GalileoFrontend"; */

const client: IHypernetWebIntegration = new HypernetWebIntegration();

client.getReady().map(async (proxy) => {
  // client wants to get the balances and show it in a design of his design
  proxy.getBalances().map((balances) => {
    console.log("get balances from proxy inside ready: ", balances.assets);
  });

  // client wants to get the widget component ready with the data
  client.renderBalancesWidget();

  client.renderFundWidget();

  client.renderLinksWidget();

  client.renderPaymentWidget();
});

// try to call the proxy not just in ready but after some time in an async way
setTimeout(() => {
  //client.renderBalancesWidget();
}, 10000);

declare let window: any;
