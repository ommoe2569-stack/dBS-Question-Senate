import { useEffect, useState } from 'react';
import { auth, db, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Question, DaySchedule } from './types';
import { calculateSchedule } from './lib/scheduler';
import Login from './components/Login';
import ManageQuestions from './components/ManageQuestions';
import ScheduleDashboard from './components/ScheduleDashboard';
import { LogOut, LayoutDashboard, ListTodo, Menu, X } from 'lucide-react';

import { format, getDate } from 'date-fns';
import { th } from 'date-fns/locale';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'manage'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'questions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(qs);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">กำลังโหลด...</div>;
  }

  if (!user) {
    return <Login />;
  }

  const activeQuestions = questions.filter(q => q.status !== 'answered');
  const schedules = calculateSchedule(activeQuestions, new Date());

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] text-[#1E293B] font-sans overflow-hidden relative">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col shrink-0 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-bold text-white text-sm">สว</div>
            <span className="font-bold tracking-tight text-lg">dBS-Question</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</div>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            แดชบอร์ดสรุปผล
          </button>
          <button
            onClick={() => {
              setActiveTab('manage');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              activeTab === 'manage'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            จัดการกระทู้ถาม
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs text-white uppercase overflow-hidden shrink-0">
              {user.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-[10px] text-slate-400">Firebase Connected</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full md:w-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
              {activeTab === 'dashboard' ? 'ระบบจัดลำดับกระทู้ถาม' : 'จัดการข้อมูลกระทู้ถาม'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 italic hidden lg:block">
              สัปดาห์ที่ {Math.ceil(getDate(new Date()) / 7)} ของเดือน {format(new Date(), 'MMMM yyyy', { locale: th })}
            </span>
            <button 
              onClick={() => {
                const btn = document.activeElement as HTMLElement;
                btn?.blur();
                alert('ประมวลผลและจัดลำดับใหม่เรียบร้อยแล้ว');
              }}
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
            >
              ประมวลผลลำดับใหม่
            </button>
          </div>
        </header>
        
        <section className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col bg-[#F1F5F9]">
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col min-h-0">
            {activeTab === 'dashboard' ? (
              <ScheduleDashboard schedules={schedules} questions={questions} />
            ) : (
              <div className="overflow-auto h-full pr-2 pb-8">
                <ManageQuestions questions={questions} />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
