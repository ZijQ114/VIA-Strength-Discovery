import React, { useState } from 'react';
import { UserProfile, Virtue, FamilyMember } from '../types';
import { ALL_STRENGTHS, DEFAULT_TOP_STRENGTHS } from '../constants';
import StrengthIcon from '../components/StrengthIcon';
import Assessment from './Assessment';
import { Check, ChevronRight, User, Heart, Plus, X, List, Target, SkipForward } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

// Reusable Pronoun Selector Component
const PronounSelector = ({ 
  selected, 
  onChange 
}: { 
  selected: string, 
  onChange: (val: string) => void 
}) => {
  const options = ["He/Him", "She/Her", "They/Them"];
  const isCustom = selected && !options.includes(selected);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${
              selected === opt 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            {opt}
            {selected === opt && <Check size={14} strokeWidth={3} />}
          </button>
        ))}
        <button
          onClick={() => onChange(isCustom ? selected : '')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${
            isCustom
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
          }`}
        >
          Custom
          {isCustom && <Check size={14} strokeWidth={3} />}
        </button>
      </div>
      
      {/* Custom Input Field - Only shows if user selected custom or is typing custom */}
      {isCustom && (
        <input 
          type="text" 
          placeholder="Type your pronouns (e.g., Ze/Zir)" 
          className="w-full p-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 text-indigo-800 font-medium outline-none bg-indigo-50/50 transition-colors animate-fadeIn"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
};

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'intro' | 'choice' | 'manual' | 'assessment'>('intro');
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '', gender: '', pronouns: '', occupation: '',
    pets: [], partner: undefined, children: [], topStrengths: []
  });

  // Local state for adding members
  const [tempPetName, setTempPetName] = useState("");
  const [tempPetPronouns, setTempPetPronouns] = useState("He/Him");
  
  const [tempChildName, setTempChildName] = useState("");
  const [tempChildPronouns, setTempChildPronouns] = useState("He/Him");

  const [partnerName, setPartnerName] = useState("");
  const [partnerPronouns, setPartnerPronouns] = useState("They/Them");

  const pronounsOptions = ["He/Him", "She/Her", "They/Them"];

  const handleAddPet = () => {
    if (tempPetName.trim()) {
      const newPet: FamilyMember = { name: tempPetName.trim(), pronouns: tempPetPronouns };
      setProfile(prev => ({ ...prev, pets: [...(prev.pets || []), newPet] }));
      setTempPetName("");
      setTempPetPronouns("He/Him");
    }
  };

  const handleAddChild = () => {
    if (tempChildName.trim()) {
      const newChild: FamilyMember = { name: tempChildName.trim(), pronouns: tempChildPronouns };
      setProfile(prev => ({ ...prev, children: [...(prev.children || []), newChild] }));
      setTempChildName("");
      setTempChildPronouns("He/Him");
    }
  };

  const removePet = (idx: number) => {
    setProfile(prev => ({ ...prev, pets: prev.pets?.filter((_, i) => i !== idx) }));
  };

  const removeChild = (idx: number) => {
    setProfile(prev => ({ ...prev, children: prev.children?.filter((_, i) => i !== idx) }));
  };

  const updatePartner = (name: string, pronouns: string) => {
    setPartnerName(name);
    setPartnerPronouns(pronouns);
    if (name.trim()) {
      setProfile(prev => ({ ...prev, partner: { name: name.trim(), pronouns } }));
    } else {
      setProfile(prev => ({ ...prev, partner: undefined }));
    }
  };

  const handleNext = () => setStep(s => s + 1);
  
  const toggleStrength = (id: number) => {
    setProfile(prev => {
      const current = prev.topStrengths || [];
      if (current.includes(id)) {
        return { ...prev, topStrengths: current.filter(cid => cid !== id) };
      }
      if (current.length >= 10) return prev; 
      return { ...prev, topStrengths: [...current, id] };
    });
  };

  const handleAssessmentComplete = (topIds: number[]) => {
    setProfile(prev => ({ ...prev, topStrengths: topIds }));
    setMode('manual'); // Show results in manual view for confirmation
  };

  const handleSkip = () => {
    onComplete({
      ...profile as UserProfile,
      topStrengths: DEFAULT_TOP_STRENGTHS,
      isOnboarded: true
    });
  };

  const handleFinish = () => {
    if (profile.name && profile.topStrengths && profile.topStrengths.length > 0) {
      onComplete({
        ...profile as UserProfile,
        isOnboarded: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col justify-center max-w-lg mx-auto pb-24 font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">VIA Bloom</h1>
        <p className="text-slate-500 text-lg">Let's discover the best in you.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 transition-all">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-500" />
              Who are you?
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Your Name</label>
                <input 
                  type="text" placeholder="What should we call you?" 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none text-base bg-slate-50 focus:bg-white transition-colors"
                  value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Your Pronouns</label>
                <PronounSelector 
                   selected={profile.pronouns || ''} 
                   onChange={(p) => setProfile({...profile, pronouns: p})} 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Occupation</label>
                <input 
                  type="text" placeholder="What do you do?" 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none text-base bg-slate-50 focus:bg-white transition-colors"
                  value={profile.occupation} onChange={e => setProfile({...profile, occupation: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-6">
              <div className="flex items-center gap-2 text-slate-500">
                 <Heart className="w-4 h-4" />
                 <p className="text-sm font-semibold">Add family to personalize your activities</p>
              </div>
              
              {/* Partner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Partner</label>
                <div className="flex flex-col gap-3">
                   <input 
                    type="text" placeholder="Name" 
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    value={partnerName} onChange={e => updatePartner(e.target.value, partnerPronouns)}
                  />
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase self-center mr-2">Pronouns:</span>
                    <select 
                        value={partnerPronouns}
                        onChange={e => updatePartner(partnerName, e.target.value)}
                        className="flex-1 p-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        {pronounsOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pets List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Pets</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" placeholder="Pet Name" 
                    className="flex-1 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    value={tempPetName} onChange={e => setTempPetName(e.target.value)}
                  />
                  <button onClick={handleAddPet} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-sm transition-transform active:scale-95">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="mb-3">
                   <select 
                    value={tempPetPronouns}
                    onChange={e => setTempPetPronouns(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                  >
                    {pronounsOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.pets?.map((pet, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium">
                      {pet.name} <span className="text-slate-400 text-[10px]">{pet.pronouns}</span>
                      <button onClick={() => removePet(idx)} className="text-rose-400 hover:text-rose-600"><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Children List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Children</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" placeholder="Child Name" 
                    className="flex-1 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    value={tempChildName} onChange={e => setTempChildName(e.target.value)}
                  />
                   <button onClick={handleAddChild} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-sm transition-transform active:scale-95">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="mb-3">
                   <select 
                    value={tempChildPronouns}
                    onChange={e => setTempChildPronouns(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                  >
                    {pronounsOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.children?.map((child, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium">
                      {child.name} <span className="text-slate-400 text-[10px]">{child.pronouns}</span>
                      <button onClick={() => removeChild(idx)} className="text-rose-400 hover:text-rose-600"><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button 
              disabled={!profile.name}
              onClick={handleNext}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg mt-6 disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            {/* --- CHOICE MODE --- */}
            {mode === 'intro' && (
              <div className="space-y-6">
                <div className="text-center">
                    <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Discover Your Strengths</h2>
                    <p className="text-slate-500 mb-6 leading-relaxed">
                      We can help you find your signature strengths with a quick assessment, or you can pick them yourself.
                    </p>
                </div>
                
                <button 
                  onClick={() => setMode('assessment')}
                  className="w-full py-5 px-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-200 transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center">
                        <Target size={20} />
                     </div>
                     <div className="text-left">
                        <h3 className="font-bold text-indigo-900">Take Mini Assessment</h3>
                        <p className="text-xs text-indigo-600/80">30 questions • ~2 mins</p>
                     </div>
                  </div>
                  <ChevronRight className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => setMode('manual')}
                  className="w-full py-5 px-6 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 transition-all group flex items-center justify-between"
                >
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <List size={20} />
                     </div>
                     <div className="text-left">
                        <h3 className="font-bold text-slate-800">I know my strengths</h3>
                        <p className="text-xs text-slate-400">Select manually</p>
                     </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={handleSkip}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 text-sm flex justify-center items-center gap-2"
                >
                  Skip for now <SkipForward size={14} />
                </button>
              </div>
            )}

            {/* --- ASSESSMENT MODE --- */}
            {mode === 'assessment' && (
               <Assessment 
                 onComplete={handleAssessmentComplete} 
                 onCancel={() => setMode('intro')}
               />
            )}

            {/* --- MANUAL SELECTION MODE --- */}
            {mode === 'manual' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setMode('intro')} className="text-xs font-bold text-slate-400 hover:text-slate-600">Back</button>
                    <span className={`text-sm font-bold ${profile.topStrengths?.length && profile.topStrengths.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {profile.topStrengths?.length} / 10 Selected
                    </span>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  Select up to 10
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  These are your signature strengths.
                </p>
                
                <div className="h-80 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                  {Object.values(Virtue).map(virtue => (
                    <div key={virtue} className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 pl-1">{virtue}</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {ALL_STRENGTHS.filter(s => s.virtue === virtue).map(strength => {
                          const isSelected = profile.topStrengths?.includes(strength.id);
                          return (
                            <button
                              key={strength.id}
                              onClick={() => toggleStrength(strength.id)}
                              className={`flex items-center p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                                isSelected 
                                  ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                  : 'border-transparent bg-white shadow-sm hover:border-indigo-100'
                              }`}
                            >
                              <StrengthIcon strengthId={strength.id} size="sm" className="mr-3 shrink-0" />
                              <div className="flex-1">
                                <div className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                  {strength.name}
                                </div>
                              </div>
                              {isSelected && <div className="bg-indigo-600 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button 
                    disabled={!profile.topStrengths || profile.topStrengths.length === 0}
                    onClick={handleFinish}
                    className="w-full bg-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
                  >
                    Start My Journey <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;