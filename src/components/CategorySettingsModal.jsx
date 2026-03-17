import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Plus, Trash2 } from './icons';

        const CategorySettingsModal = ({ currentGroups, currentFees, currentRatios, onClose, onSave }) => {
            const [groups, setGroups] = useState(JSON.parse(JSON.stringify(currentGroups || [])));
            const [fees, setFees] = useState({ ...(currentFees || {}) });
            const [ratios, setRatios] = useState({ ...(currentRatios || {}) });

            const moveGroup = (index, direction) => {
                if ((direction === 'up' || direction === 'top') && index === 0) return;
                if ((direction === 'down' || direction === 'bottom') && index === groups.length - 1) return;
                const newGroups = [...groups];
                const item = newGroups.splice(index, 1)[0];
                if (direction === 'up') newGroups.splice(index - 1, 0, item);
                else if (direction === 'down') newGroups.splice(index + 1, 0, item);
                else if (direction === 'top') newGroups.unshift(item);
                else if (direction === 'bottom') newGroups.push(item);
                setGroups(newGroups);
            };

            const moveSubCat = (groupIndex, subIndex, direction) => {
                const newGroups = [...groups];
                const subs = newGroups[groupIndex].subs;
                if ((direction === 'up' || direction === 'top') && subIndex === 0) return;
                if ((direction === 'down' || direction === 'bottom') && subIndex === subs.length - 1) return;
                const item = subs.splice(subIndex, 1)[0];
                if (direction === 'up') subs.splice(subIndex - 1, 0, item);
                else if (direction === 'down') subs.splice(subIndex + 1, 0, item);
                else if (direction === 'top') subs.unshift(item);
                else if (direction === 'bottom') subs.push(item);
                setGroups(newGroups);
            };

            const updateSubName = (gIdx, sIdx, oldVal, newVal) => {
                const newGroups = [...groups];
                newGroups[gIdx].subs[sIdx] = newVal;
                setGroups(newGroups);
                if (oldVal !== newVal) {
                    const newFees = { ...fees };
                    const newRatios = { ...ratios };
                    if (newFees[oldVal] !== undefined) { newFees[newVal] = newFees[oldVal]; delete newFees[oldVal]; }
                    if (newRatios[oldVal] !== undefined) { newRatios[newVal] = newRatios[oldVal]; delete newRatios[oldVal]; }
                    setFees(newFees);
                    setRatios(newRatios);
                }
            };

            const handleSave = (bulk) => onSave(groups, fees, ratios, bulk);

            return (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 font-bold">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl flex flex-col h-[80vh]">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-black uppercase text-indigo-900 flex items-center gap-2 font-black"><FolderTree className="w-6 h-6"/>카테고리 및 원가공식</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                            {groups.map((g, gIdx) => (
                                <div key={gIdx} className="bg-gray-50 p-4 rounded-xl border">
                                    <div className="flex items-center gap-3 mb-4 font-black">
                                        <div className="flex items-center gap-1 opacity-40 hover:opacity-100 font-bold transition-opacity bg-gray-200/50 p-1 rounded-md">
                                            <button onClick={() => moveGroup(gIdx, 'top')} className="hover:text-indigo-600 p-0.5" title="최상단으로"><ChevronsUp className="w-4 h-4"/></button>
                                            <button onClick={() => moveGroup(gIdx, 'up')} className="hover:text-indigo-500 p-0.5" title="위로"><ChevronUp className="w-4 h-4"/></button>
                                            <button onClick={() => moveGroup(gIdx, 'down')} className="hover:text-indigo-500 p-0.5" title="아래로"><ChevronDown className="w-4 h-4"/></button>
                                            <button onClick={() => moveGroup(gIdx, 'bottom')} className="hover:text-indigo-600 p-0.5" title="최하단으로"><ChevronsDown className="w-4 h-4"/></button>
                                        </div>
                                        <Layers className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-1" />
                                        <input value={g.main} onChange={(e) => { const n = [...groups]; n[gIdx].main = e.target.value; setGroups(n); }} className="bg-transparent font-black text-indigo-900 text-lg outline-none flex-1 border-b border-transparent focus:border-indigo-200" placeholder="대분류명" />
                                        <button onClick={() => setGroups(groups.filter((_, i) => i !== gIdx))} className="text-red-300 ml-auto font-black bg-white hover:text-red-500 p-1.5 rounded transition-colors"><Trash2 className="w-5 h-5"/></button>
                                    </div>
                                    <div className="space-y-2 pl-8">
                                        {g.subs.map((sub, sIdx) => (
                                            <div key={sIdx} className="flex items-center gap-4 bg-white p-2 rounded border text-xs font-black group shadow-sm hover:border-indigo-200 transition-colors">
                                                <div className="flex items-center gap-1 opacity-30 group-hover:opacity-100 font-bold transition-opacity bg-gray-100 p-1 rounded-md">
                                                    <button onClick={() => moveSubCat(gIdx, sIdx, 'top')} className="hover:text-indigo-600 p-0.5" title="최상단으로"><ChevronsUp className="w-3 h-3"/></button>
                                                    <button onClick={() => moveSubCat(gIdx, sIdx, 'up')} className="hover:text-indigo-500 p-0.5" title="위로"><ChevronUp className="w-3 h-3"/></button>
                                                    <button onClick={() => moveSubCat(gIdx, sIdx, 'down')} className="hover:text-indigo-500 p-0.5" title="아래로"><ChevronDown className="w-3 h-3"/></button>
                                                    <button onClick={() => moveSubCat(gIdx, sIdx, 'bottom')} className="hover:text-indigo-600 p-0.5" title="최하단으로"><ChevronsDown className="w-3 h-3"/></button>
                                                </div>
                                                <input value={sub} onChange={(e) => updateSubName(gIdx, sIdx, sub, e.target.value)} className="w-32 border border-gray-200 focus:border-indigo-400 rounded p-1.5 font-black outline-none ml-1" placeholder="소분류명" />
                                                <div className="flex items-center gap-1 font-black">
                                                    <span className="text-gray-500 text-[10px]">배율:</span>
                                                    <input type="number" step="0.01" value={ratios[sub] || 1} onChange={(e) => setRatios({...ratios, [sub]: Number(e.target.value)})} className="w-16 border border-gray-200 rounded px-1.5 py-1 font-black outline-none focus:border-amber-400 text-amber-700"/>
                                                </div>
                                                <div className="flex items-center gap-1 font-black">
                                                    <span className="text-gray-500 text-[10px]">고정비:</span>
                                                    <input type="number" value={fees[sub] || 0} onChange={(e) => setFees({...fees, [sub]: Number(e.target.value)})} className="w-24 border border-gray-200 rounded px-1.5 py-1 font-black outline-none focus:border-indigo-400 text-indigo-700"/>
                                                </div>
                                                <div className="flex-1"></div>
                                                <button onClick={() => { const n = [...groups]; n[gIdx].subs.splice(sIdx, 1); setGroups(n); }} className="text-gray-300 font-black hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => { const n = [...groups]; n[gIdx].subs.push("새 소분류"); setGroups(n); }} className="w-full py-2 border-2 border-dashed border-gray-200 bg-white rounded-xl text-[10px] text-gray-400 font-black hover:border-indigo-400 hover:text-indigo-500 transition-all">+ 소분류 추가</button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setGroups([...groups, { main: "새 대분류", subs: [] }])} className="w-full py-4 border-2 border-dashed border-indigo-200 text-indigo-500 bg-indigo-50/50 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"><Plus className="w-5 h-5"/> 대분류 추가</button>
                        </div>
                        <div className="flex flex-col gap-3 mt-6 pt-4 border-t font-black">
                            <button onClick={() => handleSave(true)} className="w-full bg-amber-500 text-white py-3 rounded-lg text-sm font-black shadow hover:bg-amber-600 transition-colors flex justify-center items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> 현재 수정한 공식을 기존 상품들에 일괄 적용
                            </button>
                            <div className="flex gap-4">
                                <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-black text-gray-500 hover:bg-gray-200">취소</button>
                                <button onClick={() => handleSave(false)} className="flex-2 grow-[2] bg-indigo-600 text-white py-3 rounded-xl shadow-lg font-black hover:bg-indigo-700">설정만 저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };


export default CategorySettingsModal;

