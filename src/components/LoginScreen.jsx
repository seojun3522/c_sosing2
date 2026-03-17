import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_MASTER_PW, DEFAULT_MEMBER_PW } from '../lib/constants';

        const LoginScreen = ({ onLogin }) => {
            const [inputPw, setInputPw] = useState("");
            const [error, setError] = useState(false);
            const [loading, setLoading] = useState(true);
            const [serverPasswords, setServerPasswords] = useState({ master: DEFAULT_MASTER_PW, memberPasswords: {} });

            useEffect(() => {
                const initAndFetch = async () => {
                    try {
                        const [secRes, globRes] = await Promise.all([
                            supabase.from('security_settings').select('*').eq('id', 1).single(),
                            supabase.from('global_settings').select('teamMembers').eq('id', 1).single()
                        ]);
                        
                        if (secRes.data) {
                            // [핵심 해결] 삭제된 팀원의 유령 비밀번호를 로그인 전에 필터링합니다.
                            const activeMembers = globRes.data?.teamMembers || [];
                            const activeKeys = activeMembers.map(m => m.key);
                            
                            const validPasswords = {};
                            const rawPasswords = secRes.data.memberPasswords || {};
                            
                            Object.keys(rawPasswords).forEach(k => {
                                if (activeKeys.includes(k)) {
                                    validPasswords[k] = rawPasswords[k];
                                }
                            });

                            setServerPasswords({ master: secRes.data.master || DEFAULT_MASTER_PW, memberPasswords: validPasswords });
                        }
                    } catch (e) { console.error(e); } finally { setLoading(false); }
                };
                initAndFetch();
            }, []);

            const handleSubmit = (e) => {
                e.preventDefault();
                if (inputPw === serverPasswords.master) onLogin('admin', 'master');
                else {
                    const memberKey = Object.keys(serverPasswords.memberPasswords).find(key => serverPasswords.memberPasswords[key] === inputPw && inputPw.trim() !== "");
                    if (memberKey) onLogin('member', memberKey);
                    else if (inputPw === "5678") onLogin('member', 'guest');
                    else { setError(true); setInputPw(""); }
                }
            };

            if (loading) return <div className="fixed inset-0 flex items-center justify-center bg-white"><div className="spinner"></div></div>;

            return (
                <div className="fixed inset-0 bg-slate-100 flex items-center justify-center z-[9999] p-4 font-bold">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8 border border-slate-200">
                        <div className="flex flex-col items-center mb-8 text-center font-black">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4"><Lock className="w-7 h-7" /></div>
                            <h2 className="text-xl font-black">팀 접속 권한 확인</h2>
                            <p className="text-sm text-slate-500 mt-2">비밀번호를 입력하세요.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="password" value={inputPw} onChange={(e) => { setInputPw(e.target.value); setError(false); }} className={`w-full p-4 text-center text-lg tracking-widest font-black border-2 rounded-xl focus:outline-none transition-all ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-indigo-500 bg-slate-50'}`} placeholder="●●●●" autoFocus />
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95">입장하기</button>
                        </form>
                    </div>
                </div>
            );
        };


export default LoginScreen;

