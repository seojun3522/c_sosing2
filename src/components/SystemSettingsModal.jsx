import React, { useState } from 'react';

        const SystemSettingsModal = ({ currentProjects, currentTeam, currentSecurity, onClose, onSave }) => {
            const [projs, setProjs] = useState([...(currentProjects || [])]);
            const [team, setTeam] = useState([...(currentTeam || [])]);
            const [masterPw, setMasterPw] = useState(currentSecurity?.master || DEFAULT_MASTER_PW);
            const [memberPwMap, setMemberPwMap] = useState(currentSecurity?.memberPasswords || {});

            const handleSave = () => {
                // [핵심 해결] 팀원 목록에 없는 찌꺼기 비밀번호를 아예 저장되지 않도록 정리합니다.
                const cleanMemberPwMap = {};
                team.forEach(m => {
                    if (memberPwMap[m.key] !== undefined) {
                        cleanMemberPwMap[m.key] = memberPwMap[m.key];
                    }
                });
                onSave(projs, team, { master: masterPw, memberPasswords: cleanMemberPwMap });
            };

            return (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 font-bold">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-black uppercase text-indigo-900 flex items-center gap-2"><Settings className="w-6 h-6"/>시스템 설정</h3>
                            <button onClick={onClose}><X className="w-6 h-6"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                            <section className="bg-red-50 p-4 rounded-xl border border-red-100 font-black">
                                <label className="text-xs font-black text-red-600 uppercase mb-2 block">관리자 암호</label>
                                <input type="text" value={masterPw} onChange={(e) => setMasterPw(e.target.value)} className="w-full border border-red-200 rounded-lg p-2 text-sm font-black"/>
                            </section>
                            <section className="font-black">
                                <label className="text-xs font-black text-gray-400 uppercase mb-2 block border-b pb-1">팀원 관리 (팀별 개별암호)</label>
                                <p className="text-[10px] text-red-500 mt-1 mb-4">※ 로그인 오류 방지를 위해 팀원별 암호는 반드시 다르게 설정하세요.</p>
                                <div className="space-y-2">
                                    {team.map((m, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input value={m.label} onChange={(e) => { const n = [...team]; n[i].label = e.target.value; setTeam(n); }} className="flex-1 border rounded-lg p-2 text-sm font-black" placeholder="이름" />
                                            <input value={memberPwMap[m.key] || ''} onChange={(e) => setMemberPwMap({...memberPwMap, [m.key]: e.target.value})} className="w-24 border rounded-lg p-2 text-sm font-mono font-black" placeholder="암호" />
                                            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer whitespace-nowrap ml-1">
                                                <input type="checkbox" checked={m.isConfirmedOnly || false} onChange={(e) => { const n = [...team]; n[i].isConfirmedOnly = e.target.checked; setTeam(n); }} className="w-4 h-4 accent-indigo-600" />
                                                확정만 보기
                                            </label>
                                            <button onClick={() => setTeam(team.filter((_, idx) => idx !== i))} className="text-red-400 ml-2"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setTeam([...team, { key: `member_${Date.now()}`, label: "새 팀원", isConfirmedOnly: false }])} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-black">+ 팀원 추가</button>
                                </div>
                            </section>
                            <section className="font-black">
                                <label className="text-xs font-black text-gray-400 uppercase mb-4 block border-b pb-1">프로젝트 관리</label>
                                <div className="space-y-2">
                                    {projs.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input value={p} onChange={(e) => { const n = [...projs]; n[i] = e.target.value; setProjs(n); }} className="flex-1 border rounded-lg p-2 text-sm font-black" />
                                            <button onClick={() => setProjs(projs.filter((_, idx) => idx !== i))} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setProjs([...projs, "새 프로젝트"])} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-black">+ 프로젝트 추가</button>
                                </div>
                            </section>
                        </div>
                        <div className="flex gap-4 mt-6 pt-4 border-t">
                            <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-black">취소</button>
                            <button onClick={handleSave} className="flex-2 grow-[2] bg-indigo-600 text-white py-3 rounded-xl shadow-lg font-black">설정 저장</button>
                        </div>
                    </div>
                </div>
            );
        };


export default SystemSettingsModal;

