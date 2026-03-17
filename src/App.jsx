import React, { useEffect, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import LoginScreen from './components/LoginScreen';
import SystemSettingsModal from './components/SystemSettingsModal';
import CategorySettingsModal from './components/CategorySettingsModal';
import InlineComments from './components/InlineComments';
import { ErrorBoundary, StatusButton, CurrencyCalculatorSidebar } from './components/common';
import { supabase } from './lib/supabase';
import { DEFAULT_MASTER_PW } from './lib/constants';
import { Package, Search, Check, X, Minus, Calculator, ImageIcon, Trash2, Plus, Settings, Edit2, StickyNote, ChevronRight, LayoutDashboard, CheckCircle, ZoomIn, Cloud, RefreshCw, Truck, Menu, Download, Upload, Clock, Flag, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Lock, Shield, User, Key, FileText, RotateCcw, Layers, FolderTree, Eye, Calendar, ChevronsUpDown, ArrowUpDown, MessageSquare, Send, FilePdf } from './components/icons';

        function App({ userRole, userKey }) {
            const [activeMainCategory, setActiveMainCategory] = useState("전체");
            const [activeCategory, setActiveCategory] = useState("전체");
            const [expandedMainCats, setExpandedMainCats] = useState({});
            const [activeProject, setActiveProject] = useState("전체");
            const [searchTerm, setSearchTerm] = useState("");
            const [filterStatus, setFilterStatus] = useState("all"); 
            const [isSidebarOpen, setIsSidebarOpen] = useState(true);
            const [isAddModalOpen, setIsAddModalOpen] = useState(false);
            const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
            const [editingItem, setEditingItem] = useState(null);
            const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
            const [isCategorySettingsOpen, setIsCategorySettingsOpen] = useState(false);
            const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
            const [toast, setToast] = useState(null);

            // 이미지 지연 로딩을 위한 새로운 상태
            const [imageMap, setImageMap] = useState({});
            const [imageLoadingProgress, setImageLoadingProgress] = useState(null);

            // Preview Carousel State
            const [previewData, setPreviewData] = useState(null);
            const [previewIndex, setPreviewIndex] = useState(0);

            const [editingNoId, setEditingNoId] = useState(null);
            const [editingNoValue, setEditingNoValue] = useState("");
            const [selectedItems, setSelectedItems] = useState([]);
            const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
            const [bulkMoveTarget, setBulkMoveTarget] = useState({ project: '', mainCategory: '', category: '' });
            const fileInputRef = useRef(null);
            
            const [products, setProducts] = useState([]);
            const [settings, setSettings] = useState({ categoryGroups: [], categoryFees: {}, categoryRatios: {}, projects: [], teamMembers: [], exchangeRate: 195 });
            const [security, setSecurity] = useState({ master: DEFAULT_MASTER_PW, memberPasswords: {} });
            
            const [productForm, setProductForm] = useState({ project: '', mainCategory: '', category: '', name: '', option: '', cost: '', price: '', image: null, optionImage: null, cny: '', links: [''], naverLinks: [''] });
            const [lastTargetZone, setLastTargetZone] = useState('main');
            const [sortConfig, setSortConfig] = useState({ key: 'customOrder', direction: 'asc' });

            const [allComments, setAllComments] = useState([]);

            // 강제 로그아웃 로직
            useEffect(() => {
                if (userRole === 'member' && userKey && userKey !== 'guest') {
                    if (settings.teamMembers && settings.teamMembers.length > 0) {
                        const stillExists = settings.teamMembers.find(m => m.key === userKey);
                        if (!stillExists) {
                            alert("계정 정보가 갱신되어 자동으로 로그아웃됩니다. 다시 로그인해주세요.");
                            sessionStorage.removeItem('team_role');
                            sessionStorage.removeItem('team_user_key');
                            window.location.reload();
                        }
                    }
                }
            }, [settings.teamMembers, userKey, userRole]);

            useEffect(() => {
                setSelectedItems([]);
            }, [activeProject, activeMainCategory, activeCategory, filterStatus]);

            const handleSort = (key) => {
                let direction = 'desc';
                if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
                if (key === 'customOrder') direction = 'asc';
                setSortConfig({ key, direction });
            };

            const generateItemCode = () => 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            useEffect(() => {
                const handlePaste = (e) => {
                    if (!isAddModalOpen) return;
                    const items = (e.clipboardData || window.clipboardData).items;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                            const blob = items[i].getAsFile();
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                if (lastTargetZone === 'main') setProductForm(prev => ({ ...prev, image: event.target.result }));
                                else if (lastTargetZone === 'option') setProductForm(prev => ({ ...prev, optionImage: event.target.result }));
                            };
                            reader.readAsDataURL(blob);
                            e.preventDefault();
                            break;
                        }
                    }
                };
                window.addEventListener('paste', handlePaste);
                return () => window.removeEventListener('paste', handlePaste);
            }, [isAddModalOpen, lastTargetZone]);

            useEffect(() => {
                if (!previewData) return;
                const handleKeyDown = (e) => {
                    if (e.key === 'Escape') setPreviewData(null);
                    if (e.key === 'ArrowLeft') setPreviewIndex(p => p === 0 ? previewData.length - 1 : p - 1);
                    if (e.key === 'ArrowRight') setPreviewIndex(p => p === previewData.length - 1 ? 0 : p + 1);
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [previewData]);

            const formatDateTime = (timestamp) => {
            if (!timestamp) return { date: '날짜모름', time: '' };
            const dObj = new Date(timestamp);
            if (isNaN(dObj.getTime())) return { date: '날짜모름', time: '' };
            const y = String(dObj.getFullYear()).slice(-2);
            const m = String(dObj.getMonth() + 1).padStart(2, '0');
            const d = String(dObj.getDate()).padStart(2, '0');
            const hh = String(dObj.getHours()).padStart(2, '0');
            const mm = String(dObj.getMinutes()).padStart(2, '0');
            return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
        };

        const showToast = (message, type = 'success') => {
            setToast({ message, type });
            setTimeout(() => setToast(null), 3000);
        };

        // Supabase 데이터 패치 및 실시간 구독
        useEffect(() => {
            const fetchInitialData = async () => {
                try {
                    // [중요 시스템 업그레이드] 
                    // 타임아웃의 원인인 초거대 Base64 이미지 데이터를 초기 로딩에서 제외했습니다. (0.1초 컷 보장)
                    const [prodRes, globRes, secRes, comRes] = await Promise.all([
                        supabase.from('products').select('id, itemCode, project, mainCategory, category, name, option, cny, cost, price, links, naverLinks, isConfirmed, isFinalized, isHeld, isSampleRequested, isDeleted, approvals, customOrder, createdAt, updatedAt'),
                        supabase.from('global_settings').select('*').eq('id', 1).single(),
                        supabase.from('security_settings').select('*').eq('id', 1).single(),
                        supabase.from('comments').select('*')
                    ]);

                    if (prodRes.error) {
                        console.error("Products Fetch Error:", prodRes.error);
                        alert(`데이터를 불러오는 중 에러가 발생했습니다: ${prodRes.error.message}\n개발자 도구(F12) 콘솔을 확인해주세요.`);
                    }

                    if (prodRes.data) {
                        setProducts(prodRes.data);
                        // 백그라운드 이미지 로딩 시작
                        fetchImagesInBackground(prodRes.data);
                    }
                    
                    if (globRes.data) setSettings({
                        categoryGroups: globRes.data.categoryGroups || [],
                        categoryFees: globRes.data.categoryFees || {},
                        categoryRatios: globRes.data.categoryRatios || {},
                        projects: globRes.data.projects || [],
                        teamMembers: globRes.data.teamMembers || [],
                        exchangeRate: globRes.data.exchangeRate || 195
                    });
                    if (secRes.data) setSecurity({
                        master: secRes.data.master || DEFAULT_MASTER_PW,
                        memberPasswords: secRes.data.memberPasswords || {}
                    });
                    if (comRes.data) setAllComments(comRes.data);
                } catch (error) {
                    console.error("Critical Fetch Error:", error);
                    alert("데이터 통신 중 치명적인 오류가 발생했습니다. 개발자 도구(F12) 콘솔을 확인해주세요.");
                }
            };

            // 백그라운드에서 이미지를 15개씩 안전하게 가져오는 함수
            const fetchImagesInBackground = async (items) => {
                const total = items.length;
                if (total === 0) return;
                setImageLoadingProgress({ current: 0, total });
                const CHUNK_SIZE = 15;
                let loadedCount = 0;

                for (let i = 0; i < total; i += CHUNK_SIZE) {
                    const chunk = items.slice(i, i + CHUNK_SIZE);
                    const ids = chunk.map(p => p.id);

                    try {
                        const { data } = await supabase
                            .from('products')
                            .select('id, image, optionImage')
                            .in('id', ids);

                        if (data) {
                            setImageMap(prev => {
                                const newMap = { ...prev };
                                data.forEach(item => {
                                    newMap[item.id] = { image: item.image, optionImage: item.optionImage };
                                });
                                return newMap;
                            });
                        }
                    } catch(e) {
                        console.error("Image Fetch Error:", e);
                    }
                    
                    loadedCount += chunk.length;
                    setImageLoadingProgress({ current: Math.min(loadedCount, total), total });
                    await new Promise(r => setTimeout(r, 200)); // 서버 과부하 방지를 위한 0.2초 휴식
                }
                setTimeout(() => setImageLoadingProgress(null), 2000); // 2초 뒤 알림 숨김
            };

            fetchInitialData();

            const channel = supabase.channel('dashboard_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
                        // 실시간 업데이트 시에도 이미지로 인한 렉 방지를 위해 이미지는 분리
                        const cleanItem = { ...payload.new };
                        const newImage = cleanItem.image;
                        const newOptionImage = cleanItem.optionImage;
                        delete cleanItem.image;
                        delete cleanItem.optionImage;

                        if (payload.eventType === 'INSERT') {
                            setProducts(p => [...p, cleanItem]);
                            setImageMap(prev => ({ ...prev, [cleanItem.id]: { image: newImage, optionImage: newOptionImage } }));
                        }
                        else if (payload.eventType === 'UPDATE') {
                            setProducts(p => p.map(x => x.id === cleanItem.id ? cleanItem : x));
                            setImageMap(prev => ({ ...prev, [cleanItem.id]: { image: newImage, optionImage: newOptionImage } }));
                        }
                        else if (payload.eventType === 'DELETE') {
                            setProducts(p => p.filter(x => x.id !== payload.old.id));
                        }
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
                        if (payload.eventType === 'INSERT') setAllComments(c => [...c, payload.new]);
                        else if (payload.eventType === 'UPDATE') setAllComments(c => c.map(x => x.id === payload.new.id ? payload.new : x));
                        else if (payload.eventType === 'DELETE') setAllComments(c => c.filter(x => x.id !== payload.old.id));
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'global_settings' }, payload => {
                        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                            setSettings({
                                categoryGroups: payload.new.categoryGroups || [],
                                categoryFees: payload.new.categoryFees || {},
                                categoryRatios: payload.new.categoryRatios || {},
                                projects: payload.new.projects || [],
                                teamMembers: payload.new.teamMembers || [],
                                exchangeRate: payload.new.exchangeRate || 195
                            });
                        }
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'security_settings' }, payload => {
                        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                            setSecurity({
                                master: payload.new.master || DEFAULT_MASTER_PW,
                                memberPasswords: payload.new.memberPasswords || {}
                            });
                        }
                    })
                    .subscribe();

                return () => { supabase.removeChannel(channel); };
            }, []);

            const commentsByProduct = useMemo(() => {
                const map = {};
                allComments.forEach(c => {
                    if (!map[c.productId]) map[c.productId] = [];
                    map[c.productId].push(c);
                });
                Object.keys(map).forEach(k => {
                    map[k].sort((a, b) => a.createdAt - b.createdAt);
                });
                return map;
            }, [allComments]);

            const currentUserSettings = useMemo(() => (settings.teamMembers || []).find(m => m.key === userKey), [settings.teamMembers, userKey]);
            const isConfirmedOnlyView = useMemo(() => {
                if (userRole !== 'member') return false;
                return currentUserSettings?.isConfirmedOnly === true || String(currentUserSettings?.isConfirmedOnly) === 'true';
            }, [userRole, currentUserSettings]);

            const displayProducts = useMemo(() => {
                return products
                    .filter(p => {
                        if (isConfirmedOnlyView) {
                            return p.isConfirmed || p.isFinalized || p.isSampleRequested;
                        }
                        return true;
                    })
                    .map(p => ({ 
                        ...p, 
                        mappedMainCategory: p.mainCategory || "미분류",
                        mappedSubCategory: p.category || "미지정"
                    }));
            }, [products, isConfirmedOnlyView]);

            const filteredProducts = useMemo(() => {
                let list = displayProducts.filter(p => !p.isDeleted);
                if (activeProject !== "전체") list = list.filter(p => p.project === activeProject);
                if (activeMainCategory !== "전체") {
                    list = list.filter(p => p.mappedMainCategory === activeMainCategory);
                    if (activeCategory !== "전체") list = list.filter(p => p.mappedSubCategory === activeCategory);
                }
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    list = list.filter(p => p.name?.toLowerCase().includes(term) || p.option?.toLowerCase().includes(term) || (p.itemCode && p.itemCode.toLowerCase().includes(term)));
                }
                
                if (filterStatus === 'finalized') list = list.filter(p => p.isFinalized);
                else if (filterStatus === 'confirmed') list = list.filter(p => p.isConfirmed);
                else if (filterStatus === 'sample') list = list.filter(p => p.isSampleRequested);
                else if (filterStatus === 'unconfirmed') list = list.filter(p => !p.isConfirmed && !p.isHeld && !p.isFinalized && !p.isSampleRequested);
                else if (filterStatus === 'held') list = list.filter(p => p.isHeld && !p.isConfirmed && !p.isFinalized);
                
                return list.sort((a, b) => {
                    let aValue, bValue;
                    if (sortConfig.key === 'customOrder') {
                        const priorityA = a.isFinalized ? 1 : (a.isConfirmed ? 2 : (a.isSampleRequested ? 3 : (a.isHeld ? 5 : 4)));
                        const priorityB = b.isFinalized ? 1 : (b.isConfirmed ? 2 : (b.isSampleRequested ? 3 : (b.isHeld ? 5 : 4)));
                        if (priorityA !== priorityB) return priorityA - priorityB;
                        aValue = a.customOrder !== undefined ? a.customOrder : -(a.createdAt || 0);
                        bValue = b.customOrder !== undefined ? b.customOrder : -(b.createdAt || 0);
                        if (aValue === bValue) return (b.createdAt || 0) - (a.createdAt || 0);
                    } else if (sortConfig.key === 'margin') {
                        aValue = (a.price || 0) - (a.cost || 0);
                        bValue = (b.price || 0) - (b.cost || 0);
                    } else if (sortConfig.key === 'createdAt') {
                        aValue = a.createdAt || 0;
                        bValue = b.createdAt || 0;
                    } else if (sortConfig.key === 'updatedAt') {
                        aValue = a.updatedAt || a.createdAt || 0;
                        bValue = b.updatedAt || b.createdAt || 0;
                    } else {
                        aValue = a[sortConfig.key] || 0;
                        bValue = b[sortConfig.key] || 0;
                    }
                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                });
            }, [displayProducts, activeProject, activeMainCategory, activeCategory, searchTerm, filterStatus, sortConfig]);

            const startEditingNo = (item, currentNo) => {
                if (sortConfig.key !== 'customOrder' || sortConfig.direction !== 'asc') {
                    showToast("오른쪽 위의 정렬 기준을 '내 임의 정렬 (수동)'으로 설정해야 순서를 바꿀 수 있습니다.", "error");
                    return;
                }
                setEditingNoId(item.id);
                setEditingNoValue(currentNo.toString());
            };

            const submitNewNo = async (item, currentIdx) => {
                setEditingNoId(null);
                const desiredNo = parseInt(editingNoValue, 10);
                if (isNaN(desiredNo) || desiredNo <= 0) return;
                const targetIdx = desiredNo - 1;
                const maxIdx = filteredProducts.length - 1;
                const clampedTargetIdx = Math.max(0, Math.min(targetIdx, maxIdx));
                if (currentIdx === clampedTargetIdx) return;
                const tempArray = filteredProducts.filter((_, idx) => idx !== currentIdx);
                let newOrder;
                if (clampedTargetIdx === 0) {
                    const firstOrder = tempArray[0].customOrder !== undefined ? tempArray[0].customOrder : -(tempArray[0].createdAt || 0);
                    newOrder = firstOrder - 1000;
                } else if (clampedTargetIdx >= tempArray.length) {
                    const lastOrder = tempArray[tempArray.length - 1].customOrder !== undefined ? tempArray[tempArray.length - 1].customOrder : -(tempArray[tempArray.length - 1].createdAt || 0);
                    newOrder = lastOrder + 1000;
                } else {
                    const beforeOrder = tempArray[clampedTargetIdx - 1].customOrder !== undefined ? tempArray[clampedTargetIdx - 1].customOrder : -(tempArray[clampedTargetIdx - 1].createdAt || 0);
                    const afterOrder = tempArray[clampedTargetIdx].customOrder !== undefined ? tempArray[clampedTargetIdx].customOrder : -(tempArray[clampedTargetIdx].createdAt || 0);
                    newOrder = (beforeOrder + afterOrder) / 2;
                }
                try {
                    await supabase.from('products').update({ customOrder: newOrder, updatedAt: Date.now() }).eq('id', item.id);
                    showToast(`${desiredNo}번 위치로 즉시 이동되었습니다.`);
                } catch(e) { console.error(e); showToast("순서 변경 오류", "error"); }
            };

            const handleMoveOrder = async (idx, direction) => {
                if (sortConfig.key !== 'customOrder' || sortConfig.direction !== 'asc') {
                    showToast("오른쪽 위의 정렬 기준을 '내 임의 정렬 (수동)'으로 설정해야 순서를 바꿀 수 있습니다.", "error");
                    return;
                }
                const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
                if (targetIdx < 0 || targetIdx >= filteredProducts.length) return;
                const currentItem = filteredProducts[idx];
                const targetItem = filteredProducts[targetIdx];
                let newOrder;
                if (direction === 'up') {
                    const beforeTarget = filteredProducts[targetIdx - 1];
                    const targetOrder = targetItem.customOrder !== undefined ? targetItem.customOrder : -(targetItem.createdAt || 0);
                    if (beforeTarget) {
                        const beforeOrder = beforeTarget.customOrder !== undefined ? beforeTarget.customOrder : -(beforeTarget.createdAt || 0);
                        newOrder = (beforeOrder + targetOrder) / 2;
                    } else { newOrder = targetOrder - 1000; }
                } else {
                    const afterTarget = filteredProducts[targetIdx + 1];
                    const targetOrder = targetItem.customOrder !== undefined ? targetItem.customOrder : -(targetItem.createdAt || 0);
                    if (afterTarget) {
                        const afterOrder = afterTarget.customOrder !== undefined ? afterTarget.customOrder : -(afterTarget.createdAt || 0);
                        newOrder = (targetOrder + afterOrder) / 2;
                    } else { newOrder = targetOrder + 1000; }
                }
                try {
                    await supabase.from('products').update({ customOrder: newOrder, updatedAt: Date.now() }).eq('id', currentItem.id);
                } catch(e) { console.error(e); showToast("순서 변경 오류", "error"); }
            };

            const toggleStatus = async (item, memberKey) => {
                try {
                    const current = item.approvals?.[memberKey] || 'pending';
                    const next = current === 'approved' ? 'rejected' : (current === 'rejected' ? 'pending' : 'approved');
                    await supabase.from('products').update({ 
                        approvals: { ...(item.approvals || {}), [memberKey]: next }, 
                        updatedAt: Date.now() 
                    }).eq('id', item.id);
                } catch(e) { 
                    console.error("toggleStatus error:", e); 
                    showToast("상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
                }
            };

            const toggleConfirm = async (item) => {
                try {
                    await supabase.from('products').update({ isConfirmed: !item.isConfirmed, isHeld: false, isFinalized: false, updatedAt: Date.now() }).eq('id', item.id);
                } catch(e) { showToast("오류 발생", "error"); }
            };

            const toggleFinalize = async (item) => {
                try {
                    await supabase.from('products').update({ isFinalized: !item.isFinalized, isConfirmed: false, isHeld: false, updatedAt: Date.now() }).eq('id', item.id);
                } catch(e) { showToast("오류 발생", "error"); }
            };

            const toggleHold = async (item) => {
                try {
                    await supabase.from('products').update({ isHeld: !item.isHeld, isConfirmed: false, isFinalized: false, updatedAt: Date.now() }).eq('id', item.id);
                } catch(e) { showToast("오류 발생", "error"); }
            };

            const toggleSample = async (item) => {
                try {
                    await supabase.from('products').update({ isSampleRequested: !item.isSampleRequested, updatedAt: Date.now() }).eq('id', item.id);
                    showToast(item.isSampleRequested ? "샘플 신청이 취소되었습니다." : "샘플이 신청되었습니다.");
                } catch(e) { showToast("오류 발생", "error"); }
            };

            const handleAddOrUpdateProduct = async (e) => {
                e.preventDefault();
                const payload = { 
                    ...productForm, 
                    cost: Number(productForm.cost), 
                    price: Number(productForm.price), 
                    updatedAt: Date.now(),
                    links: productForm.links.filter(l => l.trim()),
                    naverLinks: productForm.naverLinks.filter(l => l.trim())
                };
                try {
                    if (editingItem) {
                        await supabase.from('products').update(payload).eq('id', editingItem.id);
                    } else {
                        const newItemCode = generateItemCode();
                        await supabase.from('products').insert([{ 
                            ...payload, 
                            itemCode: newItemCode, 
                            createdAt: Date.now(), 
                            isConfirmed: false, 
                            isFinalized: false, 
                            isHeld: false, 
                            isSampleRequested: false, 
                            isDeleted: false, 
                            approvals: {} 
                        }]);
                    }
                    setIsAddModalOpen(false);
                    showToast("저장되었습니다.");
                } catch(e) { showToast("저장 오류", "error"); }
            };

            const handleSelectAll = (e) => {
                if (e.target.checked) setSelectedItems(filteredProducts.map(p => p.id));
                else setSelectedItems([]);
            };

            const handleSelectItem = (id) => {
                setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
            };

            const handleBulkDelete = async () => {
                if (!confirm(`선택한 ${selectedItems.length}개 상품을 정말 삭제하시겠습니까?`)) return;
                try {
                    await supabase.from('products').update({ isDeleted: true, updatedAt: Date.now() }).in('id', selectedItems);
                    setSelectedItems([]);
                    showToast(`선택한 항목이 휴지통으로 이동되었습니다.`);
                } catch (e) { showToast("삭제 중 오류가 발생했습니다.", "error"); }
            };

            const handleBulkMove = async (e) => {
                e.preventDefault();
                if (!bulkMoveTarget.project || !bulkMoveTarget.mainCategory || !bulkMoveTarget.category) { showToast("모든 항목을 선택해주세요.", "error"); return; }
                try {
                    await supabase.from('products').update({ 
                        project: bulkMoveTarget.project, 
                        mainCategory: bulkMoveTarget.mainCategory, 
                        category: bulkMoveTarget.category, 
                        updatedAt: Date.now() 
                    }).in('id', selectedItems);
                    setIsBulkMoveModalOpen(false);
                    setSelectedItems([]);
                    showToast(`선택한 항목의 카테고리가 변경되었습니다.`);
                } catch (e) { showToast("이동 중 오류가 발생했습니다.", "error"); }
            };

            const handleDownloadTemplate = () => {
                const headers = ["상품코드", "프로젝트", "대분류", "소분류", "상품명", "옵션", "위안가", "도착가", "판매가", "소싱링크", "경쟁사링크"];
                const example = ["", "2026 여름", "기본 분류", "아쿠아슈즈", "예시 상품명", "빨강/L", "10.5", "5000", "15000", "http://1688.com/... | http://taobao.com/...", "http://smartstore/..."];
                const csvContent = "\uFEFF" + headers.join(",") + "\n" + example.join(",");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "대량등록_빈템플릿.csv";
                link.click();
            };

            const handleDownloadAllAsTemplate = () => {
                const headers = ["상품코드", "프로젝트", "대분류", "소분류", "상품명", "옵션", "위안가", "도착가", "판매가", "소싱링크", "경쟁사링크"];
                const rows = displayProducts.filter(p => !p.isDeleted).map(p => {
                    return [
                        p.itemCode || p.id.slice(-6).toUpperCase(),
                        p.project || "",
                        p.mappedMainCategory || "",
                        p.mappedSubCategory || "",
                        `"${(p.name || "").replace(/"/g, '""')}"`,
                        `"${(p.option || "").replace(/"/g, '""')}"`,
                        p.cny || "",
                        p.cost || 0,
                        p.price || 0,
                        `"${(p.links || []).join(' | ')}"`,
                        `"${(p.naverLinks || []).join(' | ')}"`
                    ].join(",");
                });
                const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "전체상품_백업(업로드양식).csv";
                link.click();
            };

            const handleBulkFileChange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                Papa.parse(file, {
                    header: true, skipEmptyLines: 'greedy', quoteChar: '"', escapeChar: '"',
                    complete: async (results) => {
                        try {
                            let addCount = 0;
                            let updateCount = 0;
                            const defaultApprovals = (settings.teamMembers || []).reduce((acc, m) => ({...acc, [m.key]: 'pending'}), {});
                            
                            const toUpdate = [];
                            const toInsert = [];

                            results.data.forEach(row => {
                                const cleanRow = {};
                                Object.keys(row).forEach(k => { cleanRow[k.trim().replace(/^\uFEFF/, '')] = row[k]; });
                                if (!cleanRow['상품명'] || !cleanRow['상품명'].trim()) return;
                                
                                const existingCode = cleanRow['상품코드'] ? cleanRow['상품코드'].trim() : null;
                                let existingDoc = existingCode ? products.find(p => p.itemCode === existingCode || (p.id && p.id.slice(-6).toUpperCase() === existingCode)) : null;
                                
                                const payload = {
                                    project: cleanRow['프로젝트'] || '', mainCategory: cleanRow['대분류'] || '', category: cleanRow['소분류'] || '',
                                    name: cleanRow['상품명'] ? cleanRow['상품명'].replace(/^"|"$/g, '').trim() : '',
                                    option: cleanRow['옵션'] ? cleanRow['옵션'].replace(/^"|"$/g, '').trim() : '',
                                    cny: Number(cleanRow['위안가']) || 0, cost: Number(cleanRow['도착가']) || 0, price: Number(cleanRow['판매가']) || 0,
                                    links: cleanRow['소싱링크'] ? cleanRow['소싱링크'].replace(/^"|"$/g, '').split('|').map(s=>s.trim()).filter(Boolean) : [],
                                    naverLinks: cleanRow['경쟁사링크'] ? cleanRow['경쟁사링크'].replace(/^"|"$/g, '').split('|').map(s=>s.trim()).filter(Boolean) : [],
                                    updatedAt: Date.now()
                                };

                                if (existingDoc) {
                                    toUpdate.push({ id: existingDoc.id, ...payload });
                                    updateCount++;
                                } else {
                                    toInsert.push({ 
                                        ...payload, 
                                        itemCode: existingCode || generateItemCode(), 
                                        createdAt: Date.now(), 
                                        isConfirmed: false, 
                                        isFinalized: false, 
                                        isHeld: false, 
                                        isSampleRequested: false, 
                                        isDeleted: false, 
                                        approvals: defaultApprovals 
                                    });
                                    addCount++;
                                }
                            });
                            
                            showToast(`데이터 업로드 중...`);
                            
                            // 갱신 (Supabase에서는 여러 개의 각기 다른 데이터를 수정할 때 하나씩 혹은 upsert를 사용)
                            if (toUpdate.length > 0) {
                                await Promise.all(toUpdate.map(item => supabase.from('products').update(item).eq('id', item.id)));
                            }
                            if (toInsert.length > 0) {
                                await supabase.from('products').insert(toInsert);
                            }
                            
                            showToast(`신규 ${addCount}건, 수정 ${updateCount}건 완료`);

                        } catch (err) { showToast("오류: " + err.message, "error"); } finally { setIsBulkModalOpen(false); if(fileInputRef.current) fileInputRef.current.value = ''; }
                    }
                });
            };

            const handleCnyChange = (val) => { 
                const cat = productForm.category;
                const categoryFee = settings.categoryFees?.[cat] || 0; 
                const categoryRatio = settings.categoryRatios?.[cat] || 1.0; 
                const cost = val ? Math.round(val * settings.exchangeRate * categoryRatio) + categoryFee : ''; 
                setProductForm(prev => ({ ...prev, cny: val, cost: cost })); 
            };

            const handleOpenPreview = (item, initialIndex = 0) => {
                const imgData = imageMap[item.id] || {};
                const images = [];
                if (imgData.image) images.push({ label: '대표 이미지', url: imgData.image });
                if (imgData.optionImage) images.push({ label: '옵션 이미지', url: imgData.optionImage });

                if (images.length > 0) { 
                    setPreviewData(images); 
                    setPreviewIndex(Math.min(initialIndex, images.length - 1)); 
                } else {
                    showToast("아직 이미지를 불러오는 중이거나 이미지가 없습니다.", "info");
                }
            };

            const handleDownloadPDF = () => {
                window.print();
            };

            const sidebarGroups = useMemo(() => {
                const groupsMap = new Map();
                (settings.categoryGroups || []).forEach(g => { groupsMap.set(g.main, new Set(g.subs)); });
                displayProducts.forEach(p => {
                    if (p.isDeleted) return;
                    if (activeProject !== "전체" && p.project !== activeProject) return;
                    const main = p.mappedMainCategory;
                    const sub = p.mappedSubCategory;
                    if (!groupsMap.has(main)) groupsMap.set(main, new Set());
                    groupsMap.get(main).add(sub);
                });
                const finalGroups = [];
                (settings.categoryGroups || []).forEach(g => {
                    const officialSubs = g.subs || [];
                    const actualSubs = groupsMap.has(g.main) ? Array.from(groupsMap.get(g.main)) : [];
                    const mergedSubs = Array.from(new Set([...officialSubs, ...actualSubs]));
                    finalGroups.push({ main: g.main, subs: mergedSubs });
                    groupsMap.delete(g.main);
                });
                groupsMap.forEach((subsSet, main) => { finalGroups.push({ main: main, subs: Array.from(subsSet) }); });
                return finalGroups;
            }, [settings.categoryGroups, displayProducts, activeProject]);

            const categoryCounts = useMemo(() => {
                const counts = { main: {}, sub: {} };
                displayProducts.forEach(p => {
                    if (p.isDeleted) return;
                    if (activeProject !== "전체" && p.project !== activeProject) return;
                    if (filterStatus === 'confirmed' && !p.isConfirmed) return;
                    if (filterStatus === 'finalized' && !p.isFinalized) return;
                    if (filterStatus === 'held' && (!p.isHeld || p.isConfirmed || p.isFinalized)) return;
                    if (filterStatus === 'sample' && !p.isSampleRequested) return;
                    if (filterStatus === 'unconfirmed' && (p.isConfirmed || p.isHeld || p.isFinalized || p.isSampleRequested)) return;
                    const mainCat = p.mappedMainCategory;
                    const subCat = p.mappedSubCategory;
                    counts.main[mainCat] = (counts.main[mainCat] || 0) + 1;
                    const subKey = `${mainCat}-${subCat}`;
                    counts.sub[subKey] = (counts.sub[subKey] || 0) + 1;
                });
                return counts;
            }, [displayProducts, activeProject, filterStatus]);

            return (
                <React.Fragment>
                    <div className="pdf-export-container">
                        <h1 className="text-2xl font-black mb-6 text-center">최종 확정 상품 리스트</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>상품 정보</th>
                                    <th>위안가</th>
                                    <th>도착가</th>
                                    <th>판매가</th>
                                    <th>소싱/경쟁사 링크</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.filter(p => p.isFinalized && !p.isDeleted).map((item, idx) => (
                                    <tr key={item.id}>
                                        <td align="center">{idx + 1}</td>
                                        <td align="center">
                                            {imageMap[item.id]?.image ? <img src={imageMap[item.id].image} /> : 'N/A'}
                                        </td>
                                        <td>
                                            <div className="font-black text-indigo-600 mb-1">[{item.project}] {item.mainCategory} &gt; {item.category}</div>
                                            <div className="text-sm font-black mb-1">#{item.itemCode || item.id.slice(-6).toUpperCase()}</div>
                                            <div className="text-base font-black">{item.name}</div>
                                            <div className="text-gray-500">{item.option || '옵션없음'}</div>
                                        </td>
                                        <td align="right" className="font-mono">{item.cny || 0} ¥</td>
                                        <td align="right" className="font-mono">{item.cost?.toLocaleString()}원</td>
                                        <td align="right" className="font-mono font-black">{item.price?.toLocaleString()}원</td>
                                        <td>
                                            <div className="mb-2">
                                                <div className="text-[9px] font-black text-orange-600 mb-1 uppercase">소싱처</div>
                                                {(item.links || []).filter(l => l).map((l, i) => <div key={i} className="mb-1"><a href={l} target="_blank">링크 #{i+1}</a></div>)}
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black text-green-600 mb-1 uppercase">경쟁사</div>
                                                {(item.naverLinks || []).filter(l => l).map((l, i) => <div key={i} className="mb-1"><a href={l} target="_blank">링크 #{i+1}</a></div>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="app-main-container flex h-screen bg-gray-50 overflow-hidden text-sm font-black">
                        <div className={`sidebar-transition bg-white border-r flex flex-col shadow-sm z-20 overflow-hidden ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
                            <div className="p-6 border-b bg-indigo-600 text-white flex-shrink-0">
                                <h1 className="text-xl font-black flex items-center gap-2 tracking-tighter"><Package className="w-6 h-6" /> 소싱 대시보드</h1>
                                <p className="text-[10px] mt-1 opacity-80 uppercase tracking-widest">{userRole === 'admin' ? 'Master 모드' : '팀원 모드'}</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                                <div className="px-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">프로젝트</label>
                                    <select value={activeProject} onChange={(e) => setActiveProject(e.target.value)} className="w-full bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 outline-none">
                                        <option value="전체">전체 보기</option>
                                        {(settings.projects || []).map(pj => <option key={pj} value={pj}>{pj}</option>)}
                                    </select>
                                </div>
                                
                                <div className="px-3 space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">필터</label>
                                    <button onClick={() => {setFilterStatus('all'); setActiveMainCategory('전체'); setActiveCategory('전체');}} className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${filterStatus === 'all' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}>
                                        전체<span>{displayProducts.filter(p => !p.isDeleted && (activeProject === "전체" || p.project === activeProject)).length}</span>
                                    </button>
                                    <button onClick={() => {setFilterStatus('finalized'); setActiveMainCategory('전체'); setActiveCategory('전체');}} className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${filterStatus === 'finalized' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'}`}>
                                        최종확정<span>{displayProducts.filter(p => !p.isDeleted && p.isFinalized && (activeProject === "전체" || p.project === activeProject)).length}</span>
                                    </button>
                                    <button onClick={() => {setFilterStatus('confirmed'); setActiveMainCategory('전체'); setActiveCategory('전체');}} className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${filterStatus === 'confirmed' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}>
                                        선택건<span>{displayProducts.filter(p => !p.isDeleted && p.isConfirmed && (activeProject === "전체" || p.project === activeProject)).length}</span>
                                    </button>
                                    <button onClick={() => {setFilterStatus('sample'); setActiveMainCategory('전체'); setActiveCategory('전체');}} className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${filterStatus === 'sample' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                                        샘플신청<span>{displayProducts.filter(p => !p.isDeleted && p.isSampleRequested && (activeProject === "전체" || p.project === activeProject)).length}</span>
                                    </button>
                                    
                                    {!isConfirmedOnlyView && (
                                        <>
                                            <button onClick={() => {setFilterStatus('unconfirmed'); setActiveMainCategory('전체'); setActiveCategory('전체');}} className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${filterStatus === 'unconfirmed' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                                                진행중<span>{displayProducts.filter(p => !p.isDeleted && !p.isConfirmed && !p.isHeld && !p.isFinalized && !p.isSampleRequested && (activeProject === "전체" || p.project === activeProject)).length}</span>
                                            </button>
                                            <button onClick={() => {setFilterStatus('held'); setActiveMainCategory('전체'); setActiveCategory('전체');}} className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${filterStatus === 'held' ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100'}`}>
                                                보류건<span>{displayProducts.filter(p => !p.isDeleted && p.isHeld && !p.isConfirmed && !p.isFinalized && (activeProject === "전체" || p.project === activeProject)).length}</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="px-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">카테고리</label>
                                    {sidebarGroups.map(group => {
                                        const mainCount = categoryCounts.main[group.main] || 0;
                                        if (mainCount === 0 && activeMainCategory !== group.main) return null;
                                        return (
                                            <div key={group.main} className="mb-1">
                                                <button onClick={() => { setActiveMainCategory(group.main); setActiveCategory("전체"); setExpandedMainCats(p => ({...p, [group.main]: !p[group.main]})); }} className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${activeMainCategory === group.main ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}>
                                                    <span className="flex items-center gap-2 truncate"><FolderTree className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{group.main}</span></span>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className="text-xs text-gray-400">{mainCount}</span>
                                                        {expandedMainCats[group.main] ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
                                                    </div>
                                                </button>
                                                {expandedMainCats[group.main] && (
                                                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100">
                                                        {group.subs.map(sub => {
                                                            const subKey = `${group.main}-${sub}`;
                                                            const subCount = categoryCounts.sub[subKey] || 0;
                                                            if (subCount === 0 && activeCategory !== sub) return null;
                                                            return (
                                                                <button key={sub} onClick={() => { setActiveMainCategory(group.main); setActiveCategory(sub); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${activeCategory === sub ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                                    <span className="truncate">- {sub}</span>
                                                                    <span className="text-[10px] text-gray-400 flex-shrink-0">{subCount}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <CurrencyCalculatorSidebar exchangeRate={settings.exchangeRate} onRateChange={async (r) => { await supabase.from('global_settings').update({ exchangeRate: r }).eq('id', 1); showToast("환율 업데이트 완료"); }} userRole={userRole} />
                                
                                <div className="px-1 space-y-1">
                                    <a href="https://drive.google.com/drive/folders/1wVi8o8T-Vas4mRnBfaI9E_8ualBsqmxR?usp=sharing" target="_blank" className="w-full bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl flex items-center gap-2 text-xs text-indigo-700 hover:bg-indigo-100 mb-2 transition-colors">
                                        <FolderTree className="w-4 h-4"/> 소싱 저장소
                                    </a>
                                    {userRole === 'admin' && (
                                        <button onClick={() => setIsTrashModalOpen(true)} className="w-full bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-center justify-between text-xs text-red-600 hover:bg-red-100"><span className="flex items-center gap-2"><Trash2 className="w-4 h-4"/> 휴지통</span><span>{displayProducts.filter(p => p.isDeleted && (activeProject === "전체" || p.project === activeProject)).length}</span></button>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    {userRole === 'admin' ? (
                                        <>
                                            <button onClick={() => setIsCategorySettingsOpen(true)} className="flex-1 bg-white border py-2 rounded-lg text-indigo-600 shadow-sm text-[11px] hover:bg-gray-50">분류설정</button>
                                            <button onClick={() => setIsSystemSettingsOpen(true)} className="flex-1 bg-white border py-2 rounded-lg text-gray-500 shadow-sm text-[11px] hover:bg-gray-50">시스템</button>
                                        </>
                                    ) : <span className="text-gray-400 flex-1 text-center py-2 text-xs">팀원 모드</span>}
                                </div>
                                <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} className="w-full bg-white border border-gray-200 py-2 rounded-lg text-gray-500 shadow-sm text-[11px] hover:bg-gray-100 flex justify-center items-center gap-1 transition-colors">
                                    <User className="w-3 h-3"/> 로그아웃
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                            <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5" /></button>
                                    <h2 className="text-lg font-black flex items-center gap-2 uppercase">
                                        {activeProject} <ChevronRight className="w-4 h-4 text-gray-300" /> {activeMainCategory === "전체" ? "전체 목록" : activeMainCategory}
                                        {activeCategory !== "전체" && <><ChevronRight className="w-3 h-3 text-gray-300" /> {activeCategory}</>}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer mr-2 shadow-sm">
                                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                                        <select value={`${sortConfig.key}-${sortConfig.direction}`} onChange={(e) => { const [key, direction] = e.target.value.split('-'); setSortConfig({ key, direction }); }} className="bg-transparent border-none text-sm outline-none text-gray-700 cursor-pointer appearance-none font-black">
                                            <option value="customOrder-asc">내 임의 정렬 (수동)</option>
                                            <option value="createdAt-desc">최신 등록순</option>
                                            <option value="createdAt-asc">오래된 등록순</option>
                                            <option value="cny-desc">위안가 높은순</option>
                                            <option value="cny-asc">위안가 낮은순</option>
                                            <option value="price-desc">판매가 높은순</option>
                                            <option value="price-asc">판매가 낮은순</option>
                                            <option value="margin-desc">마진(수익) 높은순</option>
                                            <option value="cost-desc">도착가 높은순</option>
                                            <option value="cost-asc">도착가 낮은순</option>
                                        </select>
                                    </div>

                                    {imageLoadingProgress && imageLoadingProgress.current < imageLoadingProgress.total && (
                                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 shadow-sm">
                                            <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <span className="text-[11px] text-indigo-700 font-black">이미지 로딩중... ({imageLoadingProgress.current}/{imageLoadingProgress.total})</span>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="text" placeholder="통합 검색 (코드/상품명)..." className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm w-64 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>

                                    <button onClick={handleDownloadPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-md hover:bg-red-700 font-bold transition-all">
                                        <FilePdf className="w-4 h-4" /> 확정건 PDF
                                    </button>

                                    {userRole === 'admin' && (
                                        <>
                                            <button onClick={() => setIsBulkModalOpen(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-md hover:bg-gray-900"><Upload className="w-4 h-4" />대량 등록</button>
                                            <button onClick={() => { setEditingItem(null); setProductForm({ project: activeProject === '전체' ? ((settings.projects || [])[0] || '') : activeProject, mainCategory: '', category: '', name: '', option: '', cost: '', price: '', image: null, optionImage: null, cny: '', links: [''], naverLinks: [''] }); setIsAddModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-md hover:bg-indigo-700"><Plus className="w-4 h-4" />신규 등록</button>
                                        </>
                                    )}
                                </div>
                            </header>

                            <main className="flex-1 overflow-auto p-6 relative bg-gray-50 flex flex-col">
                                {userRole === 'admin' && selectedItems.length > 0 && (
                                    <div className="bg-indigo-50 border border-indigo-200 p-3 mb-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in-down flex-shrink-0">
                                        <span className="text-indigo-800 font-bold"><span className="text-indigo-600 text-lg mx-1">{selectedItems.length}</span>개 항목 선택됨</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsBulkMoveModalOpen(true)} className="bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-100 shadow-sm"><FolderTree className="w-4 h-4"/> 카테고리 이동</button>
                                            <button onClick={handleBulkDelete} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-50 shadow-sm"><Trash2 className="w-4 h-4"/> 선택 삭제</button>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left text-sm min-w-[2400px]">
                                            <thead className="bg-gray-50 text-gray-400 border-b uppercase text-[10px] tracking-widest sticky top-0 z-10">
                                                <tr>
                                                    {userRole === 'admin' && (
                                                        <th className="px-4 py-4 w-12 text-center">
                                                            <input type="checkbox" checked={filteredProducts.length > 0 && selectedItems.length === filteredProducts.length} onChange={handleSelectAll} className="w-4 h-4 accent-indigo-600 cursor-pointer"/>
                                                        </th>
                                                    )}
                                                    <th className="px-2 py-4 w-16 text-center">No</th>
                                                    <th className="px-2 py-4 w-16 text-center">순서</th>

                                                    <th className="px-2 py-4 w-28 text-center">이미지</th>
                                                    <th className="px-6 py-4 min-w-[250px]">상품 정보</th>

                                                    <th className="px-3 py-4 text-center w-36">{userRole === 'admin' ? '관리' : '상태'}</th>
                                                    <th className="px-4 py-4 w-72 text-center bg-gray-100">의견 (댓글)</th>
                                                    
                                                    <th className="px-4 py-4 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('createdAt')}>
                                                        <div className="flex items-center justify-center gap-1">등록일시 {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronsUpDown className="w-3 h-3 opacity-30"/>}</div>
                                                    </th>
                                                    <th className="px-4 py-4 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('updatedAt')}>
                                                        <div className="flex items-center justify-center gap-1">수정일시 {sortConfig.key === 'updatedAt' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronsUpDown className="w-3 h-3 opacity-30"/>}</div>
                                                    </th>
                                                    <th className="px-4 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('cny')}>
                                                        <div className="flex items-center justify-end gap-1">위안가 {sortConfig.key === 'cny' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronsUpDown className="w-3 h-3 opacity-30"/>}</div>
                                                    </th>
                                                    <th className="px-4 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('cost')}>
                                                        <div className="flex items-center justify-end gap-1">도착가 {sortConfig.key === 'cost' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronsUpDown className="w-3 h-3 opacity-30"/>}</div>
                                                    </th>
                                                    <th className="px-4 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('price')}>
                                                        <div className="flex items-center justify-end gap-1">판매가 {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronsUpDown className="w-3 h-3 opacity-30"/>}</div>
                                                    </th>
                                                    <th className="px-4 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('margin')}>
                                                        <div className="flex items-center justify-end gap-1">마진(수익) {sortConfig.key === 'margin' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronsUpDown className="w-3 h-3 opacity-30"/>}</div>
                                                    </th>
                                                    
                                                    {(settings.teamMembers || []).map(m => <th key={m.key} className="px-3 py-4 text-center w-16 bg-gray-50">{m.label}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredProducts.map((item, idx) => (
                                                    <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${item.isFinalized ? 'bg-red-50/40' : item.isConfirmed ? 'bg-green-50/30' : item.isHeld ? 'bg-amber-50/30' : ''} ${selectedItems.includes(item.id) ? 'bg-blue-50/30' : ''}`}>
                                                        {userRole === 'admin' && (
                                                            <td className="px-4 py-4 text-center align-middle">
                                                                <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} className="w-4 h-4 accent-indigo-600 cursor-pointer"/>
                                                            </td>
                                                        )}
                                                        <td className="px-2 py-4 text-center font-black align-middle">
                                                            {editingNoId === item.id ? (
                                                                <input type="number" value={editingNoValue} onChange={(e) => setEditingNoValue(e.target.value)} onBlur={() => submitNewNo(item, idx)} onKeyDown={(e) => { if (e.key === 'Enter') submitNewNo(item, idx); else if (e.key === 'Escape') setEditingNoId(null); }} className="w-12 text-center border-2 border-indigo-400 rounded outline-none text-indigo-700 py-1" autoFocus />
                                                            ) : (
                                                                <div onClick={() => { if (userRole === 'admin') startEditingNo(item, idx + 1); else showToast("팀원은 순서를 변경할 수 없습니다.", "error"); }} className={`inline-block px-2 py-1.5 rounded font-mono text-sm transition-all ${userRole === 'admin' && sortConfig.key === 'customOrder' ? 'cursor-pointer text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:scale-110 border border-indigo-100 shadow-sm' : 'text-gray-400'}`} title="숫자를 클릭하여 원하는 순서로 즉시 이동">
                                                                    {idx + 1}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-4 text-center align-middle">
                                                            {userRole === 'admin' && sortConfig.key === 'customOrder' && sortConfig.direction === 'asc' ? (
                                                                <div className="flex flex-col items-center justify-center gap-1">
                                                                    <button onClick={() => handleMoveOrder(idx, 'up')} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-md hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-20 transition-all shadow-sm border"><ChevronUp className="w-4 h-4" /></button>
                                                                    <button onClick={() => handleMoveOrder(idx, 'down')} disabled={idx === filteredProducts.length - 1} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-md hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-20 transition-all shadow-sm border"><ChevronDown className="w-4 h-4" /></button>
                                                                </div>
                                                            ) : <span className="text-[10px] text-gray-300">-</span>}
                                                        </td>
                                                        
                                                        <td className="px-2 py-4 pl-6 align-middle">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {imageMap[item.id] ? (
                                                                    <React.Fragment>
                                                                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex flex-col items-center justify-center overflow-hidden border cursor-pointer relative group shadow-inner flex-shrink-0" onClick={() => handleOpenPreview(item, 0)} title="대표 이미지">
                                                                            {imageMap[item.id].image ? <img src={imageMap[item.id].image} className="absolute inset-0 w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-200"/>}
                                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10"><ZoomIn className="text-white w-5 h-5"/></div>
                                                                        </div>
                                                                        {imageMap[item.id].optionImage && (
                                                                            <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center overflow-hidden border border-amber-200 cursor-pointer relative group shadow-inner flex-shrink-0" onClick={() => handleOpenPreview(item, 1)} title="옵션 이미지">
                                                                                <img src={imageMap[item.id].optionImage} className="absolute inset-0 w-full h-full object-cover" />
                                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10"><ZoomIn className="text-white w-5 h-5"/></div>
                                                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-black py-0.5 z-10">옵션</div>
                                                                            </div>
                                                                        )}
                                                                    </React.Fragment>
                                                                ) : (
                                                                    <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center shadow-sm relative flex-shrink-0">
                                                                        <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-1"></div>
                                                                        <span className="text-[7px] text-gray-400 font-bold">로딩중</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 min-w-[200px] align-middle">
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-100">{item.project}</span>
                                                                    <span className="text-[9px] text-gray-400">{item.mappedMainCategory} &gt; {item.mappedSubCategory}</span>
                                                                </div>
                                                                <div className="text-gray-900 line-clamp-1 flex items-center gap-2 text-base">
                                                                    <span className="text-[9px] text-gray-400 font-mono border border-gray-200 px-1 rounded bg-gray-50">#{item.itemCode || item.id.slice(-6).toUpperCase()}</span>
                                                                    {item.name}
                                                                </div>
                                                                <div className="text-xs text-gray-400 italic line-clamp-1 mt-1">{item.option || '옵션없음'}</div>
                                                                <div className="flex gap-1.5 mt-2">
                                                                    {(item.links || []).filter(l => l).map((l, i) => <a key={i} href={l} target="_blank" className="bg-orange-50 text-orange-600 text-[9px] px-1.5 py-0.5 rounded border border-orange-100 hover:bg-orange-100 transition-colors">소싱 #{i+1}</a>)}
                                                                    {(item.naverLinks || []).filter(l => l).map((l, i) => <a key={i} href={l} target="_blank" className="bg-green-50 text-green-600 text-[9px] px-1.5 py-0.5 rounded border border-green-100 hover:bg-green-100 transition-colors">경쟁 #{i+1}</a>)}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-4 align-middle">
                                                            <div className="grid grid-cols-2 gap-1.5 w-max mx-auto">
                                                                {userRole === 'admin' ? (
                                                                    <>
                                                                        <button onClick={() => toggleFinalize(item)} className={`w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg transition-all ${item.isFinalized ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="확정"><Flag className="w-3 h-3"/> 확정</button>
                                                                        <button onClick={() => toggleConfirm(item)} className={`w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg transition-all ${item.isConfirmed ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="선택"><CheckCircle className="w-3 h-3"/> 선택</button>
                                                                        <button onClick={() => toggleSample(item)} className={`w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg transition-all ${item.isSampleRequested ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="샘플신청"><Truck className="w-3 h-3"/> 샘플</button>
                                                                        <button onClick={() => toggleHold(item)} className={`w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg transition-all ${item.isHeld ? 'bg-amber-50/30 text-amber-500 border border-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="보류"><Clock className="w-3 h-3"/> 보류</button>
                                                                        <button onClick={() => { const imgData = imageMap[item.id] || {}; const fullItem = { ...item, image: imgData.image, optionImage: imgData.optionImage }; setEditingItem(fullItem); setProductForm({ ...fullItem, links: fullItem.links || [''], naverLinks: fullItem.naverLinks || [''] }); setIsAddModalOpen(true); }} className="w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="수정"><Edit2 className="w-3 h-3"/> 수정</button>
                                                                        <button onClick={async () => { if(confirm('삭제하시겠습니까?')) { await supabase.from('products').update({ isDeleted: true, updatedAt: Date.now() }).eq('id', item.id); showToast("휴지통으로 이동되었습니다."); } }} className="w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="삭제"><Trash2 className="w-3 h-3"/> 삭제</button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {item.isFinalized && <span className="w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg bg-red-100 text-red-700 border border-red-200"><Flag className="w-3 h-3"/> 확정</span>}
                                                                        {item.isConfirmed && <span className="w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg bg-green-100 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3"/> 선택</span>}
                                                                        <button onClick={() => toggleSample(item)} className={`w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg transition-all ${item.isSampleRequested ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} title="샘플신청"><Truck className="w-3 h-3"/> 샘플</button>
                                                                        
                                                                        {item.isHeld && <span className="w-full px-2 py-1.5 flex items-center justify-center gap-1 text-[11px] rounded-lg bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3 h-3"/> 보류</span>}
                                                                        
                                                                        {!item.isConfirmed && !item.isFinalized && !item.isHeld && !item.isSampleRequested && <span className="w-full text-[11px] text-gray-400 px-2 py-1.5 flex items-center justify-center col-span-2">진행중</span>}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-4 w-72 min-w-[280px] align-middle bg-gray-50/30 border-r border-gray-100">
                                                            <InlineComments 
                                                                productId={item.id}
                                                                comments={commentsByProduct[item.id] || []}
                                                                userKey={userKey}
                                                                userRole={userRole}
                                                                teamMembers={settings.teamMembers}
                                                            />
                                                        </td>

                                                        <td className="px-4 py-4 text-center align-middle">
                                                            {(() => {
                                                                const dt = formatDateTime(item.createdAt);
                                                                return <div className="flex flex-col items-center justify-center gap-1"><span className="text-[15px] text-gray-800 tracking-wider">{dt.date}</span><span className="text-xs text-gray-500 font-mono">{dt.time}</span></div>;
                                                            })()}
                                                        </td>
                                                        <td className="px-4 py-4 text-center align-middle">
                                                            {(() => {
                                                                const dt = formatDateTime(item.updatedAt || item.createdAt);
                                                                return <div className="flex flex-col items-center justify-center gap-1"><span className="text-[15px] text-gray-800 tracking-wider">{dt.date}</span><span className="text-xs text-gray-500 font-mono">{dt.time}</span></div>;
                                                            })()}
                                                        </td>
                                                        <td className="px-4 py-4 text-right align-middle">
                                                            <div className="text-orange-600 font-mono text-base">{item.cny || 0} ¥</div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right align-middle">
                                                            <div className="text-gray-600 font-mono text-base">{item.cost?.toLocaleString()}원</div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right align-middle">
                                                            <div className="text-indigo-600 font-mono text-lg">{item.price?.toLocaleString()}원</div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right align-middle pr-6">
                                                            <div className="font-mono text-gray-800 text-base">{(item.price - item.cost)?.toLocaleString()}원</div>
                                                            <div className="text-[11px] text-gray-400 font-mono mt-1">({item.price ? (((item.price - item.cost) / item.price) * 100).toFixed(1) : 0}%)</div>
                                                        </td>

                                                        {(settings.teamMembers || []).map((m, i) => (
                                                            <td key={m.key} className={`px-3 py-4 text-center align-middle bg-gray-50/50 ${i === 0 ? 'border-l border-gray-100' : ''}`}>
                                                                <StatusButton status={item.approvals?.[m.key] || 'pending'} onClick={() => { if (userRole === 'admin' || userKey === m.key) toggleStatus(item, m.key); else showToast("본인 이름의 항목만 체크할 수 있습니다.", "error"); }} />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </main>
                        </div>

                        {isBulkMoveModalOpen && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
                                <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl text-indigo-900"><FolderTree className="inline-block w-6 h-6 mr-2" />선택 항목 이동</h3>
                                        <button onClick={() => setIsBulkMoveModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
                                    </div>
                                    <form onSubmit={handleBulkMove} className="space-y-4 text-sm">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 uppercase">이동할 프로젝트</label>
                                            <select value={bulkMoveTarget.project} onChange={(e) => setBulkMoveTarget({...bulkMoveTarget, project: e.target.value})} className="w-full border rounded-lg p-2.5 bg-gray-50 outline-none" required>
                                                <option value="">프로젝트 선택</option>
                                                {(settings.projects || []).map(pj => <option key={pj} value={pj}>{pj}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 uppercase">이동할 대분류</label>
                                            <select value={bulkMoveTarget.mainCategory} onChange={(e) => setBulkMoveTarget({...bulkMoveTarget, mainCategory: e.target.value, category: ''})} className="w-full border rounded-lg p-2.5 bg-gray-50 outline-none" required>
                                                <option value="">대분류 선택</option>
                                                {(settings.categoryGroups || []).map(g => <option key={g.main} value={g.main}>{g.main}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 uppercase">이동할 소분류</label>
                                            <select value={bulkMoveTarget.category} onChange={(e) => setBulkMoveTarget({...bulkMoveTarget, category: e.target.value})} className="w-full border rounded-lg p-2.5 bg-gray-50 outline-none" required>
                                                <option value="">소분류 선택</option>
                                                {(settings.categoryGroups || []).find(g => g.main === bulkMoveTarget.mainCategory)?.subs.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-4 mt-6">
                                            <button type="button" onClick={() => setIsBulkMoveModalOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-xl">취소</button>
                                            <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95">이동 완료</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {isBulkModalOpen && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
                                <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl text-indigo-900"><Upload className="inline-block w-6 h-6 mr-2" />대량 상품 등록 및 수정</h3>
                                        <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
                                    </div>
                                    <div className="space-y-4 text-sm text-gray-600">
                                        <p className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-100">
                                            엑셀(CSV) 파일을 이용해 상품을 일괄 등록/수정할 수 있습니다.<br/><br/>
                                            <b>전체 상품 백업(CSV)</b>를 다운로드하여 <b>'상품코드'</b>를 유지한 채 수정 후 업로드하면 덮어씌워지며, 코드가 없으면 새 상품으로 등록됩니다.
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={handleDownloadTemplate} className="flex-1 bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl flex justify-center items-center gap-2">
                                                <Download className="w-4 h-4" /> 빈 템플릿 다운로드
                                            </button>
                                            <button onClick={handleDownloadAllAsTemplate} className="flex-1 bg-white border-2 border-green-200 text-green-600 hover:bg-green-50 py-3 rounded-xl flex justify-center items-center gap-2">
                                                <Download className="w-4 h-4" /> 전체 상품 백업 (CSV)
                                            </button>
                                        </div>
                                        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleBulkFileChange} style={{display: 'none'}} />
                                        <button onClick={() => fileInputRef.current.click()} className="w-full bg-indigo-600 text-white py-3 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 flex justify-center items-center gap-2">
                                            <Upload className="w-4 h-4" /> 수정한 CSV 업로드하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAddModalOpen && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
                                <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar">
                                    <h3 className="text-xl mb-6 text-indigo-900">{editingItem ? '상품 정보 수정' : '신규 상품 등록'}</h3>
                                    <form onSubmit={handleAddOrUpdateProduct} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div 
                                                className={`h-40 bg-gray-50 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-pointer ${lastTargetZone === 'main' ? 'border-indigo-500 bg-indigo-50 shadow-inner' : 'border-gray-200'}`} 
                                                onClick={() => setLastTargetZone('main')}
                                            >
                                                {productForm.image ? (
                                                    <img src={productForm.image} className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <div className="text-center">
                                                        <ImageIcon className="mx-auto w-6 h-6 text-gray-400 mb-1"/>
                                                        <div className="text-[10px] text-gray-500 font-bold">대표 이미지 (Ctrl+V)</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div 
                                                className={`h-40 bg-gray-50 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-pointer ${lastTargetZone === 'option' ? 'border-amber-500 bg-amber-50 shadow-inner' : 'border-gray-200'}`} 
                                                onClick={() => setLastTargetZone('option')}
                                            >
                                                {productForm.optionImage ? (
                                                    <img src={productForm.optionImage} className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <div className="text-center">
                                                        <ImageIcon className="mx-auto w-6 h-6 text-gray-400 mb-1"/>
                                                        <div className="text-[10px] text-gray-500 font-bold">옵션 이미지 (Ctrl+V)</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-gray-400 uppercase">프로젝트</label>
                                                <select value={productForm.project} onChange={(e) => setProductForm({...productForm, project: e.target.value})} className="w-full border rounded-lg p-2.5 bg-gray-50 outline-none" required>
                                                    {(settings.projects || []).map(pj => <option key={pj} value={pj}>{pj}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-gray-400 uppercase">대분류</label>
                                                <select value={productForm.mainCategory} onChange={(e) => setProductForm({...productForm, mainCategory: e.target.value, category: ''})} className="w-full border rounded-lg p-2.5 bg-gray-50 outline-none" required>
                                                    <option value="">선택</option>
                                                    {(settings.categoryGroups || []).map(g => <option key={g.main} value={g.main}>{g.main}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-400 uppercase">상세 소분류</label>
                                            <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full border rounded-lg p-2.5 bg-gray-50 outline-none" required>
                                                <option value="">선택</option>
                                                {(settings.categoryGroups || []).find(g => g.main === productForm.mainCategory)?.subs.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1"><label className="text-[10px] text-gray-400 uppercase">상품명</label><input type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none" required /></div>
                                            <div className="space-y-1"><label className="text-[10px] text-gray-400 uppercase">옵션 정보</label><input type="text" value={productForm.option} onChange={(e) => setProductForm({...productForm, option: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none" placeholder="예: 빨강/L" /></div>
                                        </div>

                                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                            <div className="flex justify-between mb-3"><label className="text-xs text-indigo-700">자동 원가 계산 공식</label><span className="text-[10px] text-indigo-400">배율: {settings.categoryRatios[productForm.category] || 1}배 | 고정비: {settings.categoryFees[productForm.category] || 0}원</span></div>
                                            <div className="flex gap-4 items-end">
                                                <div className="flex-1"><label className="text-[10px] text-gray-500">위안가 (CNY)</label><input type="number" step="any" value={productForm.cny} onChange={(e) => handleCnyChange(e.target.value)} className="w-full border rounded-lg p-2.5 outline-none font-mono" placeholder="0.00"/></div>
                                                <div className="pb-3 text-indigo-300">→</div>
                                                <div className="flex-1"><label className="text-[10px] text-gray-500">계산된 원가</label><div className="w-full bg-white border border-indigo-200 rounded-lg p-2.5 text-indigo-700 font-mono">{(productForm.cost || 0).toLocaleString()}원</div></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1"><label className="text-[10px] text-gray-400">도착 원가 확정</label><input type="number" value={productForm.cost} onChange={(e) => setProductForm({...productForm, cost: e.target.value})} className="w-full border rounded-lg p-2.5 font-mono" required /></div>
                                            <div className="space-y-1"><label className="text-[10px] text-gray-400">국내 판매가</label><input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full border rounded-lg p-2.5 font-mono" required /></div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between"><label className="text-[10px] text-orange-600 uppercase">소싱처 링크</label><button type="button" onClick={() => setProductForm({...productForm, links: [...productForm.links, '']})} className="text-[9px] text-orange-500">+ 추가</button></div>
                                                {productForm.links.map((l, i) => <input key={i} value={l} onChange={(e) => { const nl = [...productForm.links]; nl[i] = e.target.value; setProductForm({...productForm, links: nl})}} className="w-full border rounded-lg p-2 text-[10px] outline-none" placeholder="URL 입력"/>)}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between"><label className="text-[10px] text-green-600 uppercase">경쟁사 링크</label><button type="button" onClick={() => setProductForm({...productForm, naverLinks: [...productForm.naverLinks, '']})} className="text-[9px] text-green-500">+ 추가</button></div>
                                                {productForm.naverLinks.map((l, i) => <input key={i} value={l} onChange={(e) => { const nl = [...productForm.naverLinks]; nl[i] = e.target.value; setProductForm({...productForm, naverLinks: nl})}} className="w-full border rounded-lg p-2 text-[10px] outline-none" placeholder="URL 입력"/>)}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-6">
                                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-xl">취소</button>
                                            <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl shadow-lg">저장 완료</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {isSystemSettingsOpen && <SystemSettingsModal currentProjects={settings.projects} currentTeam={settings.teamMembers} currentSecurity={security} onClose={() => setIsSystemSettingsOpen(false)} onSave={async (p, t, s) => { await supabase.from('global_settings').update({ projects: p, teamMembers: t }).eq('id', 1); await supabase.from('security_settings').update({ master: s.master, memberPasswords: s.memberPasswords }).eq('id', 1); setIsSystemSettingsOpen(false); showToast("설정 저장됨"); }} />}
                        
                        {isCategorySettingsOpen && <CategorySettingsModal currentGroups={settings.categoryGroups} currentFees={settings.categoryFees} currentRatios={settings.categoryRatios} onClose={() => setIsCategorySettingsOpen(false)} onSave={async (g, f, r, bulk) => { 
                            await supabase.from('global_settings').update({ categoryGroups: g, categoryFees: f, categoryRatios: r }).eq('id', 1); 
                            if(bulk) { 
                                const toUpdate = products.filter(p => p.cny).map(p => ({
                                    id: p.id,
                                    cost: Math.round(p.cny * settings.exchangeRate * (r[p.category]||1)) + (f[p.category]||0)
                                }));
                                await Promise.all(toUpdate.map(u => supabase.from('products').update({ cost: u.cost }).eq('id', u.id)));
                            } 
                            setIsCategorySettingsOpen(false); 
                            showToast("분류 저장됨"); 
                        }} />}
                        
                        {isTrashModalOpen && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
                                <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col h-[80vh]">
                                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                                        <h3 className="text-xl text-red-600 flex items-center gap-2"><Trash2 className="w-6 h-6"/> 휴지통</h3>
                                        <button onClick={() => setIsTrashModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                        {displayProducts.filter(p => p.isDeleted).length === 0 ? (
                                            <div className="text-center text-gray-400 py-10">휴지통이 비어있습니다.</div>
                                        ) : (
                                            displayProducts.filter(p => p.isDeleted).map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 hover:border-red-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-white rounded-lg border flex flex-col items-center justify-center overflow-hidden shadow-sm relative cursor-pointer hover:bg-gray-50" onClick={() => handleOpenPreview(item, 0)}>
                                                            {imageMap[item.id]?.image ? <img src={imageMap[item.id].image} className="absolute inset-0 w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-300" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-800">{item.name} <span className="text-xs text-gray-400">({item.option || '옵션없음'})</span></div>
                                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">#{item.itemCode || item.id.slice(-6).toUpperCase()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={async () => { await supabase.from('products').update({ isDeleted: false, updatedAt: Date.now() }).eq('id', item.id); showToast("항목이 복구되었습니다."); }} className="px-3 py-2 bg-white border border-green-200 text-green-600 rounded-lg text-xs hover:bg-green-50 transition-colors flex items-center gap-1 shadow-sm"><RotateCcw className="w-3.5 h-3.5"/> 복구</button>
                                                        <button onClick={async () => { if(confirm("이 항목을 영구적으로 삭제하시겠습니까?")) { await supabase.from('products').delete().eq('id', item.id); showToast("영구 삭제되었습니다."); } }} className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 transition-colors flex items-center gap-1 shadow-sm"><Trash2 className="w-3.5 h-3.5"/> 영구삭제</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {toast && (
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-indigo-900 text-white toast-slide-in">
                                <CheckCircle className="w-5 h-5 text-indigo-300"/>
                                <span className="text-sm">{toast.message}</span>
                            </div>
                        )}
                        
                        {previewData && previewData.length > 0 && (
                            <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[300]" onClick={(e) => { if(e.target === e.currentTarget) setPreviewData(null); }}>
                                <div className="absolute top-4 right-4 text-white cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setPreviewData(null)}><X className="w-8 h-8" /></div>
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-1.5 rounded-full text-sm border border-white/20">
                                    {previewData[previewIndex].label} <span className="text-gray-400 ml-2">({previewIndex + 1} / {previewData.length})</span>
                                </div>
                                <div className="flex items-center justify-center w-full h-full p-12 relative pointer-events-none">
                                    <img src={previewData[previewIndex].url} className="max-w-full max-h-full object-contain shadow-2xl rounded pointer-events-auto" />
                                </div>
                                {previewData.length > 1 && (
                                    <>
                                        <button className="absolute left-8 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); setPreviewIndex(p => p === 0 ? previewData.length - 1 : p - 1); }}><ChevronRight className="w-8 h-8 rotate-180" /></button>
                                        <button className="absolute right-8 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); setPreviewIndex(p => p === previewData.length - 1 ? 0 : p + 1); }}><ChevronRight className="w-8 h-8" /></button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </React.Fragment>
            );
        }

        function Launcher() {
            const [isReady, setIsReady] = useState(false);
            const [isLoggedIn, setIsLoggedIn] = useState(false);
            const [userRole, setUserRole] = useState(null); 
            const [userKey, setUserKey] = useState(null);

            useEffect(() => {
                const sessionRole = sessionStorage.getItem('team_role');
                const sessionKey = sessionStorage.getItem('team_user_key');
                if (sessionRole) { setUserRole(sessionRole); setUserKey(sessionKey); setIsLoggedIn(true); }
                setIsReady(true);
            }, []);

            if (!isReady) return <div className="loading-container"><div className="spinner"></div><div className="mt-4 text-gray-400 text-xs font-black">시스템 준비 중...</div></div>;
            
            if (!isLoggedIn) return (
                <LoginScreen 
                    onLogin={(role, key) => { 
                        sessionStorage.setItem('team_role', role); 
                        if(key) sessionStorage.setItem('team_user_key', key); 
                        setUserRole(role); 
                        setUserKey(key); 
                        setIsLoggedIn(true); 
                    }} 
                />
            );

            return (
                <ErrorBoundary>
                    <App userRole={userRole} userKey={userKey} />
                </ErrorBoundary>
            );
        }

export default Launcher;

