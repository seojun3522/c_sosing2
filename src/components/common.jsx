import React, { useState } from 'react';
import { Check, X, Minus, Calculator } from './icons';

        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, errorInfo: null };
            }
            static getDerivedStateFromError(error) { return { hasError: true, errorInfo: error.toString() }; }
            render() {
                if (this.state.hasError) return <div className="p-10 text-center text-red-500 font-bold">오류가 발생했습니다: {this.state.errorInfo}<br/>새로고침 해주세요.</div>;
                return this.props.children;
            }
        }

        const StatusButton = ({ status, onClick }) => {
            let bgClass = "bg-gray-100 text-gray-300";
            if (status === 'approved') bgClass = "bg-green-100 text-green-600 border-green-200";
            if (status === 'rejected') bgClass = "bg-red-100 text-red-600 border-red-200";
            return (
                <button onClick={onClick} className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-110 ${bgClass}`}>
                    {status === 'approved' ? <Check className="w-4 h-4" /> : status === 'rejected' ? <X className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
            );
        };

        const CurrencyCalculatorSidebar = ({ exchangeRate, onRateChange, userRole }) => {
            const [cny, setCny] = useState('');
            const krw = cny ? Math.round(cny * exchangeRate) : 0;
            return (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4 font-bold">
                    <div className="flex items-center gap-2 mb-2 text-indigo-800 text-xs font-black uppercase"><Calculator className="w-3 h-3" /> <span>환율 계산기</span></div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-indigo-600 font-black">
                            <span>적용 환율:</span>
                            {userRole === 'admin' ? 
                                <input type="number" value={exchangeRate} onChange={(e) => onRateChange(Number(e.target.value))} className="w-16 text-right rounded border px-1" /> : 
                                <span className="font-mono">{exchangeRate}</span>
                            }
                        </div>
                        <input type="number" placeholder="위안(CNY)" value={cny} onChange={(e) => setCny(e.target.value)} className="w-full text-sm p-2 rounded border border-indigo-200 outline-none font-black" />
                        <div className="w-full text-sm p-2 rounded bg-white border border-indigo-200 text-right font-mono font-black">{krw.toLocaleString()} KRW</div>
                    </div>
                </div>
            )
        }


export { ErrorBoundary, StatusButton, CurrencyCalculatorSidebar };

