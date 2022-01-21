import React, { useState } from "react";
import { initWeb3 } from "../utils.js";
import cx from "classnames";
import { useEffect } from "react/cjs/react.production.min";

const Header = () => {
  return (
    <header className="container px-4 mx-auto py-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <a href="https://fstaking.github.io/">
            <img
              src="/images/full-logo.png"
              width="180"
              className="cursor-pointer"
              alt="FStaking"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;