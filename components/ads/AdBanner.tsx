'use client';

interface AdBannerProps {
  position?: 'sidebar' | 'bottom' | 'top';
}

export default function AdBanner({ position = 'sidebar' }: AdBannerProps) {
  // TODO: Replace with actual ad network (Google AdSense, etc.)

  return (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 ${
      position === 'sidebar' ? 'min-h-[250px]' : 'min-h-[90px]'
    } flex items-center justify-center`}>
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2">Advertisement</p>
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded p-4 max-w-sm">
          <p className="text-gray-700 text-sm mb-2">
            💡 <strong>Want to remove ads?</strong>
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Upgrade to Premium for just $5/month
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
