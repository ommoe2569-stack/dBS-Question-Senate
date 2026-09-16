export interface Question {
  id: string;
  topic: string;
  senatorName: string;
  submitDate: number; // timestamp in ms
  status: 'pending' | 'scheduled' | 'postponed' | 'answered';
  scheduledDate: number | null; // timestamp in ms, representing a Monday
  postponedDate: number | null; // timestamp in ms, if postponed
  orderInDay?: number; // 1, 2, 3, etc.
}

export interface DaySchedule {
  date: number; // timestamp representing midnight
  questions: Question[];
}
