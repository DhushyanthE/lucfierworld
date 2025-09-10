
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function DeploymentStatus() {
  const [deploymentTime, setDeploymentTime] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>('just now');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - deploymentTime.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo('just now');
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`${minutes}m ago`);
      } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`${hours}h ago`);
      } else {
        const days = Math.floor(diff / 86400);
        setTimeAgo(`${days}d ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [deploymentTime]);

  const handleRedeploy = () => {
    setDeploymentTime(new Date());
    setTimeAgo('just now');
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className="bg-green-900/30 text-green-300 border-green-800/50 flex items-center gap-1"
      >
        <CheckCircle className="h-3 w-3" />
        Deployed {timeAgo}
      </Badge>
      
      <button
        onClick={handleRedeploy}
        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        title="Redeploy"
      >
        <Clock className="h-3 w-3" />
        Redeploy
      </button>
    </div>
  );
}
