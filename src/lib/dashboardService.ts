import { getDatabaseClient, isDatabaseConfigured } from './database';
import { DashboardStats, TargetTraffic, ContentLeaderboard, MemberAnalytics, FlexImpression } from './types';
import { 
  getMockDashboardStats, 
  getMockTargetTraffic, 
  getMockContentLeaderboard, 
  getMockMembersList,
  MOCK_LOGS,
  getMockFlexImpressions
} from './mockData';

// Class to manage unified dashboard queries (Mock vs Database)
export class DashboardService {
  
  // 1. Get Dashboard Stats
  static async getDashboardStats(): Promise<DashboardStats> {
    if (!isDatabaseConfigured()) {
      return getMockDashboardStats();
    }

    const database = getDatabaseClient();
    if (!database) return getMockDashboardStats();

    try {
      // Run queries in parallel
      const [clicksRes, usersRes, confirmedRes, pendingRes, logsRes] = await Promise.all([
        database.from('liff_logs').select('*', { count: 'exact', head: true }),
        database.from('members').select('*', { count: 'exact', head: true }),
        database.from('members').select('*', { count: 'exact', head: true }).eq('status', 'Confirmed'),
        database.from('members').select('*', { count: 'exact', head: true }).eq('status', 'Pending Register'),
        database.from('liff_logs').select('content_id')
      ]);

      const totalClicks = clicksRes.count || 0;
      const totalUsers = usersRes.count || 0;
      const totalConfirmed = confirmedRes.count || 0;
      const totalPending = pendingRes.count || 0;

      // Group clicks by content_id on client-side to find the top one
      let topContentId = 'N/A';
      let topContentClicks = 0;

      if (logsRes.data && logsRes.data.length > 0) {
        const counts: Record<string, number> = {};
        logsRes.data.forEach(log => {
          if (log.content_id) {
            counts[log.content_id] = (counts[log.content_id] || 0) + 1;
          }
        });
        
        Object.entries(counts).forEach(([contentId, count]) => {
          if (count > topContentClicks) {
            topContentId = contentId;
            topContentClicks = count;
          }
        });
      }

      return {
        totalClicks,
        totalUsers,
        topContentId,
        topContentClicks,
        totalConfirmed,
        totalPending
      };
    } catch (error) {
      console.error('Error fetching dashboard stats from Database:', error);
      return getMockDashboardStats();
    }
  }

  // Helper to fetch and filter logs for analytics
  static async getFilteredLogs(
    dateStart?: string,
    dateEnd?: string,
    campaign?: string,
    eventSource?: string
  ): Promise<any[]> {
    let logs: any[] = [];

    if (!isDatabaseConfigured()) {
      logs = [...MOCK_LOGS];
    } else {
      const database = getDatabaseClient();
      if (!database) {
        logs = [...MOCK_LOGS];
      } else {
        try {
          let query = database.from('liff_logs').select('target, content_id, full_url, created_at, campaign_name, even_source, even_da');
          
          if (dateStart) {
            query = query.gte('created_at', dateStart);
          }
          if (dateEnd) {
            query = query.lte('created_at', dateEnd);
          }

          const { data, error } = await query;
          if (error) throw error;
          logs = data || [];
        } catch (error) {
          console.error('Error fetching logs from Database for filtering:', error);
          logs = [...MOCK_LOGS];
        }
      }
    }

    // Process all logs to extract campaign_name and even_source (either from DB columns or parsing full_url)
    const processedLogs = logs.map(log => {
      let logCampaign = log.campaign_name || '';
      let logSource = log.even_source || '';

      if (!logCampaign && log.full_url) {
        try {
          const urlObj = new URL(log.full_url);
          logCampaign = urlObj.searchParams.get('CampaignName') || '';
        } catch (e) {
          // Fallback parsing for non-standard or relative URLs
          const campaignMatch = log.full_url.match(/[?&]CampaignName=([^&]+)/);
          if (campaignMatch) logCampaign = decodeURIComponent(campaignMatch[1]);
        }
      }

      if (!logSource && log.full_url) {
        try {
          const urlObj = new URL(log.full_url);
          logSource = urlObj.searchParams.get('evensource') || '';
        } catch (e) {
          // Fallback parsing for non-standard or relative URLs
          const sourceMatch = log.full_url.match(/[?&]evensource=([^&]+)/);
          if (sourceMatch) logSource = decodeURIComponent(sourceMatch[1]);
        }
      }

      return {
        ...log,
        campaign_name: logCampaign || 'Undefined Campaign',
        even_source: logSource || 'Undefined Source'
      };
    });

    // Client-side filtering for CampaignName, evensource, and date range
    return processedLogs.filter(log => {
      // 1. Date filter (necessary for mock data)
      if (dateStart && new Date(log.created_at) < new Date(dateStart)) return false;
      if (dateEnd && new Date(log.created_at) > new Date(dateEnd)) return false;

      // 2. Campaign filter
      if (campaign && !log.campaign_name.toLowerCase().includes(campaign.toLowerCase())) {
        return false;
      }

      // 3. Event Source filter
      if (eventSource && log.even_source.toLowerCase() !== eventSource.toLowerCase()) {
        return false;
      }

      return true;
    });
  }

