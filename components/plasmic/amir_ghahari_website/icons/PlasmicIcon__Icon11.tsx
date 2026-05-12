/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type Icon11IconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function Icon11Icon(props: Icon11IconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      viewBox={"0 0 24 24"}
      height={"1em"}
      width={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fill={"currentColor"}
        d={
          "M15 4a8 8 0 018 8 8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8m0 2a6 6 0 00-6 6 6 6 0 006 6 6 6 0 006-6 6 6 0 00-6-6m-1 2h1.5v3.78l2.33 2.33-1.06 1.06L14 12.4V8M2 18a1 1 0 01-1-1 1 1 0 011-1h3.83c.31.71.71 1.38 1.17 2H2m1-5a1 1 0 01-1-1 1 1 0 011-1h2.05L5 12l.05 1H3m1-5a1 1 0 01-1-1 1 1 0 011-1h3c-.46.62-.86 1.29-1.17 2H4z"
        }
      ></path>
    </svg>
  );
}

export default Icon11Icon;
/* prettier-ignore-end */
