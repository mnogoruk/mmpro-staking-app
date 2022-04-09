import React from "react";
import cx from "classnames";

export default ({
  color = "white",
  bgColor = "primary",
  showBorder = false,
  onClick,
  className,
  children,
  uppercase,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      className={cx(
        className,
        uppercase ? "uppercase" : "",
        showBorder ? "border" : "",
        "bg-" + bgColor,
        "hover:bg-" + bgColor + "-hover",
        "hover:border-" + bgColor + "-hover",
        "text-" + color,
        "hover:text-" + color + "-hover",
        "border-" + color,
        "hover:border-" + color + "-hover",
        "focus-within:outline-none",
        "focus-visible:outline-none",
        "focus:outline-none"
      )}
      disabled={disabled}
      style={{
        borderRadius: "5px",
        padding: "10px",
        fontSize: "14px",
        border: "none",
        fontWeight: "lighter",
      }}
    >
      {children}
    </button>
  );
};
