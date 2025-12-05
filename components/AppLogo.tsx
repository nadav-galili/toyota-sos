'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function AppLogo() {
  const pathname = usePathname();
  const isDriverPage = pathname?.startsWith('/driver');

  return (
    <div
      className={
        isDriverPage
          ? 'absolute top-2 right-2 z-50'
          : 'absolute top-4 right-4 z-50 w-40 h-40'
      }
    >
      <Image
        src="/icons/icon-fresh-192.jpg"
        alt="Toyota SOS"
        width={isDriverPage ? 56 : 100}
        height={isDriverPage ? 56 : 100}
        className={
          isDriverPage
            ? 'rounded-lg shadow-sm bg-white/90 backdrop-blur-sm border border-red-200 w-14 h-14'
            : 'rounded-xl shadow-md bg-white/90 backdrop-blur-sm border border-red-200'
        }
        priority
      />
    </div>
  );
}

