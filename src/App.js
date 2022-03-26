import React from "react";
import { Switch, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import StakingPage from "./pages/StakingPage";
import Staking from "./pages/Staking";

const App = () => {
  return (
    <div className="w-full overflow-hidden main-gradient">
      <Header />
      <StakingPage />
      <Footer />
    </div>
  );
};

export default App;
