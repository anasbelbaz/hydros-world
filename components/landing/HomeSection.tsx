import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function HomeSection({
  children,
  backgroundUrl,
  className,
}: {
  children: (props: {
    backgroundProgress: MotionValue<number>;
    progress: MotionValue<number>;
  }) => ReactNode;
  backgroundUrl: string;
  className?: string;
}) {
  const target = useRef<HTMLDivElement>(null);

  const { scrollYProgress: backgroundProgress } = useScroll({
    target,
    offset: ["start end", "start start"],
  });

  const { scrollYProgress: progress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });

  return (
    <section
      className="relative h-screen min-h-[800px] overflow-hidden"
      ref={target}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          y: useTransform(backgroundProgress, [1, 0], ["0%", "-20%"]),
        }}
      />

      <div className="absolute inset-0 z-10">
        <div
          className={twMerge(
            "z-10 max-w-container-lg mx-auto py-28 h-full px-5 md:px-10",
            className
          )}
        >
          {children({ backgroundProgress, progress })}
        </div>
      </div>
    </section>
  );
}
