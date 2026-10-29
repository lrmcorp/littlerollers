'use client';

import { useState } from 'react';

export const SCENE_PLATE =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/3ca5d10d-ea2f-4907-876f-33bde169469e.jpg';

/**
 * The home page hillside as a still backdrop for side panels. The sky-to-meadow gradient
 * underneath shows while the plate loads and stays if the plate host is unreachable.
 */
export function SceneBackdrop({ position = '18% center' }: { position?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#2f6f9f_0%,#6fa9d6_38%,#a9cfe6_56%,#8fbf6a_64%,#4f8a3c_100%)]"
      aria-hidden="true"
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element -- remote plate shared with the home hero
        <img
          className="size-full object-cover"
          style={{ objectPosition: position }}
          src={SCENE_PLATE}
          alt=""
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
