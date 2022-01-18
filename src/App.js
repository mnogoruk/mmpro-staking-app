import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";
import StakingPage from "./pages/StakingPage";
import StakingPage2 from "./pages/StakingPage2";

const App = () => {


  return (
    <>
      <Switch>
        {/* <Route path="/" exact>
          <StakingPage2 />
        </Route> */}
        <Route path="/bsc" exact>
          <StakingPage />
        </Route>
      </Switch>
    </>
  );
};

export default App;
