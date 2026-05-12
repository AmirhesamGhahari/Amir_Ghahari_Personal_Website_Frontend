/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type CodingHtmlSvgrepoComSvgIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function CodingHtmlSvgrepoComSvgIcon(
  props: CodingHtmlSvgrepoComSvgIconProps
) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      xmlSpace={"preserve"}
      version={"1.1"}
      viewBox={"0 0 512 512"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fill={"#f7b239"}
        d={"M249.405 42.25h252.602v274.792H249.405z"}
      ></path>

      <path
        fill={"#2ba5f7"}
        d={"M249.405 8.592h252.602v42.622H249.405z"}
      ></path>

      <path fill={"#e6e6e6"} d={"M9.99 355.427h492.017v137.989H9.99z"}></path>

      <path
        fill={"#999"}
        d={
          "M502.01 345.44H9.99c-5.517 0-9.99 4.473-9.99 9.99v137.989c0 5.517 4.473 9.99 9.99 9.99h492.02c5.517 0 9.99-4.473 9.99-9.99V355.43c0-5.517-4.473-9.99-9.99-9.99m-9.989 49.326H450.07V365.42h41.951zm0 13.319v32.678h-18.952v-32.678zm-55.27 75.344H387.6v-29.346h49.151zM75.249 365.419H124.4v29.347H75.249zM387.6 394.766V365.42h49.151v29.346zm26.152 13.319v32.678h-49.151v-32.678zm-39.471-13.319H325.13V365.42h49.151zm-22.999 13.319v32.678h-49.151v-32.678zm-39.472-13.319h-49.15V365.42h49.15zm-22.998 13.319v32.678H239.66v-32.678zm-39.471-13.319H200.19V365.42h49.151zm-22.999 13.319v32.678h-49.151v-32.678zm-39.471-13.319H137.72V365.42h49.151zm-22.999 13.319v32.678h-49.151v-32.678zm-62.47 0v32.678H52.25v-32.678zm22.998 45.997v29.346H75.249v-29.346zm13.319 0h49.151v29.346h-49.151zm62.471 0h111.62v29.346H200.19zm124.939 0h49.151v29.346h-49.151zm101.943-13.319v-32.678h32.676v32.678zM61.93 365.419v29.347H19.979v-29.347zm-22.999 42.666v32.678H19.979v-32.678zm-18.952 45.997H61.93v29.346H19.979zm430.091 29.347v-29.346h41.951v29.346z"
        }
      ></path>

      <path fill={"#2197d8"} d={"M9.99 8.594h193.677v308.45H9.99z"}></path>

      <path
        fill={"#f7b239"}
        d={
          "M44.22 50.8h125.202v15.983H44.22zm0 41.61h70.659v15.983H44.22zm0 41.609h125.202v15.983H44.22zm0 41.61h70.659v15.983H44.22zm0 41.61h125.202v15.983H44.22zm0 41.609h70.659v15.983H44.22z"
        }
      ></path>

      <path
        fill={"#2197d8"}
        d={
          "m328.089 228.44-48.974-48.974 48.974-48.975 10.361 10.361-38.615 38.614 38.615 38.614zm95.237 0-10.359-10.36 38.614-38.614-38.614-38.614 10.359-10.361 48.976 48.975zm-54.18 7.203-14.211-3.569 27.32-108.776 14.211 3.57z"
        }
      ></path>
    </svg>
  );
}

export default CodingHtmlSvgrepoComSvgIcon;
/* prettier-ignore-end */
