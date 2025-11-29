import React, { useState, useEffect } from 'react';
import { UserProfile, Activity, DailyState, StrengthProgress, Virtue } from '../types';
import { generateDailyActivities, getSpecificStrengthActivity } from '../services/geminiService';
import StrengthIcon from '../components/StrengthIcon';
import { ALL_STRENGTHS, VIRTUE_BG_COLORS, VIRTUE_COLORS, LEVEL_THRESHOLDS } from '../constants';
import { RefreshCw, CheckCircle2, Leaf, X, Sparkles, PenTool, History as HistoryIcon, ArrowRight, Loader2, ArrowUpRight, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  profile: UserProfile;
  dailyState: DailyState;
  updateDailyState: (state: DailyState) => void;
  progress: StrengthProgress[];
  onCompleteActivity: (activity: Activity, journal: string) => void;
  history: Activity[];
}

const Dashboard: React.FC<Props> = ({ profile, dailyState, updateDailyState, progress, onCompleteActivity, history }) => {
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [journalText, setJournalText] = useState('');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Garden Interactions State
  const [selectedStrengthId, setSelectedStrengthId] = useState<number | null>(null);
  const [gardenTab, setGardenTab] = useState<'inspire' | 'log' | 'history'>('inspire');
  const [gardenLoading, setGardenLoading] = useState(false);
  const [generatedTip, setGeneratedTip] = useState<Activity | null>(null);

  // Initialize daily activities if missing
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (dailyState.date !== today) {
      setLoading(true);
      generateDailyActivities(profile, []).then(activities => {
        updateDailyState({
          date: today,
          activities,
          hasShuffled: false
        });
        setLoading(false);
      });
    }
  }, [dailyState.date, profile, updateDailyState]);

  const handleShuffle = async () => {
    if (dailyState.hasShuffled) return;
    setLoading(true);
    const newActivities = await generateDailyActivities(profile, dailyState.activities.map(a => a.id));
    updateDailyState({
      ...dailyState,
      activities: newActivities,
      hasShuffled: true
    });
    setLoading(false);
  };

  const openActivity = (activity: Activity) => {
    if (activity.completedAt) return;
    setSelectedActivity(activity);
    setJournalText('');
    setIsActivityModalOpen(true);
  };

  const submitCompletion = () => {
    if (selectedActivity) {
      onCompleteActivity(selectedActivity, journalText);
      setIsActivityModalOpen(false);
    }
  };

  // Garden Modal Logic
  const openGardenStrength = (id: number) => {
    setSelectedStrengthId(id);
    setGardenTab('inspire');
    setGeneratedTip(null);
    setJournalText('');
  };

  const closeGardenModal = () => {
    setSelectedStrengthId(null);
  };

  const handleGetStrengthTip = async () => {
    if (!selectedStrengthId) return;
    setGardenLoading(true);
    const tip = await getSpecificStrengthActivity(selectedStrengthId, profile);
    setGeneratedTip(tip);
    setGardenLoading(false);
  };

  const handleAcceptTip = () => {
    if (generatedTip) {
       updateDailyState({
         ...dailyState,
         activities: [generatedTip, ...dailyState.activities]
       });
       closeGardenModal();
    }
  };

  const handleManualLog = () => {
     if (selectedStrengthId && journalText.trim()) {
        const strength = ALL_STRENGTHS.find(s => s.id === selectedStrengthId);
        const manualActivity: Activity = {
           id: crypto.randomUUID(),
           strengthId: selectedStrengthId,
           title: `Practiced ${strength?.name}`,
           description: "Self-reported activity",
           isManualLog: true
        };
        onCompleteActivity(manualActivity, journalText);
        closeGardenModal();
     }
  };

  const getProgressInfo = (strengthId: number) => {
    const p = progress.find(p => p.strengthId === strengthId);
    const count = p ? p.exp : 0; // exp is essentially activity count in new logic
    
    // Find current level based on thresholds
    let currentLevel = 1;
    let nextThreshold = LEVEL_THRESHOLDS[1]; // Next goal (Level 2 requires 1)
    let prevThreshold = LEVEL_THRESHOLDS[0];

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (count >= LEVEL_THRESHOLDS[i]) {
            currentLevel = i + 1;
            prevThreshold = LEVEL_THRESHOLDS[i];
            nextThreshold = LEVEL_THRESHOLDS[i+1] || LEVEL_THRESHOLDS[i] * 1.5; // Fallback for max level
        } else {
            break;
        }
    }

    const needed = Math.max(0, nextThreshold - count);
    const totalNeededForLevel = nextThreshold - prevThreshold;
    const progressInLevel = Math.max(0, count - prevThreshold);
    const percentage = Math.min(100, Math.round((progressInLevel / totalNeededForLevel) * 100));

    return { level: currentLevel - 1, count, needed, percentage, nextThreshold };
  };

  const maxExp = Math.max(...progress.map(p => p.exp), 0);

  // Sort strengths: User's top strengths first, then others by ID
  const sortedStrengths = [...ALL_STRENGTHS].sort((a, b) => {
    const isATop = profile.topStrengths.includes(a.id);
    const isBTop = profile.topStrengths.includes(b.id);
    if (isATop && !isBTop) return -1;
    if (!isATop && isBTop) return 1;
    return 0;
  });

  const selectedStrength = selectedStrengthId ? ALL_STRENGTHS.find(s => s.id === selectedStrengthId) : null;
  const strengthHistory = selectedStrengthId ? history.filter(h => h.strengthId === selectedStrengthId).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)) : [];
  const selectedProgressInfo = selectedStrengthId ? getProgressInfo(selectedStrengthId) : null;

  return (
    <div className="pb-24 pt-6 px-4 max-w-4xl mx-auto space-y-8 animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hello, {profile.name.split(' ')[0]}</h2>
          <p className="text-slate-500 font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl shadow-inner">
          {profile.name[0]}
        </div>
      </div>

      {/* Daily Quest Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            Today's Growth
          </h3>
          {!dailyState.hasShuffled && !dailyState.activities.some(a => a.completedAt) && (
            <button 
              onClick={handleShuffle}
              disabled={loading}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors bg-indigo-50 px-3 py-1.5 rounded-full"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Shuffle Tasks
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
             <>
                <div className="h-44 rounded-3xl bg-slate-100 animate-pulse"></div>
                <div className="h-44 rounded-3xl bg-slate-100 animate-pulse"></div>
             </>
          ) : (
            dailyState.activities.map(activity => (
              <div 
                key={activity.id}
                onClick={() => openActivity(activity)}
                className={`relative overflow-hidden rounded-3xl p-6 border-2 transition-all cursor-pointer group flex flex-col justify-between h-full min-h-[11rem] ${
                  activity.completedAt 
                    ? 'bg-slate-50 border-slate-100 opacity-60' 
                    : 'bg-white border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <StrengthIcon strengthId={activity.strengthId} size="sm" />
                    {activity.completedAt ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-400 transition-colors"></div>
                    )}
                  </div>
                  <h4 className={`font-bold text-lg mb-2 leading-tight ${activity.completedAt ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {activity.title}
                  </h4>
                  <p className={`text-sm leading-relaxed ${activity.completedAt ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activity.description}
                  </p>
                </div>
                
                {activity.completedAt && (
                   <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                     <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-extrabold shadow-sm transform -rotate-6">
                       COMPLETED!
                     </span>
                   </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Garden Visualization - REVISED */}
      <section>
        <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-bold text-slate-800">Your Garden</h3>
        </div>
        
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
             {sortedStrengths.map(strength => {
               const { level, count, needed, percentage } = getProgressInfo(strength.id);
               const isTop = profile.topStrengths.includes(strength.id);
               const bgClass = VIRTUE_BG_COLORS[strength.virtue];
               const isLeading = count > 0 && count === maxExp;
               
               return (
                 <div 
                    key={strength.id} 
                    onClick={() => openGardenStrength(strength.id)} 
                    className={`
                        relative flex flex-col items-center p-4 rounded-3xl cursor-pointer transition-all duration-300 border-2 
                        ${bgClass} 
                        ${isLeading ? 'ring-4 ring-yellow-300/50 shadow-[0_0_20px_rgba(253,224,71,0.4)] border-yellow-200 z-10 scale-[1.02]' : 'border-transparent hover:scale-[1.03] shadow-sm hover:shadow-md'}
                    `}
                 >
                    {isLeading && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap z-20">
                            <Trophy size={10} /> Top
                        </div>
                    )}

                    <div className="mb-3 relative">
                      <StrengthIcon 
                        strengthId={strength.id} 
                        size={isTop ? 'md' : 'md'} 
                        className="bg-white rounded-full shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white border border-indigo-100 text-indigo-600 text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-sm">
                          {level}
                      </div>
                    </div>
                    
                    <span className="font-bold text-slate-700 text-sm text-center mb-2 leading-tight w-full truncate px-1">
                        {strength.name}
                    </span>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden mb-1 ring-1 ring-black/5">
                        <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500/80 uppercase tracking-wide">
                        {needed} to next
                    </span>
                 </div>
               );
             })}
           </div>
        </div>
      </section>

      {/* --- Completion Modal (Standard) --- */}
      {isActivityModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">You did it!</h3>
                    <p className="text-slate-500 text-sm">Practicing <span className="font-bold text-indigo-600">{ALL_STRENGTHS.find(s=>s.id === selectedActivity.strengthId)?.name}</span></p>
                </div>
                <StrengthIcon strengthId={selectedActivity.strengthId} size="md" />
            </div>
            
            <label className="text-sm font-bold text-slate-400 uppercase mb-2 block">How did it feel?</label>
            <textarea
              className="w-full h-32 p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200 resize-none mb-4 text-base transition-all focus:bg-white"
              placeholder="Jot down a quick thought..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            ></textarea>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsActivityModalOpen(false)}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitCompletion}
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={20} /> Collect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Garden Interaction Modal --- */}
      {selectedStrength && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-slideUp flex flex-col max-h-[85vh]">
               {/* Header */}
               <div className={`p-6 pb-6 flex justify-between items-start ${VIRTUE_BG_COLORS[selectedStrength.virtue]}`}>
                  <div className="flex items-center gap-4">
                     <StrengthIcon strengthId={selectedStrength.id} size="lg" className="bg-white rounded-full shadow-sm" />
                     <div>
                        <h3 className="text-2xl font-extrabold text-slate-800">{selectedStrength.name}</h3>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{selectedStrength.virtue}</p>
                        {selectedProgressInfo && (
                            <div className="inline-flex items-center gap-2 bg-white/50 px-2 py-1 rounded-lg">
                                <span className="text-xs font-bold text-indigo-700">Lvl {selectedProgressInfo.level}</span>
                                <span className="text-[10px] text-slate-500 font-medium">({selectedProgressInfo.count} activities)</span>
                            </div>
                        )}
                     </div>
                  </div>
                  <button onClick={closeGardenModal} className="text-slate-400 hover:text-slate-600 bg-white/50 p-2 rounded-full hover:bg-white transition-all">
                     <X size={20} />
                  </button>
               </div>
               
               {/* Tabs */}
               <div className="flex border-b border-slate-100 px-4 bg-white">
                  {[
                      { id: 'inspire', label: 'Inspire Me', icon: Sparkles },
                      { id: 'log', label: 'Log Past', icon: PenTool },
                      { id: 'history', label: 'History', icon: HistoryIcon }
                  ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setGardenTab(tab.id as any)}
                        className={`flex-1 py-4 text-xs font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition-colors ${gardenTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                      >
                         <tab.icon size={20} /> {tab.label}
                      </button>
                  ))}
               </div>

               {/* Content */}
               <div className="p-6 overflow-y-auto min-h-[300px] bg-white">
                  {/* INSPIRE TAB */}
                  {gardenTab === 'inspire' && (
                     <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-slate-600 text-sm leading-relaxed font-medium">
                              "{selectedStrength.description}"
                           </p>
                        </div>
                        
                        {!generatedTip && (
                           <div className="text-center">
                               <p className="text-sm text-slate-500 mb-4">Need a new idea for today?</p>
                               <button 
                                  onClick={handleGetStrengthTip}
                                  disabled={gardenLoading}
                                  className="w-full py-6 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-3"
                               >
                                  {gardenLoading ? (
                                     <><Loader2 className="animate-spin" size={28} /> Asking Gemini...</>
                                  ) : (
                                     <><Sparkles size={28} /> Generate Activity</>
                                  )}
                               </button>
                           </div>
                        )}

                        {generatedTip && (
                           <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 animate-fadeIn shadow-sm">
                              <h4 className="font-bold text-indigo-900 mb-2 text-lg">{generatedTip.title}</h4>
                              <p className="text-indigo-800 text-sm mb-5 leading-relaxed">{generatedTip.description}</p>
                              <button 
                                 onClick={handleAcceptTip}
                                 className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                              >
                                 Add to Today's Tasks <ArrowRight size={16} />
                              </button>
                           </div>
                        )}
                     </div>
                  )}

                  {/* LOG TAB */}
                  {gardenTab === 'log' && (
                     <div className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">
                           Already did something using <strong>{selectedStrength.name}</strong>? Log it to grow!
                        </p>
                        <textarea
                           className="w-full h-40 p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-200 resize-none text-base"
                           placeholder="Describe what you did..."
                           value={journalText}
                           onChange={(e) => setJournalText(e.target.value)}
                        ></textarea>
                        <button 
                           onClick={handleManualLog}
                           disabled={!journalText.trim()}
                           className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold disabled:opacity-50 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"
                        >
                           <CheckCircle2 size={18} /> Log Activity
                        </button>
                     </div>
                  )}

                  {/* HISTORY TAB */}
                  {gardenTab === 'history' && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <span className="text-xs font-bold text-slate-400 uppercase">Next Milestone</span>
                           <span className="font-extrabold text-indigo-600 text-xl">{selectedProgressInfo?.needed} more activities</span>
                        </div>
                        
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2">Recent Activities</h4>
                        {strengthHistory.length === 0 ? (
                           <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                               <p className="text-sm">No history yet.</p>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {strengthHistory.map(act => (
                                 <div key={act.id} className="relative pl-4 border-l-2 border-indigo-100 pb-1">
                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-300"></div>
                                    <p className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-wide">
                                       {act.completedAt && format(new Date(act.completedAt), 'MMM d, yyyy • h:mm a')}
                                    </p>
                                    <p className="text-sm text-slate-800 font-bold">{act.title}</p>
                                    {act.journalEntry && (
                                       <div className="bg-slate-50 p-3 rounded-lg mt-2 text-xs text-slate-600 italic border border-slate-100">
                                          "{act.journalEntry}"
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;