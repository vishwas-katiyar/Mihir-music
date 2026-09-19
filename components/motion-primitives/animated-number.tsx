'use client';
import { cn } from '@/lib/utils';
import { motion, SpringOptions, useSpring, useTransform } from 'motion/react';
import React, { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
  /** Owner edit: custom formatter (e.g. Indian lakh grouping / currency). Defaults to toLocaleString(). */
  format?: (value: number) => string;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
  format,
}: AnimatedNumberProps) {
  const MotionComponent = motion.create(as as keyof React.JSX.IntrinsicElements);

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) => {
    const rounded = Math.round(current);
    return format ? format(rounded) : rounded.toLocaleString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
