import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Question } from '../types';
import { Plus, Trash2, Edit2, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  questions: Question[];
}

export default function ManageQuestions({ questions }: Props) {
  const [topic, setTopic] = useState('');
  const [senatorName, setSenatorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [answerConfirmId, setAnswerConfirmId] = useState<string | null>(null);
  const [postponeId, setPostponeId] = useState<string | null>(null);
  const [postponeDateStr, setPostponeDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !senatorName) return;
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'questions', editingId), {
          topic,
          senatorName
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'questions'), {
          topic,
          senatorName,
          submitDate: Date.now(),
          status: 'pending',
          scheduledDate: null,
          postponedDate: null
        });
      }
      setTopic('');
      setSenatorName('');
    } catch (error) {
      console.error(error);
      showError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (q: Question) => {
    setTopic(q.topic);
    setSenatorName(q.senatorName);
    setEditingId(q.id);
    const formElement = document.getElementById('manage-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteDoc(doc(db, 'questions', deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handlePostpone = (id: string) => {
    setPostponeDateStr(format(new Date(), 'yyyy-MM-dd'));
    setPostponeId(id);
  };

  const confirmPostpone = async () => {
    if (postponeId && postponeDateStr) {
      const date = new Date(postponeDateStr);
      if (!isNaN(date.getTime())) {
        await updateDoc(doc(db, 'questions', postponeId), {
          status: 'postponed',
          postponedDate: date.getTime()
        });
        setPostponeId(null);
      } else {
        showError('รูปแบบวันที่ไม่ถูกต้อง');
      }
    }
  };

  const handleSetPending = async (id: string) => {
    await updateDoc(doc(db, 'questions', id), {
      status: 'pending',
      postponedDate: null
    });
  };

  const handleSetAnswered = (id: string) => {
    setAnswerConfirmId(id);
  };

  const confirmAnswer = async () => {
    if (answerConfirmId) {
      await updateDoc(doc(db, 'questions', answerConfirmId), {
        status: 'answered'
      });
      setAnswerConfirmId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="manage-form">
      {errorMsg && (
        <div className="bg-rose-100 text-rose-700 p-4 rounded-xl text-sm font-medium border border-rose-200">
          {errorMsg}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          {editingId ? 'แก้ไขกระทู้ถาม' : 'เพิ่มกระทู้ถามใหม่'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">หัวข้อกระทู้</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 shadow-sm"
              placeholder="เช่น การแก้ไขปัญหาน้ำท่วม..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อสมาชิกวุฒิสภา (ผู้ตั้งกระทู้)</label>
            <input
              type="text"
              value={senatorName}
              onChange={e => setSenatorName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 shadow-sm"
              placeholder="เช่น นายกิตติศักดิ์ รัตนวราหะ"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !topic || !senatorName}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มกระทู้'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTopic('');
                  setSenatorName('');
                }}
                className="px-6 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-slate-500 rounded-full"></span>
            รายการกระทู้ถามทั้งหมด
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {questions.map((q) => (
            <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{q.topic}</h3>
                <p className="text-xs text-slate-500 mt-1">ผู้ตั้งกระทู้: <span className="text-slate-900 font-medium">{q.senatorName}</span></p>
                <div className="flex items-center gap-3 mt-2 text-[11px]">
                  <span className="text-slate-400">ยื่นเรื่อง: {format(new Date(q.submitDate), 'dd/MM/yyyy HH:mm')}</span>
                  {q.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">รอจัดลำดับ</span>}
                  {q.status === 'postponed' && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">เลื่อนไปตอบ: {format(new Date(q.postponedDate!), 'dd/MM/yyyy')}</span>}
                  {q.status === 'answered' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ตอบแล้ว</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {q.status !== 'answered' && (
                  <button onClick={() => handleSetAnswered(q.id)} className="px-3 py-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-md font-bold transition-colors">
                    ตอบแล้ว
                  </button>
                )}
                {q.status === 'pending' && (
                  <button onClick={() => handlePostpone(q.id)} title="เลื่อนกระทู้" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                    <CalendarClock className="w-4 h-4" />
                  </button>
                )}
                {q.status === 'postponed' && (
                  <button onClick={() => handleSetPending(q.id)} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-bold transition-colors">
                    ยกเลิกการเลื่อน
                  </button>
                )}
                <button onClick={() => handleEdit(q)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              ยังไม่มีข้อมูลกระทู้ถาม
            </div>
          )}
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">ยืนยันการลบ</h3>
            <p className="text-slate-500 mb-6 text-sm font-medium">คุณต้องการลบกระทู้ถามนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">ยกเลิก</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-md shadow-sm transition-colors">ลบข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {answerConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">ยืนยันการตอบกระทู้</h3>
            <p className="text-slate-500 mb-6 text-sm font-medium">กระทู้นี้ได้รับการตอบแล้วใช่หรือไม่? (จะถูกนำออกจากการจัดลำดับ)</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAnswerConfirmId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">ยกเลิก</button>
              <button onClick={confirmAnswer} className="px-4 py-2 text-sm font-bold bg-green-600 text-white hover:bg-green-700 rounded-md shadow-sm transition-colors">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {postponeId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">เลื่อนกระทู้</h3>
            <p className="text-slate-500 mb-4 text-sm font-medium">กรุณาระบุวันที่ต้องการเลื่อนไปตอบ</p>
            <input 
              type="date" 
              value={postponeDateStr} 
              onChange={e => setPostponeDateStr(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 rounded-md mb-6 font-medium text-slate-900" 
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPostponeId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">ยกเลิก</button>
              <button onClick={confirmPostpone} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm transition-colors">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
