import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, ShieldAlert, CheckCircle, Zap, ArrowRight, Activity, Plus } from 'lucide-react';
import { getHistory } from '../services/auditService';
import AuditCoreScene from '../components/AuditCoreScene';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAudits: 0,
    avgScore: 0,
    issuesFound: 0,
    languages: 0
  });
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch history for recent audits
        const historyData = await getHistory(0, 5);
        if (historyData.content) {
          setRecentAudits(historyData.content.map((audit: any) => ({
            ...audit,
            score: audit.score ?? audit.overallScore ?? 0,
          })));
          // Mock stats based on history for now, in a real app this would be a dedicated endpoint
          setStats({
            totalAudits: historyData.totalElements || 12,
            avgScore: 84,
            issuesFound: 47,
            languages: 4
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 h-full flex flex-col gap-6">
        <div className="h-10 w-64 bg-bg-elevated rounded animate-shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-bg-elevated rounded-xl animate-shimmer delay-100"></div>
          ))}
        </div>
        <div className="h-64 bg-bg-elevated rounded-xl animate-shimmer delay-200 mt-4"></div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back, {user?.username}</h1>
          <p className="text-text-secondary">Here's an overview of your code quality metrics.</p>
        </div>
        <button
          onClick={() => navigate('/audit')}
          className="bg-accent-primary hover:bg-accent-secondary text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-accent-primary/20"
        >
          <Plus className="h-5 w-5" />
          New Audit
        </button>
      </div>

      <section className="dashboard-command-deck mb-8 animate-slide-up" aria-label="Audit intelligence overview">
        <div className="dashboard-command-copy">
          <div className="eyebrow-label"><span /> AUDIT INTELLIGENCE / 01</div>
          <h2>See the shape of your code.</h2>
          <p>One live view for quality, risk, and momentum across every audit.</p>
          <div className="dashboard-signal-row">
            <div><strong>{stats.issuesFound}</strong><span>issues mapped</span></div>
            <div><strong>{stats.languages}</strong><span>languages in orbit</span></div>
            <div><strong>24/7</strong><span>analysis ready</span></div>
          </div>
        </div>
        <AuditCoreScene score={stats.avgScore} />
        <div className="dashboard-command-index">
          <span>CORE STATUS</span>
          <strong>STABLE</strong>
          <div className="dashboard-index-bars"><i /><i /><i /><i /><i /></div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 flex flex-col gap-4 animate-slide-up">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-accent-primary/20 rounded-lg text-accent-glow">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stats.totalAudits}</div>
            <div className="text-sm text-text-secondary font-medium">Total Audits</div>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col gap-4 animate-slide-up delay-100">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-success/20 rounded-lg text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stats.avgScore}/100</div>
            <div className="text-sm text-text-secondary font-medium">Average Quality Score</div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 animate-slide-up delay-200">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-danger/20 rounded-lg text-danger">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stats.issuesFound}</div>
            <div className="text-sm text-text-secondary font-medium">Security Issues Found</div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 animate-slide-up delay-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-info/20 rounded-lg text-info">
              <Code2 className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stats.languages}</div>
            <div className="text-sm text-text-secondary font-medium">Languages Analyzed</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card overflow-hidden animate-slide-up delay-300">
        <div className="p-6 border-b border-border-default flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">Recent Audits</h2>
          <button 
            onClick={() => navigate('/history')}
            className="text-sm text-accent-primary hover:text-accent-glow font-medium flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        {recentAudits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-elevated/50 text-text-secondary text-sm">
                  <th className="px-6 py-4 font-medium">Language</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Issues</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {recentAudits.map((audit, idx) => (
                  <tr key={audit.id || idx} className="hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-accent-primary" />
                        {audit.language}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${audit.score >= 70 ? 'text-success' : audit.score >= 40 ? 'text-warning' : 'text-danger'}`}>
                        {audit.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {audit.securityIssues?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {new Date(audit.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-accent-primary hover:text-accent-glow text-sm font-medium px-3 py-1.5 rounded bg-accent-primary/10 hover:bg-accent-primary/20 transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-text-muted flex flex-col items-center">
            <div className="h-16 w-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-text-secondary" />
            </div>
            <p className="text-lg font-medium text-text-primary mb-1">No audits yet</p>
            <p className="mb-6 max-w-sm">Start your first code audit to see metrics and analysis here.</p>
            <button 
              onClick={() => navigate('/audit')}
              className="border border-border-default hover:border-accent-primary hover:text-accent-glow px-4 py-2 rounded-lg transition-colors"
            >
              Start First Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
