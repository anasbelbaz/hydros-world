import type { ComponentProps } from "react";

export function DoubleArrowIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path
          d="M7 13L12 18L17 13M7 6L12 11L17 6"
          strokeWidth="1.125"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
