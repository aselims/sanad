export type CollaboratorType =
  | 'startup'
  | 'research'
  | 'corporate'
  | 'government'
  | 'investor'
  | 'individual'
  | 'accelerator'
  | 'incubator';

export interface CollaborationDetailsProps {
  collaboration: any;
  onBack: () => void;
  cameFromSearch?: boolean;
}

export interface CollaborationRequest {
  id: string;
  role: string;
  status: 'open' | 'closed';
  skills?: string[];
  experience?: string;
  description?: string;
}
