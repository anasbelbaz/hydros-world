import React from "react";

export default function TimeRemaining({
  startTime,
  small,
}: {
  small?: boolean;
  startTime: bigint;
}) {
  const calculateTimeRemaining = () => {
    if (!startTime) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const now = Math.floor(Date.now() / 1000);
    const startTimeSeconds = Number(startTime);
    const diffInSeconds = Math.max(0, startTimeSeconds - now);

    const days = Math.floor(diffInSeconds / (60 * 60 * 24));
    const hours = Math.floor((diffInSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(diffInSeconds % 60);

    return { days, hours, minutes, seconds };
  };

  // Get initial time remaining
  const [timeRemaining, setTimeRemaining] = React.useState(
    calculateTimeRemaining()
  );

  // Update the countdown every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="relative z-10 ">
      <div
        className={
          small
            ? "flex items-end justify-center gap-2"
            : "flex items-end justify-center gap-4 sm:gap-8 mb-6 sm:mb-8"
        }
      >
        {timeRemaining.hours > 0 && (
          <div className="flex items-center">
            <span className={small ? "text-primary" : "countdown-digit"}>
              {timeRemaining.days}
            </span>
            <span className={small ? "text-white/70" : "countdown-label"}>
              D
            </span>
          </div>
        )}
        {timeRemaining.hours > 0 && (
          <div className="flex items-center">
            <span className={small ? "text-primary" : "countdown-digit"}>
              {timeRemaining.hours}
            </span>
            <span className={small ? " text-white/70" : "countdown-label"}>
              H
            </span>
          </div>
        )}
        {timeRemaining.minutes > 0 && (
          <div className="flex items-center">
            <span className={small ? "text-primary " : "countdown-digit"}>
              {timeRemaining.minutes}
            </span>
            <span className={small ? "text-white/70" : "countdown-label"}>
              M
            </span>
          </div>
        )}
        {timeRemaining.seconds > 0 && (
          <div className="flex items-center">
            <span className={small ? "text-primary" : "countdown-digit"}>
              {timeRemaining.seconds}
            </span>
            <span className={small ? "text-white/70 " : "countdown-label"}>
              S
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
