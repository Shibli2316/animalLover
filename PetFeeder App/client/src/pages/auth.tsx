import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { user, loading, error, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="mobile-container">
      <LoadingOverlay visible={loading} message="Signing in with Google..." />
      
      <div className="h-screen flex flex-col justify-center items-center p-6 orange-gradient animate-fade-in">
        {/* App Logo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PetFeeder</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Smart Pet Care Made Simple</p>
        </div>

        {/* Pet Illustration */}
        <div className="mb-8">
          <div className="w-80 h-48 bg-white/20 dark:bg-gray-800/20 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-24 h-24 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 12.5C4.5 17 8.5 16.5 8.5 16.5s-1-4.5 3.5-4.5 3.5 4.5 3.5 4.5 4-.5 4-4 0-6-4-6-3 1-3.5 3.5C11.5 6.5 8.5 7.5 4.5 12.5z"/>
              <circle cx="6.5" cy="11.5" r="1"/>
              <circle cx="17.5" cy="11.5" r="1"/>
              <path d="M12 15c-1.5 0-2.5 1-2.5 1s1 1 2.5 1 2.5-1 2.5-1-1-1-2.5-1z"/>
            </svg>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button 
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl p-4 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
          variant="outline"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium">Continue with Google</span>
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
