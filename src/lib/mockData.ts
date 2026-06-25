import { Member, LiffLog, MemberAnalytics, FlexImpression } from './types';

// Deterministic mock data for testing and local development
export const MOCK_MEMBERS: Member[] = [
  {
    user_id: "U111222333444",
    display_name: "Dr. Somchai Dev",
    picture_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    first_name: "สมชาย",
    last_name: "ใจดี",
    phone: "0812345678",
    email: "somchai.j@roche.com",
    occupation: "Doctor",
    specialty: "Oncology",
    organization: "Siriraj Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U555666777888",
    display_name: "Nurse Sunee",
    picture_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    first_name: "สุนีย์",
    last_name: "รักดี",
    phone: "0898765432",
    email: "sunee.r@ramahospital.go.th",
    occupation: "Nurse",
    specialty: "Hematology",
    organization: "Ramathibodi Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U999000111222",
    display_name: "Ph. Kitti",
    picture_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    first_name: "กิตติ",
    last_name: "มั่งมี",
    phone: "0865554433",
    email: "kitti.m@chula.ac.th",
    occupation: "Pharmacist",
    specialty: "General Medicine",
    organization: "Chulalongkorn Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U333444555666",
    display_name: "Dr. Ananya",
    picture_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&h=150&fit=crop&crop=face",
    first_name: "อนัญญา",
    last_name: "รุ่งเรือง",
    phone: "0841112222",
    email: "ananya.r@bumrungrad.com",
    occupation: "Doctor",
    specialty: "Oncology",
    organization: "Bumrungrad International Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U777888999000",
    display_name: "Officer Preecha",
    picture_url: null,
    first_name: "ปรีชา",
    last_name: "สอาดเอี่ยม",
    phone: "0829998888",
    email: "preecha.s@outlook.com",
    occupation: "Hospital/Clinic Officer",
    specialty: "General Medicine",
    organization: "Vichaiyut Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U222333444555",
    display_name: "Dr. Prasert",
    picture_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    first_name: "ประเสริฐ",
    last_name: "เลิศคุณ",
    phone: "0877776666",
    email: "prasert.l@med.cmu.ac.th",
    occupation: "Doctor",
    specialty: "Immunology",
    organization: "Maharaj Nakorn Chiang Mai Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U888999000111",
    display_name: "Ph. Malee",
    picture_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    first_name: "มาลี",
    last_name: "บุปผา",
    phone: "0851239876",
    email: "malee.b@samitivej.com",
    occupation: "Pharmacist",
    specialty: "Cardiology",
    organization: "Samitivej Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U444555666777",
    display_name: "Pipat (Pending)",
    picture_url: null,
    first_name: null,
    last_name: null,
    phone: null,
    email: null,
    occupation: null,
    specialty: null,
    organization: null,
    consent_policy: null,
    consent_processing: null,
    status: "Pending Register",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U123456789012",
    display_name: "Dr. Nattapon",
    picture_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    first_name: "ณัฐพล",
    last_name: "เจริญสุข",
    phone: "0834445555",
    email: "nattapon.c@roche.com",
    occupation: "Doctor",
    specialty: "Cardiology",
    organization: "Phramongkutklao Hospital",
    consent_policy: true,
    consent_processing: true,
    status: "Confirmed",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: "U987654321098",
    display_name: "Tawan",
    picture_url: null,
    first_name: null,
    last_name: null,
    phone: null,
    email: null,
    occupation: null,
    specialty: null,
    organization: null,
    consent_policy: null,
    consent_processing: null,
    status: "Pending Register",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

export const MOCK_LOGS: LiffLog[] = [
  // Clicks for U111222333444 (Dr. Somchai)
  {
    id: 1,
    user_id: "U111222333444",
    display_name: "Dr. Somchai Dev",
    picture_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    content_id: "onc_001",
    target: "/products/oncology",
    full_url: "https://liff.line.me/liff_roche?target=/products/oncology&content_id=onc_001&evensource=Broadcast&evenDA=HCP&CampaignName=World_Cancer_Day",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user_id: "U111222333444",
    display_name: "Dr. Somchai Dev",
    picture_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    content_id: "guide_405",
    target: "/resources/breast-cancer-guideline",
    full_url: "https://liff.line.me/liff_roche?target=/resources/breast-cancer-guideline&content_id=guide_405&evensource=Richmenu&evenDA=HCP&CampaignName=Oncology_Guide",
    created_at: new Date(Date.now() - 4.8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_id: "U111222333444",
    display_name: "Dr. Somchai Dev",
    picture_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    content_id: "onc_001",
    target: "/products/oncology",
    full_url: "https://liff.line.me/liff_roche?target=/products/oncology&content_id=onc_001&evensource=Broadcast&evenDA=HCP&CampaignName=World_Cancer_Day",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Clicks for U555666777888 (Nurse Sunee)
  {
    id: 4,
    user_id: "U555666777888",
    display_name: "Nurse Sunee",
    picture_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    content_id: "hem_023",
    target: "/products/hematology",
    full_url: "https://liff.line.me/liff_roche?target=/products/hematology&content_id=hem_023&evensource=Broadcast&evenDA=HCP&CampaignName=HCP_Update_2026",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    user_id: "U555666777888",
    display_name: "Nurse Sunee",
    picture_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    content_id: "sem_902",
    target: "/news/medical-seminar-2026",
    full_url: "https://liff.line.me/liff_roche?target=/news/medical-seminar-2026&content_id=sem_902&evensource=Richmenu&evenDA=HCP&CampaignName=General_Health",
    created_at: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Clicks for U999000111222 (Ph. Kitti)
  {
    id: 6,
    user_id: "U999000111222",
    display_name: "Ph. Kitti",
    picture_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    content_id: "evt_888",
    target: "/events/annual-con-regist",
    full_url: "https://liff.line.me/liff_roche?target=/events/annual-con-regist&content_id=evt_888&evensource=Broadcast&evenDA=HCP&CampaignName=HCP_Update_2026",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Clicks for U333444555666 (Dr. Ananya)
  {
    id: 7,
    user_id: "U333444555666",
    display_name: "Dr. Ananya",
    picture_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&h=150&fit=crop&crop=face",
    content_id: "guide_405",
    target: "/resources/breast-cancer-guideline",
    full_url: "https://liff.line.me/liff_roche?target=/resources/breast-cancer-guideline&content_id=guide_405&evensource=Richmenu&evenDA=HCP&CampaignName=Oncology_Guide",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 8,
    user_id: "U333444555666",
    display_name: "Dr. Ananya",
    picture_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&h=150&fit=crop&crop=face",
    content_id: "lung_111",
    target: "/resources/lung-cancer-screening",
    full_url: "https://liff.line.me/liff_roche?target=/resources/lung-cancer-screening&content_id=lung_111&evensource=Broadcast&evenDA=Lung&CampaignName=General_Health",
    created_at: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Clicks for U777888999000 (Officer Preecha)
  {
    id: 9,
    user_id: "U777888999000",
    display_name: "Officer Preecha",
    picture_url: null,
    content_id: "sem_902",
    target: "/news/medical-seminar-2026",
    full_url: "https://liff.line.me/liff_roche?target=/news/medical-seminar-2026&content_id=sem_902&evensource=Richmenu&evenDA=HCP&CampaignName=General_Health",
    created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 10,
    user_id: "U777888999000",
    display_name: "Officer Preecha",
    picture_url: null,
    content_id: "evt_888",
    target: "/events/annual-con-regist",
    full_url: "https://liff.line.me/liff_roche?target=/events/annual-con-regist&content_id=evt_888&evensource=Broadcast&evenDA=HCP&CampaignName=HCP_Update_2026",
    created_at: new Date(Date.now() - 1.4 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Clicks for U222333444555 (Dr. Prasert)
  {
    id: 11,
    user_id: "U222333444555",
    display_name: "Dr. Prasert",
    picture_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    content_id: "onc_001",
    target: "/products/oncology",
    full_url: "https://liff.line.me/liff_roche?target=/products/oncology&content_id=onc_001&evensource=Broadcast&evenDA=HCP&CampaignName=World_Cancer_Day",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Clicks for U888999000111 (Ph. Malee)
  {
    id: 12,
    user_id: "U888999000111",
    display_name: "Ph. Malee",
    picture_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    content_id: "onc_001",
    target: "/products/oncology",
    full_url: "https://liff.line.me/liff_roche?target=/products/oncology&content_id=onc_001&evensource=Broadcast&evenDA=HCP&CampaignName=World_Cancer_Day",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },

  // Anonymous Clicks (No registered member, or logged-in users tracking click logs)
  {
    id: 13,
    user_id: "Uanonymous_1",
    display_name: "Anon User 1",
    picture_url: null,
    content_id: "onc_001",
    target: "/products/oncology",
    full_url: "https://liff.line.me/liff_roche?target=/products/oncology&content_id=onc_001&evensource=Broadcast&evenDA=HCP&CampaignName=World_Cancer_Day",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 14,
    user_id: "Uanonymous_2",
    display_name: "Anon User 2",
    picture_url: null,
    content_id: "sem_902",
    target: "/news/medical-seminar-2026",
    full_url: "https://liff.line.me/liff_roche?target=/news/medical-seminar-2026&content_id=sem_902&evensource=Richmenu&evenDA=HCP&CampaignName=General_Health",
    created_at: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 15,
    user_id: "Uanonymous_3",
    display_name: "Anon User 3",
    picture_url: null,
    content_id: "guide_405",
    target: "/resources/breast-cancer-guideline",
    full_url: "https://liff.line.me/liff_roche?target=/resources/breast-cancer-guideline&content_id=guide_405&evensource=Richmenu&evenDA=HCP&CampaignName=Oncology_Guide",
    created_at: new Date(Date.now() - 3.8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 16,
    user_id: "Uanonymous_4",
    display_name: "Anon User 4",
    picture_url: null,
    content_id: "onc_001",
    target: "/products/oncology",
    full_url: "https://liff.line.me/liff_roche?target=/products/oncology&content_id=onc_001&evensource=Broadcast&evenDA=HCP&CampaignName=World_Cancer_Day",
    created_at: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 17,
    user_id: "Uanonymous_5",
    display_name: "Anon User 5",
    picture_url: null,
    content_id: "evt_888",
    target: "/events/annual-con-regist",
    full_url: "https://liff.line.me/liff_roche?target=/events/annual-con-regist&content_id=evt_888&evensource=Broadcast&evenDA=HCP&CampaignName=HCP_Update_2026",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 18,
    user_id: "Uanonymous_6",
    display_name: "Anon User 6",
    picture_url: null,
    content_id: "guide_405",
    target: "/resources/breast-cancer-guideline",
    full_url: "https://liff.line.me/liff_roche?target=/resources/breast-cancer-guideline&content_id=guide_405&evensource=Richmenu&evenDA=HCP&CampaignName=Oncology_Guide",
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 19,
    user_id: "U123456789012",
    display_name: "Dr. Nattapon",
    picture_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    content_id: "onc_001",
    target: "/products/oncology",
    full_url: "https://liff.line.me/liff_roche?target=/products/oncology&content_id=onc_001&evensource=Broadcast&evenDA=HCP&CampaignName=World_Cancer_Day",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 20,
    user_id: "U123456789012",
    display_name: "Dr. Nattapon",
    picture_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    content_id: "sem_902",
    target: "/news/medical-seminar-2026",
    full_url: "https://liff.line.me/liff_roche?target=/news/medical-seminar-2026&content_id=sem_902&evensource=Richmenu&evenDA=HCP&CampaignName=General_Health",
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  }
];

// Helper functions for parsing mock data queries

export function getMockDashboardStats() {
  const totalClicks = MOCK_LOGS.length;
  const totalUsers = MOCK_MEMBERS.length;
  const confirmedUsers = MOCK_MEMBERS.filter(m => m.status === 'Confirmed');
  
  // Calculate top content
  const contentCounts: Record<string, number> = {};
  MOCK_LOGS.forEach(log => {
    contentCounts[log.content_id] = (contentCounts[log.content_id] || 0) + 1;
  });
  
  let topContentId = 'N/A';
  let topContentClicks = 0;
  Object.entries(contentCounts).forEach(([contentId, count]) => {
    if (count > topContentClicks) {
      topContentId = contentId;
      topContentClicks = count;
    }
  });

  return {
    totalClicks,
    totalUsers,
    topContentId,
    topContentClicks,
    totalConfirmed: confirmedUsers.length,
    totalPending: totalUsers - confirmedUsers.length
  };
}

export function getMockTargetTraffic() {
  const targetCounts: Record<string, number> = {};
  MOCK_LOGS.forEach(log => {
    targetCounts[log.target] = (targetCounts[log.target] || 0) + 1;
  });

  const total = MOCK_LOGS.length;
  return Object.entries(targetCounts)
    .map(([target, clicks]) => ({
      target,
      clicks,
      percentage: Math.round((clicks / total) * 100)
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

export function getMockContentLeaderboard() {
  const contentCounts: Record<string, number> = {};
  MOCK_LOGS.forEach(log => {
    contentCounts[log.content_id] = (contentCounts[log.content_id] || 0) + 1;
  });

  const total = MOCK_LOGS.length;
  return Object.entries(contentCounts)
    .map(([contentId, clicks]) => ({
      contentId,
      clicks,
      percentage: Math.round((clicks / total) * 100)
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

export function getMockMembersList(
  search: string = '',
  contentFilter: string = '',
  page: number = 1,
  limit: number = 5,
  statusFilter: string = '',
  occupationFilter: string = '',
  specialtyFilter: string = ''
) {
  // Join members and logs in-memory
  const joined: MemberAnalytics[] = MOCK_MEMBERS.map(member => {
    const memberLogs = MOCK_LOGS.filter(log => log.user_id === member.user_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    const latestLog = memberLogs[0] || null;

    return {
      user_id: member.user_id,
      display_name: member.display_name,
      picture_url: member.picture_url,
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone,
      email: member.email,
      occupation: member.occupation,
      specialty: member.specialty,
      organization: member.organization,
      status: member.status,
      registered_at: member.created_at,
      latest_content_id: latestLog ? latestLog.content_id : null,
      latest_target: latestLog ? latestLog.target : null,
      latest_click_at: latestLog ? latestLog.created_at : null
    };
  });

  // Apply filters
  let filtered = joined;

  if (statusFilter) {
    // Treat Confirm / Confirmed / Register as same for Members, Pending Register for Visitors
    const isMemberFilter = statusFilter === 'Confirmed' || statusFilter === 'Register';
    filtered = filtered.filter(item => {
      const statusStr = item.status as string;
      if (isMemberFilter) {
        return statusStr === 'Confirmed' || statusStr === 'Register';
      } else {
        return statusStr === statusFilter;
      }
    });
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(item => 
      (item.display_name && item.display_name.toLowerCase().includes(searchLower)) ||
      (item.first_name && item.first_name.toLowerCase().includes(searchLower)) ||
      (item.last_name && item.last_name.toLowerCase().includes(searchLower)) ||
      (item.email && item.email.toLowerCase().includes(searchLower)) ||
      (item.user_id && item.user_id.toLowerCase().includes(searchLower)) ||
      (item.organization && item.organization.toLowerCase().includes(searchLower))
    );
  }

  if (contentFilter) {
    filtered = filtered.filter(item => item.latest_content_id === contentFilter);
  }

  if (occupationFilter) {
    filtered = filtered.filter(item => item.occupation === occupationFilter);
  }

  if (specialtyFilter) {
    filtered = filtered.filter(item => item.specialty === specialtyFilter);
  }

  // Calculate pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit);
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    totalItems,
    totalPages,
    currentPage: page
  };
}

export const getMockFlexImpressions = (): FlexImpression[] => {
  const mockImpressions = [
    {
      id: "imp_1",
      user_id: "U111222333444",
      content_id: "builder_content_1",
      campaign_name: "flex_builder_camp",
      created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() // 1.5 hours ago
    },
    {
      id: "imp_2",
      user_id: "U555666777888",
      content_id: "builder_content_1",
      campaign_name: "flex_builder_camp",
      created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "imp_3",
      user_id: "U999000111222",
      content_id: "oncology_hcp_2026",
      campaign_name: "Advanced_Oncology",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      id: "imp_4",
      user_id: "U333444555666",
      content_id: "oncology_hcp_2026",
      campaign_name: "Advanced_Oncology",
      created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "imp_5",
      user_id: "U777888999000",
      content_id: "builder_content_1",
      campaign_name: "flex_builder_camp",
      created_at: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "imp_6",
      user_id: "U222333444555",
      content_id: "cardio_update_02",
      campaign_name: "Cardiology_Digest",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    },
    {
      id: "imp_7",
      user_id: "U888999000111",
      content_id: "cardio_update_02",
      campaign_name: "Cardiology_Digest",
      created_at: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Join client-side with MOCK_MEMBERS
  const memberMap = new Map<string, Member>();
  MOCK_MEMBERS.forEach(m => memberMap.set(m.user_id, m));

  return mockImpressions.map(imp => {
    const member = memberMap.get(imp.user_id);
    return {
      ...imp,
      display_name: member?.display_name || null,
      picture_url: member?.picture_url || null,
      first_name: member?.first_name || null,
      last_name: member?.last_name || null,
      occupation: member?.occupation || null,
      organization: member?.organization || null
    };
  });
};
