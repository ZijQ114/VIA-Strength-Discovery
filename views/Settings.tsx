import React, { useState } from 'react';
import { UserProfile, Virtue, FamilyMember } from '../types';
import { ALL_STRENGTHS } from '../constants';
import StrengthIcon from '../components/StrengthIcon';
import Assessment from './Assessment';
import { Check, User, Heart, Plus, X, ArrowLeft, Save, Target } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

// Inline Pronoun Selector (same as Onboarding for consistency)
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
      
      {isCustom && (
        <input 
          type="text" 
          placeholder="Type your pronouns" 
          className="w-full p-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 text-indigo-800 font-medium outline-none bg-indigo-50/50 transition-colors"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
};

const Settings: React.FC<Props> = ({ profile: initialProfile, onSave, onCancel }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  
  // Local state for adding members
  const [tempPetName, setTempPetName] = useState("");
  const [tempPetPronouns, setTempPetPronouns] = useState("He/Him");
  
  const [tempChildName, setTempChildName] = useState("");
  const [tempChildPronouns, setTempChildPronouns] = useState("He/Him");

  const [partnerName, setPartnerName] = useState(profile.partner?.name || "");
  const [partnerPronouns, setPartnerPronouns] = useState(profile.partner?.pronouns || "They/Them");

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
    setIsAssessmentOpen(false);
  };

  if (isAssessmentOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 p-4 overflow-y-auto">
        <div className="max-w-xl mx-auto h-full flex flex-col justify-center">
           <Assessment onComplete={handleAssessmentComplete} onCancel={() => setIsAssessmentOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
       <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 sticky top-0 bg-slate-50 z-10 py-2">
            <button onClick={onCancel} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 text-slate-600 transition-colors">
               <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
          </div>

          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-indigo-500" />
                  Personal Details
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wide">Name</label>
                    <input 
                      type="text" 
                      className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wide">Pronouns</label>
                    <PronounSelector 
                       selected={profile.pronouns}
                       onChange={(p) => setProfile({...profile, pronouns: p})}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wide">Occupation</label>
                    <input 
                      type="text" 
                      className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      value={profile.occupation} onChange={e => setProfile({...profile, occupation: e.target.value})}
                    />
                  </div>
                </div>
            </div>

            {/* Family Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Family & Loved Ones
               </h2>
               <div className="space-y-6">
                  {/* Partner */}
                  <div className="bg-slate-50 p-4 rounded-2xl">
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
                  
                  {/* Pets */}
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Pets</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" placeholder="Pet Name" 
                        className="flex-1 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                        value={tempPetName} onChange={e => setTempPetName(e.target.value)}
                      />
                       <button onClick={handleAddPet} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-sm">
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

                  {/* Children */}
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Children</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" placeholder="Child Name" 
                        className="flex-1 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                        value={tempChildName} onChange={e => setTempChildName(e.target.value)}
                      />
                      <button onClick={handleAddChild} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-sm">
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
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                 <h2 className="text-lg font-bold text-slate-800">Signature Strengths</h2>
                 <span className={`text-sm font-bold ${profile.topStrengths?.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {profile.topStrengths?.length} / 10
                 </span>
              </div>
              
              <p className="text-sm text-slate-500 mb-4">Select up to 10 strengths that best describe you.</p>

              <button 
                 onClick={() => setIsAssessmentOpen(true)}
                 className="w-full mb-6 py-3 px-4 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 flex items-center justify-center gap-2"
              >
                 <Target size={18} /> Retake Assessment
              </button>
              
              <div className="h-96 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                {Object.values(Virtue).map(virtue => (
                  <div key={virtue}>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">{virtue}</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {ALL_STRENGTHS.filter(s => s.virtue === virtue).map(strength => {
                        const isSelected = profile.topStrengths?.includes(strength.id);
                        return (
                          <button
                            key={strength.id}
                            onClick={() => toggleStrength(strength.id)}
                            className={`flex items-center p-3 rounded-xl border-2 text-left transition-all ${
                              isSelected 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <StrengthIcon strengthId={strength.id} size="sm" className="mr-3 shrink-0" />
                            <div className="flex-1">
                              <div className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{strength.name}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={() => onSave(profile)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2"
            >
              <Save className="w-5 h-5" /> Save Profile
            </button>
          </div>
       </div>
    </div>
  );
};

export default Settings;