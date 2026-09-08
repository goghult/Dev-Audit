import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Code2, Clock } from 'lucide-react';
import { getHistory } from '../services/auditService';

const HistoryPage: React.FC = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getHistory(page, 10);
        if (data.content) {
          setAudits(data.content.map((audit: any) => ({
            ...audit,
            score: audit.score ?? audit.overallScore ?? 0,
          })));
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [page]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Audit History</h1>
          <p className="text-text-secondary">View and search through your past code analyses.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search audits..." 
              className="bg-bg-elevated border border-border-default rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          </div>
          <button className="bg-bg-elevated border border-border-default hover:border-text-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all text-text-primary">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden animate-slide-up">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-text-muted">Loading history...</span>
            </div>
          </div>
        ) : audits.length > 0 ? (
          <>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-bg-card/95 backdrop-blur z-10 border-b border-border-default shadow-sm">
                  <tr className="text-text-secondary text-sm">
                    <th className="px-6 py-4 font-medium">Date & Time</th>
                    <th className="px-6 py-4 font-medium">Language</th>
                    <th className="px-6 py-4 font-medium">Quality Score</th>
                    <th className="px-6 py-4 font-medium">Issues Found</th>
                    <th className="px-6 py-4 font-medium">Complexity</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {audits.map((audit, idx) => (
                    <tr key={audit.id || idx} className="hover:bg-bg-elevated/40 transition-colors group cursor-pointer" onClick={() => navigate(`/audit/${audit.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-primary">
                          <Clock className="h-4 w-4 text-text-muted" />
                          {new Date(audit.createdAt || Date.now()).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-accent-primary" />
                          {audit.language}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-bg-primary rounded-full overflow-hidden border border-border-default">
                            <div 
                              className={`h-full ${audit.score >= 70 ? 'bg-success' : audit.score >= 40 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${audit.score}%` }}
                            ></div>
                          </div>
                          <span className={`font-bold text-sm ${audit.score >= 70 ? 'text-success' : audit.score >= 40 ? 'text-warning' : 'text-danger'}`}>
                            {audit.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-bg-primary px-2.5 py-1 rounded-md text-sm border border-border-default">
                          {audit.securityIssues?.length || 0} issues
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-text-secondary">
                        {audit.complexity || 'O(N)'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-accent-primary opacity-0 group-hover:opacity-100 font-medium px-3 py-1.5 rounded bg-accent-primary/10 hover:bg-accent-primary/20 transition-all text-sm">
                          View Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-border-default flex items-center justify-between bg-bg-card/50">
              <span className="text-sm text-text-secondary">
                Showing page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-2 rounded border border-border-default hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded border border-border-default hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-bg-primary flex items-center justify-center shadow-inner border border-border-default">
              <Clock className="h-8 w-8 text-text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No history found</h3>
            <p className="max-w-md mb-6">You haven't run any code audits yet, or they couldn't be loaded.</p>
            <button 
              onClick={() => navigate('/audit')}
              className="bg-accent-primary hover:bg-accent-secondary text-white px-5 py-2 rounded-lg font-medium transition-all"
            >
              Start New Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
