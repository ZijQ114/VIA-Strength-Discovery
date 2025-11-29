import React from 'react';
import { Activity } from '../types';
import StrengthIcon from '../components/StrengthIcon';
import { format } from 'date-fns';
import { CalendarDays, Quote } from 'lucide-react';

interface Props {
  history: Activity[];
}

const History: React.FC<Props> = ({ history }) => {
  // Sort by date desc
  const sortedHistory = [...history].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <CalendarDays className="w-6 h-6 text-indigo-600" />
        Your Journey
      </h2>

      {sortedHistory.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>No completed activities yet.</p>
          <p className="text-sm">Start today to build your history!</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
          {sortedHistory.map((activity) => (
            <div key={activity.id} className="relative pl-8">
              {/* Timeline Dot */}
              <div className="absolute -left-[19px] top-0 bg-white border-4 border-slate-50 rounded-full">
                 <StrengthIcon strengthId={activity.strengthId} size="sm" />
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">
                     {format(new Date(activity.completedAt!), 'MMM do, yyyy')}
                  </span>
                  <span className="text-xs text-slate-400">
                     {format(new Date(activity.completedAt!), 'h:mm a')}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 mb-2">{activity.title}</h3>
                
                {activity.journalEntry && (
                  <div className="bg-slate-50 rounded-xl p-3 mt-3 relative">
                    <Quote className="absolute top-2 left-2 w-4 h-4 text-slate-300 opacity-50" />
                    <p className="text-sm text-slate-600 italic pl-6">
                      "{activity.journalEntry}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
