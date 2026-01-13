'use client';

import { useState } from 'react';

export default function HeroImage() {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return null; // 이미지가 없으면 아무것도 표시하지 않음
  }

  return (
    <div className="relative w-full h-full">
      <img
        src="/learnteam_image.webp"
        alt="LearnTeam"
        className="w-full h-auto rounded-lg shadow-2xl"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

