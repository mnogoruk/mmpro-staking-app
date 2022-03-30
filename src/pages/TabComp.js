import React from "react";

export default function TabComp(props) {
  const { tabIndex, setTabIndex } = props;

  return (
    <>
      <div>
        <div
          className="xl:w-full xl:mx-0 h-12 hidden sm:block my-4 shadow rounded font-bold"
          style={{ background: "rgba(255, 255, 255, 0.15)" }}
        >
          <ul className="flex border-b px-5">
            <li
              onClick={() => setTabIndex(1)}
              className={
                tabIndex === 1
                  ? "text-sm border-primary pt-3 rounded-t text-primary mr-12 cursor-default"
                  : "text-sm text-white py-3 flex items-center mr-12 hover:text-primary cursor-pointer"
              }
            >
              <div className="flex items-center mb-3">Flexible Stake</div>
              {tabIndex === 1 && (
                <div className="w-full h-1 bg-primary rounded-t-md" />
              )}
            </li>
            <li
              onClick={() => setTabIndex(2)}
              className={
                tabIndex === 2
                  ? "text-sm border-primary pt-3 rounded-t text-primary mr-12 cursor-default"
                  : "text-sm text-white py-3 flex items-center mr-12 hover:text-primary cursor-pointer"
              }
            >
              <div className="flex items-center mb-3">
                Fixed Stake (APY = 0)
              </div>
              {tabIndex === 2 && (
                <div className="w-full h-1 bg-primary rounded-t-md" />
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
