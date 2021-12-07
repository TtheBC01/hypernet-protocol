import { Box, Grid } from "@material-ui/core";
import React, { useEffect } from "react";

import PageWrapper from "@user-dashboard/components/PageWrapper";
import { useLayoutContext, useStoreContext } from "@user-dashboard/contexts";

const Summary: React.FC = () => {
  const { handleError } = useLayoutContext();
  const { hypernetWebIntegration } = useStoreContext();

  useEffect(() => {
    hypernetWebIntegration.webUIClient
      .renderBalancesWidget({
        selector: "balances-wrapper",
      })
      .mapErr(handleError);

    hypernetWebIntegration.webUIClient
      .renderGatewaysWidget({
        selector: "gateway-list-wrapper",
      })
      .mapErr(handleError);

    hypernetWebIntegration.webUIClient
      .renderLinksWidget({
        selector: "payments-wrapper",
      })
      .mapErr(handleError);

    hypernetWebIntegration.webUIClient
      .renderStateChannelsWidget({
        selector: "state-channels",
      })
      .mapErr(handleError);

    hypernetWebIntegration.webUIClient
      .renderPublicIdentifierWidget({
        selector: "public-identifier",
      })
      .mapErr(handleError);
  }, []);

  return (
    <PageWrapper label="Summary">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box id="public-identifier"></Box>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box id="state-channels"></Box>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box id="payments-wrapper"></Box>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box id="balances-wrapper"></Box>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box id="gateway-list-wrapper"></Box>
        </Grid>
      </Grid>
    </PageWrapper>
  );
};

export default Summary;
