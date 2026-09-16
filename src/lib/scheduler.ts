import { Question, DaySchedule } from '../types';
import { addDays, nextMonday, isMonday, startOfDay, isSameDay } from 'date-fns';

export function calculateSchedule(questions: Question[], startDate: Date): DaySchedule[] {
  // 1. Sort questions by submitDate
  const sorted = [...questions].sort((a, b) => a.submitDate - b.submitDate);
  
  // 2. Separate postponed and pending
  const postponed = sorted.filter(q => q.status === 'postponed' && q.postponedDate);
  const pending = sorted.filter(q => q.status === 'pending');
  
  const scheduleMap = new Map<number, Question[]>();
  
  // Helper to add question to a day
  const addToDay = (timestamp: number, q: Question) => {
    if (!scheduleMap.has(timestamp)) {
      scheduleMap.set(timestamp, []);
    }
    scheduleMap.get(timestamp)!.push(q);
  };

  // Place postponed questions first
  postponed.forEach(q => {
    const day = startOfDay(new Date(q.postponedDate!)).getTime();
    addToDay(day, q);
  });

  // Start scheduling pending from startDate
  let currentDate = startOfDay(startDate);
  
  for (const q of pending) {
    let placed = false;
    
    while (!placed) {
      const dayTime = currentDate.getTime();
      const dayQuestions = scheduleMap.get(dayTime) || [];
      const postponedOnDay = dayQuestions.filter(dq => dq.status === 'postponed').length;
      
      // A day is valid for scheduling if it's a Monday OR it has postponed questions
      const isValidDay = isMonday(currentDate) || postponedOnDay > 0;
      
      if (isValidDay) {
        const capacity = postponedOnDay + 3;
        const senatorAlreadyAsked = dayQuestions.some(dq => dq.senatorName === q.senatorName);
        
        if (dayQuestions.length < capacity && !senatorAlreadyAsked) {
          addToDay(dayTime, q);
          placed = true;
          // Do not advance currentDate here, so we can try to fit more questions on the same day
          break;
        }
      }
      
      // If we couldn't place the question on currentDate, move to the next day
      currentDate = addDays(currentDate, 1);
    }
  }

  // Convert map to array and sort by date
  const schedules: DaySchedule[] = Array.from(scheduleMap.entries())
    .map(([date, qs]) => ({
      date,
      // Assign order based on status (postponed first) then submitDate
      questions: qs.sort((a, b) => {
        if (a.status === 'postponed' && b.status !== 'postponed') return -1;
        if (a.status !== 'postponed' && b.status === 'postponed') return 1;
        return a.submitDate - b.submitDate;
      }).map((q, idx) => ({ ...q, orderInDay: idx + 1 }))
    }))
    .sort((a, b) => a.date - b.date);

  return schedules;
}
