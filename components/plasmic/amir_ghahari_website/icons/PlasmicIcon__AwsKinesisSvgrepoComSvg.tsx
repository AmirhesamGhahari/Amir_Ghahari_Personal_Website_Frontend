/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type AwsKinesisSvgrepoComSvgIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function AwsKinesisSvgrepoComSvgIcon(
  props: AwsKinesisSvgrepoComSvgIconProps
) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      preserveAspectRatio={"xMidYMid"}
      version={"1.1"}
      viewBox={"-26.5 0 309 309"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fill={"#FCBF92"}
        d={"m0 172.087 127.754 58.81 127.752-58.81-127.752-5.294z"}
      ></path>

      <path
        fill={"#9D5025"}
        d={"M128.147 0 .059 63.881v90.136h153.589V12.751z"}
      ></path>

      <path
        fill={"#FCBF92"}
        d={"m.059 217.559 128.162 90.675L256 217.559l-128.055-18.633z"}
      ></path>

      <path
        fill={"#9D5025"}
        d={"M128.146 154.017h67.577V57.836l-19.733-7.893-47.844 13.955z"}
      ></path>

      <path
        fill={"#9D5025"}
        d={"M175.99 154.017h52.233V91.632l-14.941-4.481-37.292 6.33z"}
      ></path>

      <path
        fill={"#9D5025"}
        d={"M213.282 82.26v71.757h42.224L256 81.941l-12.826-5.124z"}
      ></path>

      <path
        fill={"#F68534"}
        d={
          "M128.147 0v154.017h25.501V12.751zm67.577 57.836-19.734-7.894v104.075h19.734zm32.5 33.796-14.942-4.481v66.866h14.942zm14.95 62.385H256V81.941l-12.826-5.124zm-115.42 30.846v46.033l127.752-31.844v-26.965zm0 77.918v45.453l128.245-64.12v-26.555z"
        }
      ></path>

      <path
        fill={"#9D5025"}
        d={
          "m.059 244.391 127.695 63.843v-45.786L.059 217.559zM0 199.051l127.754 31.845v-46.034L0 172.086z"
        }
      ></path>
    </svg>
  );
}

export default AwsKinesisSvgrepoComSvgIcon;
/* prettier-ignore-end */
