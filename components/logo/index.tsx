'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import useConfetti from '../../hooks/useConfetti';

export default function Logo() {
  const [hover, setHover] = useState(false);
  const { reward, isAnimating } = useConfetti('logo', 'emoji', {
    elementSize: 30,
    elementCount: 100,
    startVelocity: 20,
    spread: 170,
    emoji: [
      '🌎',
      '🌝',
      '🐒',
      '🤡',
      '🍦',
      '🍩',
      '🍪',
      '🍫',
      '🍬',
      '🍭',
      '🛸',
      '🐸',
      '🌈',
      '🎨',
      '🍄',
      '🧁',
    ],
  });

  useEffect(() => {
    if (hover && !isAnimating) {
      reward();
    }
  }, [hover, isAnimating]);

  return (
    <div onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
      <span id="logo" />
      <Image
        className="mx-auto logo"
        src="/logo.webp"
        alt="logo"
        width={376 / 10}
        height={463 / 10}
      />
    </div>
  );
}
