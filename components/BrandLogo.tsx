"use client";

interface Props {
  className?: string;
  /** "dark" = black "Project" on light bg · "light" = white "Project" on dark bg */
  variant?: "dark" | "light";
  /** @deprecated kept for backwards compat — SVG already contains the text */
  showText?: boolean;
}

export default function BrandLogo({ className = "w-40", variant = "dark" }: Props) {
  const projectColor = variant === "light" ? "#ffffff" : "#000000";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="175 252 1080 178"
      className={className}
      aria-label="ProjectHub."
      role="img"
    >
      <text x="234" y="402" fontSize="150" fontWeight="400">
        <tspan
          fontFamily="'Devroye', 'Impact', 'Arial Black', sans-serif"
          fill={projectColor}
        >
          Project
        </tspan>
        <tspan
          fontFamily="'Dela Gothic One', 'Impact', 'Arial Black', sans-serif"
          fill="#fd8e00"
        >
          Hub.
        </tspan>
      </text>
    </svg>
  );
}
