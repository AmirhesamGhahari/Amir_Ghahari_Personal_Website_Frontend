/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type ComputeEngineSvgrepoComSvgIconProps =
  React.ComponentProps<"svg"> & {
    title?: string;
  };

export function ComputeEngineSvgrepoComSvgIcon(
  props: ComputeEngineSvgrepoComSvgIconProps
) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      viewBox={"0 0 24 24"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <g data-name={"Product Icons"}>
        <path fill={"#aecbfa"} d={"M9 9h6v6H9z"}></path>

        <path
          fill={"#669df6"}
          d={"M11 2h2v4h-2zM7 2h2v4H7zm8 0h2v4h-2z"}
        ></path>

        <path
          fill={"#4285f4"}
          d={
            "M11 18h2v4h-2zm-4 0h2v4H7zm8 0h2v4h-2zm3-5v-2h4v2zm0 4v-2h4v2zm0-8V7h4v2z"
          }
        ></path>

        <path
          fill={"#669df6"}
          d={"M2 13v-2h4v2zm0 4v-2h4v2zm0-8V7h4v2z"}
        ></path>

        <path fill={"#aecbfa"} d={"M5 5v14h14V5Zm12 12H7V7h10Z"}></path>

        <path fill={"#669df6"} d={"M9 15h6l-3-3z"}></path>

        <path fill={"#4285f4"} d={"m12 12 3 3V9z"}></path>
      </g>
    </svg>
  );
}

export default ComputeEngineSvgrepoComSvgIcon;
/* prettier-ignore-end */
