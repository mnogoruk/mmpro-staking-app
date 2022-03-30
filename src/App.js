import React from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import StakingPage from "./pages/StakingPage";

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
