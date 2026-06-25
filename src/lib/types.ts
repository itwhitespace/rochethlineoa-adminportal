export interface Member {
  user_id: string;
  display_name: string | null;
  picture_url: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  occupation: string | null;
  specialty: string | null;
  organization: string | null;
  consent_policy: boolean | null;
  consent_processing: boolean | null;
  status: 'Pending Register' | 'Confirmed';
  created_at: string;
  updated_at: string;
}

export interface LiffLog {
  id: number;
  user_id: string;
  display_name: string | null;
  picture_url: string | null;
  content_id: string;
  target: string;
  full_url: string | null;
  created_at: string;
}

export interface MemberAnalytics {
  user_id: string;
  display_name: string | null;
  picture_url: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  occupation: string | null;
  specialty: string | null;
  organization: string | null;
  status: 'Pending Register' | 'Confirmed';
  registered_at: string;
  latest_content_id: string | null;
  latest_target: string | null;
  latest_click_at: string | null;
}

export interface DashboardStats {
  totalClicks: number;
  totalUsers: number;
  topContentId: string;
  topContentClicks: number;
  totalConfirmed: number;
  totalPending: number;
}

export interface TargetTraffic {
  target: string;
  clicks: number;
  percentage: number;
}

export interface ContentLeaderboard {
  contentId: string;
  clicks: number;
  percentage: number;
}
