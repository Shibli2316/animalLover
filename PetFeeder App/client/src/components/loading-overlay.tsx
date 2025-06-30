import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  visible: boolean;
}

export function LoadingOverlay({ message = "Loading...", visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center space-y-4 mx-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-gray-900 dark:text-white font-medium text-center">{message}</p>
      </div>
    </div>
  );
}
