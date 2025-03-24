import Image from "next/image";

export function HypeLogo({
  width = 10,
  height = 10,
  className = "ml-1",
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <span className="inline-flex items-center">
      <Image
        src="/images/hype-logo.png"
        alt="HYPE"
        width={width}
        height={height}
        className={className}
      />
    </span>
  );
}

export function Avatar({
  width = 30,
  height = 30,
  className = "ml-1",
  onClick,
}: {
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <span className="inline-flex items-center cursor-pointer" onClick={onClick}>
      <Image
        src="/images/avatar.png"
        alt="Avatar"
        width={width}
        height={height}
        className={className}
      />
    </span>
  );
}
