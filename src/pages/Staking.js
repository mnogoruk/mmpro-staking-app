import { useWeb3React } from "@web3-react/core";
import React, { useState } from "react";
import TabComp from "./TabComp";
import FixedStake from "./FixedStaking";
import FlexibleLayout from "./FlexibleLayout";

export default function Staking() {
  const { active } = useWeb3React();
  const [tabIndex, setTabIndex] = useState(1);

  return (
    <>
      {!active ? (
        <div>Conenct Wallet!</div>
      ) : (
        <div className="container mx-auto pb-18 px-4 force-height">
          <div className="w-full py-6 text-center">
            {/* <dov className="flex flex-row justify-around"> */}
            <div className="flex items-center justify-center flex-row w-full mb-24 mt-6">
              <div className="text-left">
                <p className="text-6xl mb-2 font-semibold">Launchpad</p>
                <p className="text-2xl mb-2 font-light">
                  {" "}
                  Connect your wallet &amp; Participate in IDO on MMPRO
                  Launchpad. For allocation you need to have MMPRO token.{" "}
                </p>
              </div>
              <div>
                <div className="transparentCard justify-between w-80 ml-13">
                  <h1> MMPRO price</h1>
                  <div className="flex items-center justify-center flex-row">
                    <p> 0.1321</p>
                    <h1> USD </h1>
                  </div>
                </div>
                <div className="transparentCard justify-between w-80 ml-13">
                  <h1> MMPRO marketcap</h1>
                  <div className="flex items-center justify-center flex-row">
                    <p> 13.1m</p>
                    <h1> USD </h1>
                  </div>
                </div>
                <div className="transparentCard justify-between w-80 ml-13">
                  <h1> MMPRO supply</h1>
                  <div className="flex items-center justify-center flex-row">
                    <p> 99.50m</p>
                    <h1> MMPRO </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-white text-center mt-6 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">
              <h1>Stake Your Token</h1>
            </div>
          </div>
          <TabComp tabIndex={tabIndex} setTabIndex={setTabIndex} />
          {tabIndex === 1 && <FlexibleLayout />}
          {tabIndex === 2 && <FixedStake />}
        </div>
      )}
    </>
  );
}