  // 2. Get Target Traffic Stats (groups by campaign name)
  static async getTargetTraffic(
    dateStart?: string,
    dateEnd?: string,
    campaign?: string,
    eventSource?: string
  ): Promise<TargetTraffic[]> {
    try {
      const logs = await this.getFilteredLogs(dateStart, dateEnd, campaign, eventSource);
      if (logs.length === 0) return [];

      const campaignCounts: Record<string, number> = {};
      logs.forEach(log => {
        const campaignName = log.campaign_name || 'Undefined Campaign';
        campaignCounts[campaignName] = (campaignCounts[campaignName] || 0) + 1;
      });

      const total = logs.length;
      return Object.entries(campaignCounts)
        .map(([campaignName, clicks]) => ({
          target: campaignName,
          clicks,
          percentage: Math.round((clicks / total) * 100)
        }))
        .sort((a, b) => b.clicks - a.clicks);
    } catch (error) {
      console.error('Error in getTargetTraffic:', error);
      return [];
    }
  }

  // 3. Get Content Leaderboard Stats
  static async getContentLeaderboard(
    dateStart?: string,
    dateEnd?: string,
    campaign?: string,
    eventSource?: string
  ): Promise<ContentLeaderboard[]> {
    try {
      const logs = await this.getFilteredLogs(dateStart, dateEnd, campaign, eventSource);
      if (logs.length === 0) return [];

      const contentCounts: Record<string, number> = {};
      logs.forEach(log => {
        const contentId = log.content_id || 'unknown';
        contentCounts[contentId] = (contentCounts[contentId] || 0) + 1;
      });

      const total = logs.length;
      return Object.entries(contentCounts)
        .map(([contentId, clicks]) => ({
          contentId,
          clicks,
          percentage: Math.round((clicks / total) * 100)
        }))
        .sort((a, b) => b.clicks - a.clicks);
    } catch (error) {
      console.error('Error in getContentLeaderboard:', error);
      return [];
    }
  }

