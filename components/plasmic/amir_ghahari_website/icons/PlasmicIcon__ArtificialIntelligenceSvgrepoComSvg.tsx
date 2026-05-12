/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type ArtificialIntelligenceSvgrepoComSvgIconProps =
  React.ComponentProps<"svg"> & {
    title?: string;
  };

export function ArtificialIntelligenceSvgrepoComSvgIcon(
  props: ArtificialIntelligenceSvgrepoComSvgIconProps
) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      viewBox={"0 0 200 200"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fill={"none"}
        stroke={"#220728"}
        strokeLinejoin={"bevel"}
        strokeWidth={"8"}
        d={
          "M106 27a23 23 0 1 0-43.55 10.33 18.45 18.45 0 0 0-9-2.33c-11 0-20 9.85-20 22a23.1 23.1 0 0 0 5.81 15.5A19 19 0 0 0 35 72c-12.7 0-23 12.54-23 28s10.3 28 23 28a19 19 0 0 0 4.31-.5A23.1 23.1 0 0 0 33.5 143c0 12.15 9 22 20 22a18.45 18.45 0 0 0 9-2.33A23 23 0 1 0 106 173z"
        }
      ></path>

      <path
        fill={"none"}
        stroke={"#220728"}
        strokeMiterlimit={"10"}
        strokeWidth={"8"}
        d={
          "M67.26 189.26a23 23 0 0 0 32.53-32.53H86.9M66.26 10.74a23 23 0 0 1 32.53 32.52H87.67M106 95H81l-31.75 29.76m-4.28-38.11 17.48 24.79m0 51.23L74.5 146M62.45 37.49 71 51v20m81 29h-48m3 31h24l12 21.67M107 70h24l12-21.67"
        }
      ></path>

      <circle
        cx={"171"}
        cy={"100"}
        r={"16"}
        fill={"none"}
        stroke={"#ffc548"}
        strokeMiterlimit={"10"}
        strokeWidth={"8"}
      ></circle>

      <circle
        cx={"149"}
        cy={"170"}
        r={"16"}
        fill={"none"}
        stroke={"#ffc548"}
        strokeMiterlimit={"10"}
        strokeWidth={"8"}
      ></circle>

      <circle
        cx={"149"}
        cy={"30"}
        r={"16"}
        fill={"none"}
        stroke={"#ffc548"}
        strokeMiterlimit={"10"}
        strokeWidth={"8"}
      ></circle>
    </svg>
  );
}

export default ArtificialIntelligenceSvgrepoComSvgIcon;
/* prettier-ignore-end */
