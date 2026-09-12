import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

// Custom CSS animation for rotating cross inside an oval
// Tailwind cannot define keyframes directly, so we use inline @keyframes via style tag.
const spinnerStyle = `
@keyframes rotateCross {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      {/* Oval background */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-600" />
        {/* Rotating cross */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'rotateCross 1.5s linear infinite' }}
        >
          <div className="w-1 h-8 bg-teal-600" />
          <div className="w-8 h-1 bg-teal-600 absolute" style={{ transform: 'rotate(90deg)' }} />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
        {/* Inject the custom keyframes */}
        <style dangerouslySetInnerHTML={{ __html: spinnerStyle }} />
        {content}
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spinnerStyle }} />
      {content}
    </>
  );
};
