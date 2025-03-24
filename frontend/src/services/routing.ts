import { NavigateFunction } from 'react-router-dom';

export const useNavigationFunctions = (navigate: NavigateFunction) => {
  const navigateToWorkspace = () => {
    navigate('/workspace');
  };

  const navigateToCollaboration = (id: string) => {
    navigate(`/collaboration/${id}`);
  };

  const navigateToChallenges = () => {
    navigate('/workspace');
    return 'challenges';
  };

  const navigateToPartnerships = () => {
    navigate('/workspace');
    return 'partnerships';
  };

  const navigateToIdeas = () => {
    navigate('/workspace');
    return 'ideas';
  };

  const navigateToInnovators = () => {
    navigate('/innovators');
  };

  const navigateToProfile = (userId?: string) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      navigate('/auth');
    }
  };

  const navigateToBlog = () => {
    navigate('/blog');
  };

  const navigateToConnections = (userId?: string) => {
    if (userId) {
      navigate(`/profile/${userId}?tab=connections`);
    } else {
      navigate('/auth');
    }
  };

  const navigateToCollaborations = (userId?: string) => {
    if (userId) {
      navigate(`/profile/${userId}?tab=collaborations`);
    } else {
      navigate('/auth');
    }
  };

  const navigateToMessages = (userId?: string) => {
    if (userId) {
      navigate(`/profile/${userId}?tab=messages`);
    } else {
      navigate('/auth');
    }
  };

  const backToHome = () => {
    navigate('/');
  };

  const navigateToAuth = () => {
    navigate('/auth');
  };

  const viewCollaboration = (id: string) => {
    navigate(`/collaboration/${id}`);
  };

  const backFromCollaborationDetails = () => {
    navigate(-1);
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToHowItWorks = () => {
    navigate('/how-it-works');
  };

  const navigateToSuccessStories = () => {
    navigate('/success-stories');
  };

  const navigateToFAQ = () => {
    navigate('/faq');
  };

  const navigateToSupport = () => {
    navigate('/support');
  };

  const navigateToContactUs = () => {
    navigate('/contact');
  };

  const navigateToLegalPage = (pageType: 'terms' | 'privacy' | 'cookies') => {
    navigate(`/legal/${pageType}`);
  };

  return {
    navigateToWorkspace,
    navigateToCollaboration,
    navigateToChallenges,
    navigateToPartnerships,
    navigateToIdeas,
    navigateToInnovators,
    navigateToProfile,
    navigateToBlog,
    navigateToConnections,
    navigateToCollaborations,
    navigateToMessages,
    backToHome,
    navigateToAuth,
    viewCollaboration,
    backFromCollaborationDetails,
    navigateToHome,
    navigateToHowItWorks,
    navigateToSuccessStories,
    navigateToFAQ,
    navigateToSupport,
    navigateToContactUs,
    navigateToLegalPage
  };
}; 