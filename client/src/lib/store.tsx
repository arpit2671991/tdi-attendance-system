import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from 'date-fns';

// --- Types ---

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
}

export interface Session {
  id: string;
  name: string;
  teacherId: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  studentIds: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  sessionId: string;
  presentStudentIds: string[];
  teacherId: string; // The teacher who marked it (usually session teacher)
  durationHours: number; // Calculated based on session length
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'teacher';
  email: string;
}

interface DataContextType {
  teachers: Teacher[];
  students: Student[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  currentUser: User | null;
  
  // Auth
  login: (email: string, role: 'admin' | 'teacher') => boolean;
  logout: () => void;

  // CRUD
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addSession: (session: Omit<Session, 'id'>) => void;
  updateSession: (id: string, session: Partial<Session>) => void;
  deleteSession: (id: string) => void;

  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  
  // Analytics
  getTeacherWorkHours: (teacherId: string, month: Date) => number;
  getStudentAttendanceRate: (studentId: string, month: Date) => number;
  getSessionAttendance: (sessionId: string, date: Date) => AttendanceRecord | undefined;
}

// --- Mock Data ---

const initialTeachers: Teacher[] = [
  { id: 't1', name: 'Sarah Wilson', email: 'sarah@school.edu', department: 'Mathematics' },
  { id: 't2', name: 'James Chen', email: 'james@school.edu', department: 'Science' },
  { id: 't3', name: 'Emily Rodriguez', email: 'emily@school.edu', department: 'History' },
];

const initialStudents: Student[] = [
  { id: 's1', name: 'Alex Johnson', grade: '10th' },
  { id: 's2', name: 'Bella Davis', grade: '10th' },
  { id: 's3', name: 'Charlie Brown', grade: '11th' },
  { id: 's4', name: 'Diana Prince', grade: '11th' },
  { id: 's5', name: 'Evan Wright', grade: '10th' },
];

const initialSessions: Session[] = [
  { 
    id: 'ses1', 
    name: 'Algebra 101', 
    teacherId: 't1', 
    startTime: '09:00', 
    endTime: '10:30', 
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    studentIds: ['s1', 's2', 's5'] 
  },
  { 
    id: 'ses2', 
    name: 'Physics Lab', 
    teacherId: 't2', 
    startTime: '11:00', 
    endTime: '12:30',
    startDate: '2024-01-01',
    endDate: '2024-06-30', 
    studentIds: ['s1', 's2', 's3', 's4'] 
  },
  { 
    id: 'ses3', 
    name: 'World History', 
    teacherId: 't3', 
    startTime: '14:00', 
    endTime: '15:00',
    startDate: '2024-01-01',
    endDate: '2024-12-31', 
    studentIds: ['s3', 's4', 's5'] 
  },
];

// Generate some attendance history for the current month
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const start = startOfMonth(today);
  const days = eachDayOfInterval({ start, end: today });

  days.forEach(day => {
    // Skip weekends for realism (0 = Sunday, 6 = Saturday)
    if (day.getDay() === 0 || day.getDay() === 6) return;
    const dateStr = format(day, 'yyyy-MM-dd');

    initialSessions.forEach(session => {
      // Check if session is active on this date
      if (dateStr < session.startDate || dateStr > session.endDate) return;

      // 90% chance class happened
      if (Math.random() > 0.1) {
        // Randomly select present students
        const present = session.studentIds.filter(() => Math.random() > 0.1); 
        
        // Calculate duration
        const [startH, startM] = session.startTime.split(':').map(Number);
        const [endH, endM] = session.endTime.split(':').map(Number);
        const duration = (endH + endM/60) - (startH + startM/60);

        records.push({
          id: Math.random().toString(36).substr(2, 9),
          date: dateStr,
          sessionId: session.id,
          presentStudentIds: present,
          teacherId: session.teacherId,
          durationHours: duration
        });
      }
    });
  });
  return records;
};

// --- Context Provider ---

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setAttendance(generateMockAttendance());
  }, []);

  // Auth Methods
  const login = (email: string, role: 'admin' | 'teacher'): boolean => {
    if (role === 'admin') {
      if (email === 'admin@school.edu') {
        setCurrentUser({ id: 'admin', name: 'Admin User', role: 'admin', email });
        return true;
      }
    } else {
      const teacher = teachers.find(t => t.email === email);
      if (teacher) {
        setCurrentUser({ id: teacher.id, name: teacher.name, role: 'teacher', email });
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Teachers CRUD
  const addTeacher = (teacher: Omit<Teacher, 'id'>) => {
    setTeachers([...teachers, { ...teacher, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteTeacher = (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
    // Also remove sessions assigned to this teacher? Or set them to unassigned?
    // For simplicity, we'll keep them but they'll have invalid teacherId
  };

  // Students CRUD
  const addStudent = (student: Omit<Student, 'id'>) => {
    setStudents([...students, { ...student, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(students.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    // Remove student from sessions
    setSessions(sessions.map(s => ({
      ...s,
      studentIds: s.studentIds.filter(sid => sid !== id)
    })));
  };

  // Sessions CRUD
  const addSession = (session: Omit<Session, 'id'>) => {
    setSessions([...sessions, { ...session, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    // Remove existing record for same session/date if exists (update)
    const filtered = attendance.filter(a => !(a.sessionId === record.sessionId && a.date === record.date));
    setAttendance([...filtered, newRecord]);
  };

  const getTeacherWorkHours = (teacherId: string, month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return attendance
      .filter(r => {
        const d = new Date(r.date);
        return r.teacherId === teacherId && d >= start && d <= end;
      })
      .reduce((total, r) => total + r.durationHours, 0);
  };

  const getStudentAttendanceRate = (studentId: string, month: Date) => {
     const start = startOfMonth(month);
     const end = endOfMonth(month);

     // Find all sessions this student is enrolled in
     const studentSessions = sessions.filter(s => s.studentIds.includes(studentId));
     const sessionIds = studentSessions.map(s => s.id);

     // Find all attendance records for these sessions in the month
     const relevantRecords = attendance.filter(r => {
        const d = new Date(r.date);
        return sessionIds.includes(r.sessionId) && d >= start && d <= end;
     });

     if (relevantRecords.length === 0) return 100; // No classes held? Perfect attendance logic or N/A

     const presentCount = relevantRecords.filter(r => r.presentStudentIds.includes(studentId)).length;
     return (presentCount / relevantRecords.length) * 100;
  };

  const getSessionAttendance = (sessionId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.find(r => r.sessionId === sessionId && r.date === dateStr);
  };

  return (
    <DataContext.Provider value={{ 
      teachers, students, sessions, attendance, currentUser,
      login, logout,
      addTeacher, updateTeacher, deleteTeacher,
      addStudent, updateStudent, deleteStudent,
      addSession, updateSession, deleteSession,
      markAttendance,
      getTeacherWorkHours, getStudentAttendanceRate, getSessionAttendance
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
