import React from 'react';
import { Shield, CheckCircle, Star, Award, Zap } from 'lucide-react';
import { User } from '../types/user';

interface VerificationBadgeProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

interface VerificationLevel {
  level: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  minRequirements: {
    profileCompletion: number;
    endorsements: number;
    connections: number;
  };
}

const VERIFICATION_LEVELS: VerificationLevel[] = [
  {
    level: 0,
    name: 'Unverified',
    description: 'Profile needs completion and verification',
    icon: Shield,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    minRequirements: { profileCompletion: 0, endorsements: 0, connections: 0 }
  },
  {
    level: 25,
    name: 'Basic',
    description: 'Profile is partially complete',
    icon: Shield,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    minRequirements: { profileCompletion: 50, endorsements: 0, connections: 1 }
  },
  {
    level: 50,
    name: 'Verified',
    description: 'Profile is complete and verified',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    minRequirements: { profileCompletion: 80, endorsements: 2, connections: 3 }
  },
  {
    level: 75,
    name: 'Trusted',
    description: 'High-quality profile with community endorsements',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    minRequirements: { profileCompletion: 90, endorsements: 5, connections: 10 }
  },
  {
    level: 90,
    name: 'Expert',
    description: 'Recognized expert with strong community presence',
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    minRequirements: { profileCompletion: 95, endorsements: 10, connections: 20 }
  },
  {
    level: 100,
    name: 'Elite',
    description: 'Top-tier member with exceptional credentials',
    icon: Zap,
    color: 'text-gold-600',
    bgColor: 'bg-gradient-to-r from-yellow-200 to-orange-200',
    borderColor: 'border-yellow-400',
    minRequirements: { profileCompletion: 100, endorsements: 20, connections: 50 }
  }
];

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  user,
  size = 'md',
  showLabel = false,
  showTooltip = true,
  className = ''
}) => {
  // Calculate user's verification level based on their stats
  const calculateVerificationLevel = (): VerificationLevel => {
    const userStats = {
      profileCompletion: user.profileCompletionPercentage || 0,
      endorsements: user.endorsementsReceived || 0,
      connections: user.connectionsCount || 0
    };

    // Start from highest level and work down
    for (let i = VERIFICATION_LEVELS.length - 1; i >= 0; i--) {
      const level = VERIFICATION_LEVELS[i];
      const requirements = level.minRequirements;
      
      if (
        userStats.profileCompletion >= requirements.profileCompletion &&
        userStats.endorsements >= requirements.endorsements &&
        userStats.connections >= requirements.connections &&
        user.verificationLevel >= level.level
      ) {
        return level;
      }
    }

    return VERIFICATION_LEVELS[0]; // Default to unverified
  };

  // Get next verification level and progress
  const getProgressToNext = (): { nextLevel: VerificationLevel | null; progress: number } => {
    const currentLevel = calculateVerificationLevel();
    const currentIndex = VERIFICATION_LEVELS.findIndex(level => level.level === currentLevel.level);
    
    if (currentIndex === -1 || currentIndex === VERIFICATION_LEVELS.length - 1) {
      return { nextLevel: null, progress: 100 };
    }

    const nextLevel = VERIFICATION_LEVELS[currentIndex + 1];
    const userStats = {
      profileCompletion: user.profileCompletionPercentage || 0,
      endorsements: user.endorsementsReceived || 0,
      connections: user.connectionsCount || 0
    };

    // Calculate progress as percentage of requirements met
    const profileProgress = Math.min(userStats.profileCompletion / nextLevel.minRequirements.profileCompletion, 1);
    const endorsementProgress = Math.min(userStats.endorsements / nextLevel.minRequirements.endorsements, 1);
    const connectionProgress = Math.min(userStats.connections / nextLevel.minRequirements.connections, 1);
    
    const averageProgress = (profileProgress + endorsementProgress + connectionProgress) / 3;
    
    return { nextLevel, progress: Math.round(averageProgress * 100) };
  };

  const currentLevel = calculateVerificationLevel();
  const { nextLevel, progress } = getProgressToNext();
  const Icon = currentLevel.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      badge: 'w-5 h-5',
      icon: 'w-3 h-3',
      text: 'text-xs',
      container: 'gap-1'
    },
    md: {
      badge: 'w-6 h-6',
      icon: 'w-4 h-4',
      text: 'text-sm',
      container: 'gap-2'
    },
    lg: {
      badge: 'w-8 h-8',
      icon: 'w-5 h-5',
      text: 'text-base',
      container: 'gap-2'
    }
  };

  const config = sizeConfig[size];

  const badgeElement = (
    <div className={`inline-flex items-center ${config.container} ${className}`}>
      <div
        className={`
          ${config.badge} 
          ${currentLevel.bgColor} 
          ${currentLevel.borderColor}
          border-2 rounded-full flex items-center justify-center
          ${user.isVerified ? 'ring-2 ring-offset-1 ring-blue-400' : ''}
        `}
        title={showTooltip ? `${currentLevel.name}: ${currentLevel.description}` : undefined}
      >
        <Icon className={`${config.icon} ${currentLevel.color}`} />
      </div>
      
      {showLabel && (
        <span className={`${config.text} ${currentLevel.color} font-medium`}>
          {currentLevel.name}
        </span>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <div className="relative group">
        {badgeElement}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-64">
          <div className="space-y-2">
            <div className="font-semibold text-center">
              {currentLevel.name} Member
            </div>
            <div className="text-gray-300 text-center text-xs">
              {currentLevel.description}
            </div>
            
            {/* Current Stats */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Profile Completion:</span>
                <span>{user.profileCompletionPercentage || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>Endorsements:</span>
                <span>{user.endorsementsReceived || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Connections:</span>
                <span>{user.connectionsCount || 0}</span>
              </div>
            </div>

            {/* Progress to next level */}
            {nextLevel && (
              <div className="border-t border-gray-600 pt-2">
                <div className="text-xs text-gray-300 text-center mb-1">
                  Progress to {nextLevel.name}: {progress}%
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1.5">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-400 mt-1">
                  <div>Need: {nextLevel.minRequirements.profileCompletion}% profile, {nextLevel.minRequirements.endorsements} endorsements, {nextLevel.minRequirements.connections} connections</div>
                </div>
              </div>
            )}

            {/* Verification timestamp */}
            {user.isVerified && user.verifiedAt && (
              <div className="border-t border-gray-600 pt-2 text-xs text-gray-400 text-center">
                Verified {new Date(user.verifiedAt).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    );
  }

  return badgeElement;
};

// Helper component for displaying verification requirements
interface VerificationRequirementsProps {
  currentUser: User;
  className?: string;
}

export const VerificationRequirements: React.FC<VerificationRequirementsProps> = ({
  currentUser,
  className = ''
}) => {
  const currentLevel = VERIFICATION_LEVELS.find(level => {
    const userStats = {
      profileCompletion: currentUser.profileCompletionPercentage || 0,
      endorsements: currentUser.endorsementsReceived || 0,
      connections: currentUser.connectionsCount || 0
    };

    return (
      userStats.profileCompletion >= level.minRequirements.profileCompletion &&
      userStats.endorsements >= level.minRequirements.endorsements &&
      userStats.connections >= level.minRequirements.connections &&
      currentUser.verificationLevel >= level.level
    );
  }) || VERIFICATION_LEVELS[0];

  const nextLevelIndex = VERIFICATION_LEVELS.findIndex(level => level.level === currentLevel.level) + 1;
  const nextLevel = nextLevelIndex < VERIFICATION_LEVELS.length ? VERIFICATION_LEVELS[nextLevelIndex] : null;

  if (!nextLevel) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-green-800">
          <Award className="w-5 h-5" />
          <span className="font-semibold">Maximum Verification Level Achieved!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          You've reached the highest verification level. Keep engaging with the community to maintain your status.
        </p>
      </div>
    );
  }

  const userStats = {
    profileCompletion: currentUser.profileCompletionPercentage || 0,
    endorsements: currentUser.endorsementsReceived || 0,
    connections: currentUser.connectionsCount || 0
  };

  const requirements = nextLevel.minRequirements;
  const NextIcon = nextLevel.icon;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 text-blue-800 mb-3">
        <NextIcon className="w-5 h-5" />
        <span className="font-semibold">Next: {nextLevel.name} Verification</span>
      </div>
      
      <p className="text-sm text-blue-700 mb-3">
        {nextLevel.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Profile Completion</span>
          <span className={`font-medium ${
            userStats.profileCompletion >= requirements.profileCompletion 
              ? 'text-green-600' 
              : 'text-orange-600'
          }`}>
            {userStats.profileCompletion}% / {requirements.profileCompletion}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              userStats.profileCompletion >= requirements.profileCompletion
                ? 'bg-green-500'
                : 'bg-orange-500'
            }`}
            style={{ 
              width: `${Math.min((userStats.profileCompletion / requirements.profileCompletion) * 100, 100)}%` 
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Endorsements Received</span>
          <span className={`font-medium ${
            userStats.endorsements >= requirements.endorsements 
              ? 'text-green-600' 
              : 'text-orange-600'
          }`}>
            {userStats.endorsements} / {requirements.endorsements}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              userStats.endorsements >= requirements.endorsements
                ? 'bg-green-500'
                : 'bg-orange-500'
            }`}
            style={{ 
              width: `${Math.min((userStats.endorsements / requirements.endorsements) * 100, 100)}%` 
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Platform Connections</span>
          <span className={`font-medium ${
            userStats.connections >= requirements.connections 
              ? 'text-green-600' 
              : 'text-orange-600'
          }`}>
            {userStats.connections} / {requirements.connections}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              userStats.connections >= requirements.connections
                ? 'bg-green-500'
                : 'bg-orange-500'
            }`}
            style={{ 
              width: `${Math.min((userStats.connections / requirements.connections) * 100, 100)}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default VerificationBadge;
