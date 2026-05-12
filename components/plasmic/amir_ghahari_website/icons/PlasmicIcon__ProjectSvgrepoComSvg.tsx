/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type ProjectSvgrepoComSvgIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function ProjectSvgrepoComSvgIcon(props: ProjectSvgrepoComSvgIconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      mirrorInRtl={"true"}
      viewBox={"0 0 24 24"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fill={"currentColor"}
        d={
          "M8 6H5a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2m5 4H5a1 1 0 1 1 0-2h8a1 1 0 1 1 0 2m0 4H5a1 1 0 1 1 0-2h8a1 1 0 1 1 0 2"
        }
      ></path>

      <path
        fill={"currentColor"}
        d={
          "M18 2v8c0 .55-.45 1-1 1s-1-.45-1-1V2.5c0-.28-.22-.5-.5-.5h-13c-.28 0-.5.22-.5.5v19c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5V21c0-.55.45-1 1-1s1 .45 1 1v1c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V2C0 .9.9 0 2 0h14c1.1 0 2 .9 2 2"
        }
      ></path>

      <path
        fill={"currentColor"}
        d={
          "M23.87 11.882c.31.54.045 1.273-.595 1.643l-9.65 5.57c-.084.05-.176.086-.265.11l-2.656.66c-.37.092-.72-.035-.88-.314-.162-.278-.09-.65.17-.913l1.907-1.958a.8.8 0 0 1 .214-.167.03.03 0 0 1 .012-.015l9.65-5.57c.64-.37 1.408-.234 1.72.305z"
        }
      ></path>
    </svg>
  );
}

export default ProjectSvgrepoComSvgIcon;
/* prettier-ignore-end */
