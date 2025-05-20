import { useEffect } from 'react';

interface ProfileProps {
  username?: string;
}

export default function Profile({ username }: ProfileProps) {
  useEffect(() => {
    // Load profile data
  }, [username]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      {/* Profile content will go here */}
    </div>
  );
} 