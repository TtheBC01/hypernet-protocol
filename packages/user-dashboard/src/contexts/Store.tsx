import { IHypernetCore } from "@hypernetlabs/objects";
import { IHypernetWebIntegration } from "@hypernetlabs/web-integration";
import { ViewUtils, IViewUtils } from "@hypernetlabs/web-ui";
import React, { useState, useContext } from "react";

interface IStore {
  coreProxy: IHypernetCore;
  viewUtils: IViewUtils;
  hypernetWebIntegration: IHypernetWebIntegration;
}

interface IStoreProps {
  children: any;
  hypernetCore: IHypernetCore;
  hypernetWebIntegration: IHypernetWebIntegration;
}

const StoreContext = React.createContext<IStore>(undefined!);

export function StoreProvider({
  children,
  hypernetCore,
  hypernetWebIntegration,
}: IStoreProps) {
  const initialState: IStore = {
    coreProxy: hypernetCore,
    viewUtils: new ViewUtils(),
    hypernetWebIntegration,
  };

  return (
    <StoreContext.Provider value={initialState}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStoreContext = () => useContext(StoreContext);
