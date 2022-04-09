import React from "react";

export default function TabComp(props) {
  const { tabIndex, setTabIndex, fixedAPY } = props;

  return (
    <div>
      <div className="w-full mx-0 mt-4 mb-1 rounded">
        <ul className="flex justify-start">
          <li
            onClick={() => setTabIndex(1)}
            className={
              tabIndex === 1
                ? "text-sm border-none py-1 px-4 rounded-md text-black mr-1 cursor-default bg-white"
                : "text-sm text-white py-1 px-4 mr-1 cursor-pointer bg-none"
            }
          >
            <p className="font-normal  m-0 p-0">Flexible Stake</p>
          </li>
          <li
            onClick={() => setTabIndex(2)}
            className={
              tabIndex === 2
                ? "text-sm border-none py-1 px-4 rounded-md text-black mr-1 cursor-default bg-white"
                : "text-sm text-white py-1 px-4 mr-1 cursor-pointer bg-none"
            }
          >
            <p className="font-light  m-0 p-0">Fixed Stake ({fixedAPY})</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
