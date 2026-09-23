import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function computeParts(targetDate: string): CountdownParts {
  const totalSeconds = differenceInSeconds(new Date(targetDate), new Date());

  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isExpired: false };
}

export function useCountdown(targetDate: string): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(() => computeParts(targetDate));

  useEffect(() => {
    setParts(computeParts(targetDate));
    const interval = setInterval(() => {
      setParts(computeParts(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return parts;
}