  // 4. Get Members List (Paginated, Searchable, Filterable)
  static async getMembersList(
    search: string = '',
    contentFilter: string = '',
    page: number = 1,
    limit: number = 5,
    statusFilter: string = '',
    occupationFilter: string = '',
    specialtyFilter: string = ''
  ): Promise<{ items: MemberAnalytics[]; totalItems: number; totalPages: number; currentPage: number }> {
    if (!isDatabaseConfigured()) {
      return getMockMembersList(search, contentFilter, page, limit, statusFilter, occupationFilter, specialtyFilter);
    }

    const database = getDatabaseClient();
    if (!database) return getMockMembersList(search, contentFilter, page, limit, statusFilter, occupationFilter, specialtyFilter);

    try {
      // Strategy A: Try querying the recommended SQL view 'member_analytics'
      const offset = (page - 1) * limit;
      let viewQuery = database
        .from('member_analytics')
        .select('*', { count: 'exact' });

      if (statusFilter) {
        if (statusFilter === 'Confirmed' || statusFilter === 'Register') {
          viewQuery = viewQuery.in('status', ['Confirmed', 'Register']);
        } else {
          viewQuery = viewQuery.eq('status', statusFilter);
        }
      }

      // Apply Search
      if (search) {
        viewQuery = viewQuery.or(
          `display_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,user_id.ilike.%${search}%,organization.ilike.%${search}%`
        );
      }

      // Apply Content ID Filter
      if (contentFilter) {
        viewQuery = viewQuery.eq('latest_content_id', contentFilter);
      }

      // Apply Occupation Filter
      if (occupationFilter) {
        viewQuery = viewQuery.eq('occupation', occupationFilter);
      }

      // Apply Specialty Filter
      if (specialtyFilter) {
        viewQuery = viewQuery.eq('specialty', specialtyFilter);
      }

      // Apply Pagination
      viewQuery = viewQuery
        .order('registered_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await viewQuery;

      if (!error && data) {
        const totalItems = count || 0;
        return {
          items: data as MemberAnalytics[],
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page
        };
      }

      // Strategy B: View does not exist (relation error). Fallback to manual join.
      console.log('member_analytics view not found, falling back to manual client-side join...');
      
      // Fetch members (with pagination and search and status/occupation/specialty filters)
      let membersQuery = database
        .from('members')
        .select('*', { count: 'exact' });

      if (statusFilter) {
        if (statusFilter === 'Confirmed' || statusFilter === 'Register') {
          membersQuery = membersQuery.in('status', ['Confirmed', 'Register']);
        } else {
          membersQuery = membersQuery.eq('status', statusFilter);
        }
      }

      if (occupationFilter) {
        membersQuery = membersQuery.eq('occupation', occupationFilter);
      }

      if (specialtyFilter) {
        membersQuery = membersQuery.eq('specialty', specialtyFilter);
      }

      if (search) {
        membersQuery = membersQuery.or(
          `display_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,user_id.ilike.%${search}%,organization.ilike.%${search}%`
        );
      }

      // If they have contentFilter, we need to fetch logs matching content_id first to get user_ids, 
      // because we can't filter members by latest log content_id on the database without a join.
      let filterUserIds: string[] | null = null;
      if (contentFilter) {
        const { data: logsData } = await database
          .from('liff_logs')
          .select('user_id')
          .eq('content_id', contentFilter);
        
        if (logsData) {
          filterUserIds = Array.from(new Set(logsData.map(l => l.user_id).filter((uid): uid is string => !!uid)));
          // If no logs match, return empty
          if (filterUserIds.length === 0) {
            return { items: [], totalItems: 0, totalPages: 0, currentPage: page };
          }
          membersQuery = membersQuery.in('user_id', filterUserIds);
        }
      }

      // Query members
      const { data: members, count: totalMembersCount, error: membersErr } = await membersQuery
        .order('created_at', { ascending: false });

      if (membersErr || !members) throw membersErr || new Error('No members found');

      // Fetch latest logs for all retrieved members
      const userIds = members.map(m => m.user_id);
      
      let logs: any[] = [];
      if (userIds.length > 0) {
        const { data: logsData } = await database
          .from('liff_logs')
          .select('*')
          .in('user_id', userIds)
          .order('created_at', { ascending: false });
        logs = logsData || [];
      }

      // Perform join in-memory
      const joined: MemberAnalytics[] = members.map(m => {
        // Find latest log for this user
        const userLogs = logs.filter(l => l.user_id === m.user_id);
        const latestLog = userLogs[0] || null;

        return {
          user_id: m.user_id,
          display_name: m.display_name,
          picture_url: m.picture_url,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone,
          email: m.email,
          occupation: m.occupation,
          specialty: m.specialty,
          organization: m.organization,
          status: m.status,
          registered_at: m.created_at,
          latest_content_id: latestLog ? latestLog.content_id : null,
          latest_target: latestLog ? latestLog.target : null,
          latest_click_at: latestLog ? latestLog.created_at : null
        };
      });

      // Filter by latest content_id if not done database-side
      let filteredJoined = joined;
      if (contentFilter) {
        filteredJoined = joined.filter(j => j.latest_content_id === contentFilter);
      }

      const totalItems = filteredJoined.length;
      const totalPages = Math.ceil(totalItems / limit);
      const manualOffset = (page - 1) * limit;
      const items = filteredJoined.slice(manualOffset, manualOffset + limit);

      return {
        items,
        totalItems,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching members list manually from Database:', error);
      return getMockMembersList(search, contentFilter, page, limit, statusFilter, occupationFilter, specialtyFilter);
    }
  }

  // 6. Get Flex Impressions joined with member info
  static async getFlexImpressions(): Promise<FlexImpression[]> {
    if (!isDatabaseConfigured()) {
      return getMockFlexImpressions();
    }

    const database = getDatabaseClient();
    if (!database) return getMockFlexImpressions();

    try {
      // 1. Fetch Flex_Impression data from Supabase
      const { data: impressions, error: impError } = await database
        .from('Flex_Impression')
        .select('*')
        .order('created_at', { ascending: false });

      if (impError) throw impError;
      if (!impressions) return [];

      // 2. Fetch all members to join client-side
      const { data: members, error: memError } = await database
        .from('members')
        .select('user_id, display_name, picture_url, first_name, last_name, occupation, organization');

      if (memError) throw memError;

      // 3. Perform client-side join on user_id
      const memberMap = new Map<string, any>();
      if (members) {
        members.forEach(m => memberMap.set(m.user_id, m));
      }

      return impressions.map(imp => {
        const member = memberMap.get(imp.user_id) || {};
        return {
          ...imp,
          display_name: member.display_name || null,
          picture_url: member.picture_url || null,
          first_name: member.first_name || null,
          last_name: member.last_name || null,
          occupation: member.occupation || null,
          organization: member.organization || null
        };
      });
    } catch (error) {
      console.error('Error fetching Flex Impressions from database:', error);
      return getMockFlexImpressions();
    }
  }
}
