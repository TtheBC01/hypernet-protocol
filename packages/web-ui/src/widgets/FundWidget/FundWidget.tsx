import React from "react";
import { Form, Formik } from "formik";
import { IRenderParams } from "@web-ui/interfaces";

import {
  GovernanceButton,
  GovernanceCard,
  GovernanceDialogSelectField,
  GovernanceField,
} from "@web-ui/components";
import { useFund } from "@web-ui/hooks";
import { useStyles } from "@web-ui/widgets/FundWidget/FundWidget.style";

interface IValues {
  amount: string;
  tokenAddress: string;
}

interface IFundWidget extends IRenderParams {}

const FundWidget: React.FC<IFundWidget> = ({ noLabel }: IFundWidget) => {
  const { tokenSelectorOptions, error, depositFundsV2 } = useFund();
  const classes = useStyles({ error });

  const handleFormSubmit = (values: IValues) => {
    depositFundsV2(values.tokenAddress, values.amount);
  };

  return (
    <GovernanceCard
      className={classes.wrapper}
      title={!noLabel ? "Deposit Funds" : undefined}
      description={
        !noLabel
          ? "Move tokens from your Ethereum wallet into your Hypernet Protocol account."
          : undefined
      }
    >
      <Formik
        enableReinitialize
        initialValues={
          {
            tokenAddress: tokenSelectorOptions[0]?.address,

            amount: "1",
          } as IValues
        }
        onSubmit={handleFormSubmit}
      >
        {({ handleSubmit, values }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <GovernanceDialogSelectField
                required
                title="Token Selector"
                name="tokenAddress"
                options={tokenSelectorOptions.map((option) => ({
                  primaryText: option.tokenName,
                  value: option.address,
                }))}
              />
              <GovernanceField
                required
                name="amount"
                title="Amount"
                type="input"
                placeholder="Type Amount"
              />

              <GovernanceButton
                fullWidth
                color="primary"
                variant="contained"
                onClick={handleSubmit}
                disabled={!(!!values.amount && !!values.tokenAddress)}
              >
                Fund my wallet
              </GovernanceButton>
            </Form>
          );
        }}
      </Formik>
    </GovernanceCard>
  );
};

export default FundWidget;
