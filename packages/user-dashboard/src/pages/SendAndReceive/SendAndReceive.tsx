import { Box, Grid } from "@material-ui/core";
import React, { useEffect } from "react";

import PageWrapper from "@user-dashboard/components/PageWrapper";
import { useLayoutContext, useStoreContext } from "@user-dashboard/contexts";

const SendAndReceive: React.FC = () => {
  const { handleError } = useLayoutContext();
  const { hypernetWebIntegration } = useStoreContext();

  useEffect(() => {
    hypernetWebIntegration.webUIClient
      .renderFundWidget({
        selector: "fund-wrapper",
        includeBoxWrapper: true,
        bodyStyle: { padding: "0 25% 15px 25%" },
      })
      .mapErr(handleError);

    hypernetWebIntegration.webUIClient
      .renderBalancesWidget({
        selector: "balances-wrapper",
        includeBoxWrapper: true,
        bodyStyle: { padding: "0 25% 15px 25%" },
      })
      .mapErr(handleError);
  }, []);

  return (
    <PageWrapper label="SEND & RECEIVE">
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Box id="fund-wrapper"></Box>
        </Grid>
        <Grid item xs={6}>
          <Box id="balances-wrapper"></Box>
        </Grid>
      </Grid>
    </PageWrapper>
  );
};

export default SendAndReceive;
