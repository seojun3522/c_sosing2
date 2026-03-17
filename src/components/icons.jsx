import React from 'react';

        const IconBase = ({ children, className, ...props }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
        );

        const Icons = {
            Package: (props) => <IconBase {...props}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-10"/></IconBase>,
            Search: (props) => <IconBase {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></IconBase>,
            Check: (props) => <IconBase {...props}><path d="M20 6 9 17l-5-5"/></IconBase>,
            X: (props) => <IconBase {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>,
            Minus: (props) => <IconBase {...props}><path d="M5 12h14"/></IconBase>,
            Calculator: (props) => <IconBase {...props}><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><path d="M16 14v4M12 14v4M8 14v4M12 10h.01M8 10h.01M16 10h.01"/></IconBase>,
            ImageIcon: (props) => <IconBase {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></IconBase>,
            Trash2: (props) => <IconBase {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></IconBase>,
            Plus: (props) => <IconBase {...props}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>,
            Settings: (props) => <IconBase {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></IconBase>,
            Edit2: (props) => <IconBase {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></IconBase>,
            StickyNote: (props) => <IconBase {...props}><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></IconBase>,
            ChevronRight: (props) => <IconBase {...props}><path d="m9 18 6-6-6-6"/></IconBase>,
            LayoutDashboard: (props) => <IconBase {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></IconBase>,
            CheckCircle: (props) => <IconBase {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>,
            ZoomIn: (props) => <IconBase {...props}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></IconBase>,
            Cloud: (props) => <IconBase {...props}><path d="M17.5 19c0-1.7-1.3-3-3-3h-1.6c-.3-2.3-2.2-4-4.4-4-2.5 0-4.5 2-4.5 4.5v.5"/><path d="M17.5 19H9c-2.2 0-4-1.8-4-4"/><path d="M20.4 14.5c.8.5 1.6 1.5 1.6 2.5 0 1.7-1.3 3-3 3h-2.1"/></IconBase>,
            RefreshCw: (props) => <IconBase {...props}><path d="M3 12a9 9 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/></IconBase>,
            Truck: (props) => <IconBase {...props}><rect width="16" height="13" x="2" y="6" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></IconBase>,
            Menu: (props) => <IconBase {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconBase>,
            Download: (props) => <IconBase {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></IconBase>,
            Upload: (props) => <IconBase {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></IconBase>,
            Clock: (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconBase>,
            Flag: (props) => <IconBase {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></IconBase>,
            ChevronUp: (props) => <IconBase {...props}><polyline points="18 15 12 9 6 15"/></IconBase>,
            ChevronDown: (props) => <IconBase {...props}><polyline points="6 9 12 15 18 9"/></IconBase>,
            ChevronsUp: (props) => <IconBase {...props}><path d="m17 11-5-5-5 5"/><path d="m17 18-5-5-5 5"/></IconBase>,
            ChevronsDown: (props) => <IconBase {...props}><path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/></IconBase>,
            Lock: (props) => <IconBase {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
            Shield: (props) => <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconBase>,
            User: (props) => <IconBase {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconBase>,
            Key: (props) => <IconBase {...props}><path d="m21 2-2 2m-7.6 7.6a6 6 0 1 1-8.4-8.4 6 6 0 0 1 8.4 8.4Zm5.2.5 2-2a2 2 0 0 0 2.8 2.8l-5-5"/><path d="m15 15 3 3"/></IconBase>,
            FileText: (props) => <IconBase {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></IconBase>,
            RotateCcw: (props) => <IconBase {...props}><path d="M3 12a9 9 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/></IconBase>,
            Layers: (props) => <IconBase {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></IconBase>,
            FolderTree: (props) => <IconBase {...props}><path d="M20 10h-7V3"/><path d="M13 21v-7"/><path d="M4 21v-7h5"/><path d="M9 10H4V3h5"/></IconBase>,
            Eye: (props) => <IconBase {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></IconBase>,
            Calendar: (props) => <IconBase {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></IconBase>,
            ChevronsUpDown: (props) => <IconBase {...props}><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></IconBase>,
            ArrowUpDown: (props) => <IconBase {...props}><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></IconBase>,
            MessageSquare: (props) => <IconBase {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></IconBase>,
            Send: (props) => <IconBase {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></IconBase>,
            FilePdf: (props) => <IconBase {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M9 15h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9v2"/><path d="M13 15v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1z"/><path d="M17 15h3v4h-3"/></IconBase>
        };

export { Icons };
export const {
  Package, Search, Check, X, Minus, Calculator, ImageIcon, Trash2, Plus, Settings, Edit2,
  StickyNote, ChevronRight, LayoutDashboard, CheckCircle, ZoomIn, Cloud, RefreshCw, Truck, Menu, Download, Upload, Clock, Flag, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Lock, Shield, User, Key, FileText, RotateCcw, Layers, FolderTree, Eye, Calendar, ChevronsUpDown, ArrowUpDown, MessageSquare, Send, FilePdf,
} = Icons;

