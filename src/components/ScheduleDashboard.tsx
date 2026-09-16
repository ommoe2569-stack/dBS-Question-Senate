import { DaySchedule, Question } from '../types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, User, FileText, AlertCircle } from 'lucide-react';

interface Props {
  schedules: DaySchedule[];
  questions: Question[];
}

export default function ScheduleDashboard({ schedules, questions }: Props) {
  const totalCount = questions.length;
  const answeredCount = questions.filter(q => q.status === 'answered').length;
  const pendingCount = questions.filter(q => q.status === 'pending').length;
  const postponedCount = questions.filter(q => q.status === 'postponed').length;

  const currentSchedule = schedules[0];
  const overflowQuestions = schedules.slice(1).flatMap(s => s.questions);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 max-w-5xl mx-auto w-full">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">กระทู้ทั้งหมดในระบบ</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">จัดลำดับแล้ว (เดือนนี้)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{answeredCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">รอจัดลำดับ</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">เลื่อนตอบกระทู้</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{postponedCount}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-4 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              {currentSchedule ? `รายการจัดลำดับประจำวันจันทร์ที่ ${format(new Date(currentSchedule.date), 'd MMMM yyyy', { locale: th })}` : 'ยังไม่มีการจัดลำดับในรอบถัดไป'}
            </h2>
            {currentSchedule && (
              <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                จัดลำดับเรียบร้อย ({currentSchedule.questions.length}/3)
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold w-24">ลำดับ</th>
                  <th className="px-6 py-4 font-semibold w-1/4">ผู้ตั้งกระทู้</th>
                  <th className="px-6 py-4 font-semibold">หัวข้อกระทู้</th>
                  <th className="px-6 py-4 font-semibold w-32">สถานะการยื่น</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {currentSchedule ? (
                  currentSchedule.questions.map((q, idx) => (
                    <tr key={q.id} className={q.status === 'postponed' ? "bg-rose-50/20 hover:bg-rose-50/40 transition-colors" : "hover:bg-slate-50 transition-colors"}>
                      <td className="px-6 py-4 font-bold">
                        {q.status === 'postponed' ? (
                          <div className="text-rose-600 italic leading-tight">
                            <div>พิเศษ</div>
                            <div className="text-xs">(เลื่อน)</div>
                          </div>
                        ) : (
                          <span className="text-slate-600">{String(idx + 1).padStart(2, '0')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{q.senatorName}</td>
                      <td className="px-6 py-4 text-slate-700">{q.topic}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {q.status === 'postponed' ? (
                          <span className="text-rose-600 font-bold tracking-wider">PRIORITY</span>
                        ) : (
                          `ยื่นเมื่อ ${format(new Date(q.submitDate), 'dd MMM', { locale: th })}`
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p>ไม่มีกระทู้ที่รอการจัดลำดับ</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-blue-50/50 border-t border-blue-100/50 text-[11px] text-blue-700 flex gap-4 shrink-0">
            <span>* เงื่อนไข: จัดทุกวันจันทร์ วันละ 3 กระทู้ (ไม่รวมกระทู้เลื่อน)</span>
            <span>* ผู้ตั้งกระทู้ไม่ซ้ำกันในวันเดียวกัน</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">คิวรอการจัดลำดับ</h2>
            <span className="text-xs font-medium text-slate-500">Overflow</span>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-slate-50/30">
            {overflowQuestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {overflowQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold ${idx === 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                        คิวที่ {idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ยื่น {format(new Date(q.submitDate), 'dd MMM', { locale: th })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate mb-1">{q.senatorName}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      หัวข้อ: {q.topic}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                ไม่มีคิวที่ล้นจากสัปดาห์ปัจจุบัน
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
