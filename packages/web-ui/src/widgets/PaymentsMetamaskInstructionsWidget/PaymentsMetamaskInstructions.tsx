import React, { useEffect } from "react";
import { Box } from "@material-ui/core";

import { GovernanceTypography } from "@web-ui/components";
import { useLayoutContext } from "@web-ui/contexts";
import {
  CREDIT_CARD_LIGHT_ICON_URL,
  USER_LIGHT_ICON_URL,
  WALLET_LIGHT_ICON_URL,
} from "@web-ui/constants";
import { useStyles } from "@web-ui/widgets/PaymentsMetamaskInstructionsWidget/PaymentsMetamaskInstructionsWidget.style";

const PaymentsMetamaskInstructions: React.FC = () => {
  const classes = useStyles();
  const { setModalHeader, setHideModalWatermark } = useLayoutContext();

  useEffect(() => {
    setModalHeader("Wallet Connection and Signing");
    setHideModalWatermark(true);

    return () => {
      setModalHeader("");
      setHideModalWatermark(false);
    };
  }, []);

  return (
    <Box display="flex" flexDirection="column">
      <GovernanceTypography variant="h4" className={classes.description}>
        Use the MetaMask pop-up window at the right to:
      </GovernanceTypography>

      <Box display="flex" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <Box className={classes.iconContainer}>
            <img src={WALLET_LIGHT_ICON_URL} className={classes.icon} />
          </Box>
          <GovernanceTypography variant="body1" className={classes.step}>
            1. Connect your Metamask account
          </GovernanceTypography>
        </Box>

        <Box display="flex" flexDirection="column">
          <Box className={classes.iconContainer}>
            <img src={USER_LIGHT_ICON_URL} className={classes.icon} />
          </Box>
          <GovernanceTypography variant="body1" className={classes.step}>
            2. Sign to initialize a payment account
          </GovernanceTypography>
        </Box>

        <Box display="flex" flexDirection="column">
          <Box className={classes.iconContainer}>
            <img src={CREDIT_CARD_LIGHT_ICON_URL} className={classes.icon} />
          </Box>
          <GovernanceTypography variant="body1" className={classes.step}>
            3. Sign to payment gateway
          </GovernanceTypography>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentsMetamaskInstructions;
