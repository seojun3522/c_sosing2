import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send } from './icons';

        const InlineComments = ({ productId, comments, userKey, userRole, teamMembers }) => {
            const [text, setText] = useState("");
            const scrollRef = useRef(null);

            useEffect(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, [comments]);

            const handleAdd = async (e) => {
                e.preventDefault();
                if(!text.trim()) return;
                const member = teamMembers && teamMembers.find(m => m.key === userKey);
                const userName = member ? member.label : (userRole === 'admin' ? 'Master' : 'Guest');
                
                await supabase.from('comments').insert([{
                    productId,
                    userId: userKey,
                    userName,
                    text,
                    createdAt: Date.now()
                }]);
                setText("");
            };

            const handleDelete = async (id) => {
                if(confirm("댓글을 삭제하시겠습니까?")) {
                    await supabase.from('comments').delete().eq('id', id);
                }
            };

            return (
                <div className="flex flex-col gap-1 h-32 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden relative shadow-inner">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar text-[11px] font-black">
                        {comments.length === 0 && <div className="text-gray-400 text-center mt-6 text-[10px]">의견이 없습니다.</div>}
                        {comments.map(c => (
                            <div key={c.id} className={`flex flex-col ${c.userId === userKey ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-[10px] text-gray-500">{c.userName}</span>
                                    <span className="text-[8px] text-gray-400 font-mono">{new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className={`relative group px-2 py-1.5 rounded-lg max-w-[90%] break-words shadow-sm ${c.userId === userKey ? 'bg-indigo-100 text-indigo-900 rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                                    {c.text}
                                    {(c.userId === userKey || userRole === 'admin') && (
                                        <button onClick={() => handleDelete(c.id)} className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAdd} className="flex border-t bg-white">
                        <input type="text" value={text} onChange={e=>setText(e.target.value)} placeholder="의견 남기기..." className="flex-1 px-2 py-1.5 outline-none text-[11px] bg-transparent font-black"/>
                        <button type="submit" className="p-1.5 text-indigo-600 hover:bg-indigo-50 transition-colors"><Send className="w-4 h-4"/></button>
                    </form>
                </div>
            )
        };


export default InlineComments;

