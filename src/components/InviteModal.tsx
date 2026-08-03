import React, { useState } from 'react';
import { TeamMember } from '../types';
import { X, UserPlus, Check, Send } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onInviteMember: (email: string) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  onInviteMember,
}) => {
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onInviteMember(email);
    setInvited(true);
    setTimeout(() => {
      setEmail('');
      setInvited(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 font-bold text-slate-800 text-lg">
              <UserPlus className="w-5 h-5 text-[#FF5252]" />
              <span>팀원 초대</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-3 mb-4">
            함께 작업할 팀원을 초대하고 프로젝트 진행 상황을 공유하세요.
          </p>

          <form onSubmit={handleSendInvite} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                이메일 주소
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                />
                <button
                  type="submit"
                  disabled={invited}
                  className="px-4 py-2 bg-[#FF5252] hover:bg-[#ff3b3b] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  {invited ? (
                    <>
                      <Check className="w-4 h-4" /> 전송 완료
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> 보내기
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Current Team Members List */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              참여 중인 팀원 ({teamMembers.length})
            </h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    팀원
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
