import React from 'react';

interface NetworkBannerProps {
  isRetrying: boolean;
}

export const NetworkBanner: React.FC<NetworkBannerProps> = ({ isRetrying }) => {
  if (!isRetrying) return null;

  return (
    <div className="rounded-xl border border-black bg-[#fed7aa] px-3 py-1.5 text-center text-xs font-bold text-black shadow-[1.5px_1.5px_0px_#000]">
      Unable to connect to server. Retrying...
    </div>
  );
};
