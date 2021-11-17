import { EthereumAccountAddress } from "@hypernetlabs/objects";
import { Box } from "@material-ui/core";
import { useStoreContext, useLayoutContext } from "@web-ui/contexts";
import { Form, Formik } from "formik";
import React from "react";
import { useAlert } from "react-alert";

import {
  GovernanceDialog,
  GovernanceButton,
  GovernanceField,
} from "@web-ui/components";
import { useStyles } from "@web-ui/widgets/CreateIdentityWidget/CreateIdentityWidget.style";

interface ICreateIdentityWidget {
  onCloseCallback: () => void;
  registryName: string;
  currentAccountAddress: EthereumAccountAddress;
}

interface ICreateIdentityFormValues {
  label: string;
  recipientAddress: string;
  tokenUri: string;
}

const CreateIdentityWidget: React.FC<ICreateIdentityWidget> = ({
  onCloseCallback,
  registryName,
  currentAccountAddress,
}: ICreateIdentityWidget) => {
  const alert = useAlert();
  const classes = useStyles();
  const { coreProxy } = useStoreContext();
  const { setLoading } = useLayoutContext();

  const handleError = (err) => {
    console.log("handleError err: ", err);
    setLoading(false);
    alert.error(err?.message || "Something went wrong!");
    onCloseCallback();
  };

  const handleCreateIdentity = ({
    label,
    recipientAddress,
    tokenUri,
  }: ICreateIdentityFormValues) => {
    setLoading(true);

    coreProxy
      .createRegistryEntry(
        registryName,
        label,
        EthereumAccountAddress(recipientAddress),
        tokenUri,
      )
      .map(() => {
        setLoading(false);
        onCloseCallback();
      })
      .mapErr(handleError);
  };

  return (
    <GovernanceDialog
      title="Create a New Identity"
      isOpen={true}
      onClose={onCloseCallback}
      content={
        <Box className={classes.wrapper}>
          <Formik
            initialValues={{
              label: "",
              recipientAddress: currentAccountAddress,
              tokenUri: "",
            }}
            onSubmit={handleCreateIdentity}
          >
            {({ handleSubmit, values }) => {
              return (
                <Form onSubmit={handleSubmit}>
                  <GovernanceField
                    title="Label"
                    name="label"
                    type="input"
                    placeholder="Enter a label"
                  />
                  <GovernanceField
                    title="Recipient Address"
                    required
                    name="recipientAddress"
                    type="input"
                    placeholder="Enter the recipient address"
                  />
                  <GovernanceField
                    title="Token URI"
                    required
                    name="tokenUri"
                    type="input"
                    placeholder="Enter the token URI"
                  />
                  <Box className={classes.actionContainer}>
                    <GovernanceButton
                      variant="outlined"
                      color="primary"
                      onClick={onCloseCallback}
                    >
                      Cancel
                    </GovernanceButton>
                    <GovernanceButton
                      className={classes.button}
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={!values.recipientAddress || !values.tokenUri}
                    >
                      Submit
                    </GovernanceButton>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Box>
      }
    />
  );
};

export default CreateIdentityWidget;