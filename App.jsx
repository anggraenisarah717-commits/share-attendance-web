import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Users, BarChart3, Clock, Download, 
  Search, Plus, Trash2, CheckCircle, Sparkles, Printer, UserX,
  Building2, ShieldCheck, FileSpreadsheet, RefreshCw, Check, X, AlertCircle
} from 'lucide-react';

// 12 Bulan Lengkap
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const TIME_SLOTS = [
  { id: 'pagi', label: 'Pagi', time: '09.00 - 11.00 WIB' },
  { id: 'siang', label: 'Siang', time: '13.00 - 15.00 WIB' },
  { id: 'sore', label: 'Sore', time: '16.00 - 17.00 WIB' },
  { id: 'malam', label: 'Malam', time: '19.00 - 21.00 WIB' },
];

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const INITIAL_MEMBERS = [
  { id: '1', name: 'Ahmad Fauzi', role: 'Ketua Departemen' },
  { id: '2', name: 'Siti Nurhaliza', role: 'Sekretaris' },
  { id: '3', name: 'Budi Kurniawan', role: 'Staff Entrepreneurship' },
  { id: '4', name: 'Dewi Rahmawati', role: 'Staff Finance & Sharia' },
  { id: '5', name: 'Eko Prasetyo', role: 'Staff Marketing' },
];

const STATUS_COLORS = {
  Free: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200',
  Akademik: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
  Lainnya: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('rekap'); // 'rekap', 'schedule', 'attendance', 'members'
  const [selectedMonth, setSelectedMonth] = useState('Oktober');
  
  // LocalStorage for Persistence
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('share_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Staff');
  const [searchQuery, setSearchQuery] = useState('');

  // Schedules state per month, day, timeslot, member
  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('share_schedules');
    if (saved) return JSON.parse(saved);

    const initial = {};
    MONTHS.forEach(m => {
      initial[m] = {};
      DAYS.forEach(d => {
        initial[m][d] = {};
        TIME_SLOTS.forEach(s => {
          initial[m][d][s.id] = {};
          INITIAL_MEMBERS.forEach(mem => {
            const rand = Math.random();
            initial[m][d][s.id][mem.id] = {
              status: rand > 0.45 ? 'Free' : rand > 0.2 ? 'Akademik' : 'Lainnya',
              note: ''
            };
          });
        });
      });
    });
    return initial;
  });

  // Attendance/Permission Records
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('share_attendance');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'att-101',
        memberId: '1',
        memberName: 'Ahmad Fauzi',
        month: 'Oktober',
        day: 'Senin',
        dateStr: '2026-10-19',
        timeSlot: 'Pagi (09.00 - 11.00 WIB)',
        type: 'Izin',
        reason: 'Ujian Kuliah Syariah',
        status: 'Disetujui',
        createdAt: '2026-10-18 08:30'
      },
      {
        id: 'att-102',
        memberId: '3',
        memberName: 'Budi Kurniawan',
        month: 'Oktober',
        day: 'Rabu',
        dateStr: '2026-10-21',
        timeSlot: 'Malam (19.00 - 21.00 WIB)',
        type: 'Sakit',
        reason: 'Demam & Flu',
        status: 'Disetujui',
        createdAt: '2026-10-18 10:15'
      }
    ];
  });

  const [attForm, setAttForm] = useState({
    memberId: INITIAL_MEMBERS[0]?.id || '',
    month: 'Oktober',
    day: 'Senin',
    timeSlot: TIME_SLOTS[0].label + ' (' + TIME_SLOTS[0].time + ')',
    type: 'Izin',
    reason: ''
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('share_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('share_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('share_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Handle status toggle for schedule
  const handleStatusChange = (month, day, slotId, memberId, newStatus) => {
    setSchedules(prev => {
      const copy = { ...prev };
      if (!copy[month]) copy[month] = {};
      if (!copy[month][day]) copy[month][day] = {};
      if (!copy[month][day][slotId]) copy[month][day][slotId] = {};

      copy[month][day][slotId][memberId] = {
        ...copy[month][day][slotId][memberId],
        status: newStatus
      };
      return copy;
    });
  };

  // Add Member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newId = 'mem-' + Date.now();
    const newMem = { id: newId, name: newMemberName.trim(), role: newMemberRole };
    
    setMembers(prev => [...prev, newMem]);
    setNewMemberName('');

    // Populate default schedules for new member
    setSchedules(prev => {
      const copy = { ...prev };
      MONTHS.forEach(m => {
        if (!copy[m]) copy[m] = {};
        DAYS.forEach(d => {
          if (!copy[m][d]) copy[m][d] = {};
          TIME_SLOTS.forEach(s => {
            if (!copy[m][d][s.id]) copy[m][d][s.id] = {};
            copy[m][d][s.id][newId] = { status: 'Free', note: '' };
          });
        });
      });
      return copy;
    });
  };

  // Delete Member
  const handleDeleteMember = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini dari sistem?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  // Attendance Form Submit
  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    const mem = members.find(m => m.id === attForm.memberId);
    if (!mem || !attForm.reason.trim()) {
      alert('Harap lengkapi alasan pengajuan!');
      return;
    }

    const newRec = {
      id: 'att-' + Date.now(),
      memberId: attForm.memberId,
      memberName: mem.name,
      month: attForm.month,
      day: attForm.day,
      dateStr: new Date().toISOString().split('T')[0],
      timeSlot: attForm.timeSlot,
      type: attForm.type,
      reason: attForm.reason,
      status: 'Disetujui',
      createdAt: new Date().toLocaleString('id-ID')
    };

    setAttendanceRecords(prev => [newRec, ...prev]);
    setAttForm(prev => ({ ...prev, reason: '' }));
    alert('Catatan Kehadiran / Izin berhasil disimpan!');
  };

  // --- REKAPITULASI CALCULATIONS ---
  const rekapData = useMemo(() => {
    const monthSchedule = schedules[selectedMonth] || {};
    
    // Per Member Monthly Stats
    const memberMonthly = {};
    members.forEach(m => {
      memberMonthly[m.id] = {
        name: m.name,
        role: m.role,
        free: 0,
        akademik: 0,
        lainnya: 0,
        total: 0,
        freePercent: 0
      };
    });

    // Best Time Slot Matrix
    const daySlotSummary = {};
    DAYS.forEach(d => {
      daySlotSummary[d] = {};
      TIME_SLOTS.forEach(s => {
        daySlotSummary[d][s.id] = { free: 0, total: members.length };
      });
    });

    DAYS.forEach(d => {
      TIME_SLOTS.forEach(s => {
        members.forEach(m => {
          const st = monthSchedule[d]?.[s.id]?.[m.id]?.status || 'Free';
          if (memberMonthly[m.id]) {
            memberMonthly[m.id].total += 1;
            if (st === 'Free') memberMonthly[m.id].free += 1;
            else if (st === 'Akademik') memberMonthly[m.id].akademik += 1;
            else if (st === 'Lainnya') memberMonthly[m.id].lainnya += 1;
          }

          if (st === 'Free') {
            daySlotSummary[d][s.id].free += 1;
          }
        });
      });
    });

    Object.keys(memberMonthly).forEach(id => {
      const obj = memberMonthly[id];
      obj.freePercent = obj.total > 0 ? Math.round((obj.free / obj.total) * 100) : 0;
    });

    // Find Best Slot
    let bestDay = 'Senin';
    let bestSlot = 'malam';
    let maxFree = -1;

    DAYS.forEach(d => {
      TIME_SLOTS.forEach(s => {
        if (daySlotSummary[d][s.id].free > maxFree) {
          maxFree = daySlotSummary[d][s.id].free;
          bestDay = d;
          bestSlot = s.id;
        }
      });
    });

    const bestSlotObj = TIME_SLOTS.find(s => s.id === bestSlot);
    const monthAttRecords = attendanceRecords.filter(r => r.month === selectedMonth);

    // 12-Month Summary Per Member
    const yearlyMemberSummary = members.map(m => {
      let yFree = 0;
      let yTotal = 0;

      MONTHS.forEach(mName => {
        const mSch = schedules[mName] || {};
        DAYS.forEach(d => {
          TIME_SLOTS.forEach(s => {
            const st = mSch[d]?.[s.id]?.[m.id]?.status || 'Free';
            yTotal += 1;
            if (st === 'Free') yFree += 1;
          });
        });
      });

      return {
        id: m.id,
        name: m.name,
        role: m.role,
        yearlyFree: yFree,
        yearlyTotal: yTotal,
        yearlyPercent: yTotal > 0 ? Math.round((yFree / yTotal) * 100) : 0
      };
    });

    return {
      monthlyMemberList: Object.values(memberMonthly),
      yearlyMemberList: yearlyMemberSummary,
      bestSlotInfo: {
        day: bestDay,
        slotLabel: bestSlotObj?.label,
        slotTime: bestSlotObj?.time,
        freeCount: maxFree,
        freePercent: members.length > 0 ? Math.round((maxFree / members.length) * 100) : 0
      },
      attendanceCount: monthAttRecords.length,
      attendanceList: monthAttRecords
    };
  }, [schedules, selectedMonth, members, attendanceRecords]);

  // Export to CSV Spreadsheet
  const handleExportSpreadsheet = () => {
    let csv = `REKAP KESIBUKAN DEPARTEMEN SHARIA ENTREPRENEURSHIP (SharE)
`;
    csv += `Periode Bulan: ${selectedMonth}

`;

    csv += `--- REKAP BULANAN (${selectedMonth.toUpperCase()}) ---
`;
    csv += `Nama Anggota,Jabatan,Total Slot,Free (Slot),Free (%),Akademik (Slot),Lainnya (Slot)
`;
    
    rekapData.monthlyMemberList.forEach(m => {
      csv += `"${m.name}","${m.role}",${m.total},${m.free},${m.freePercent}%,${m.akademik},${m.lainnya}
`;
    });

    csv += `
--- REKAP TAHUNAN (12 BULAN LENGKAP) ---
`;
    csv += `Nama Anggota,Jabatan,Total Slot Tahunan,Total Slot Free,Rata-rata Free (%)
`;
    rekapData.yearlyMemberList.forEach(m => {
      csv += `"${m.name}","${m.role}",${m.yearlyTotal},${m.yearlyFree},${m.yearlyPercent}%
`;
    });

    csv += `
--- CATATAN KEHADIRAN / IZIN DEPARTEMEN (${selectedMonth.toUpperCase()}) ---
`;
    csv += `Nama Anggota,Tanggal,Hari,Sesi Waktu,Jenis,Alasan Ketidakhadiran,Status
`;
    rekapData.attendanceList.forEach(a => {
      csv += `"${a.memberName}","${a.dateStr}","${a.day}","${a.timeSlot}","${a.type}","${a.reason}","${a.status}"
`;
    });

    const blob = new Blob(["﻿" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Presensi_Sharia_Entrepreneurship_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* HEADER NAVBAR */}
      <header className="bg-emerald-800 text-white shadow-xl sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2.5 rounded-xl text-emerald-950 shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Departemen Sharia Entrepreneurship</h1>
              <p className="text-xs text-emerald-200">Aplikasi Presensi & Kesibukan Anggota (SharE)</p>
            </div>
          </div>

          {/* 12 Months Selector */}
          <div className="flex items-center bg-emerald-900/80 p-1.5 rounded-xl border border-emerald-600/40 max-w-full overflow-x-auto">
            <span className="text-xs font-semibold text-emerald-200 px-2 whitespace-nowrap">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-amber-400 text-emerald-950 font-bold text-xs py-1.5 px-3 rounded-lg border-none outline-none cursor-pointer"
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="bg-emerald-900/60 border-t border-emerald-700/50">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-2 py-2">
            <button
              onClick={() => setActiveTab('rekap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'rekap' 
                  ? 'bg-white text-emerald-900 shadow-md' 
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Rekap & Spreadsheet
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'schedule' 
                  ? 'bg-white text-emerald-900 shadow-md' 
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              Matriks Jadwal Kesibukan
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'attendance' 
                  ? 'bg-white text-emerald-900 shadow-md' 
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <UserX className="w-4 h-4 text-rose-500" />
              Presensi & Form Izin
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'members' 
                  ? 'bg-white text-emerald-900 shadow-md' 
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Users className="w-4 h-4 text-amber-500" />
              Kelola Anggota ({members.length})
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: REKAP & SPREADSHEET */}
        {activeTab === 'rekap' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                  Rekap Presensi & Kesibukan ({selectedMonth})
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Data otomatis terakumulasi per bulan dan per tahun (12 bulan lengkap).
                </p>
              </div>

              <div className="flex items-center gap-3 print:hidden">
                <button
                  onClick={handleExportSpreadsheet}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Excel / CSV Spreadsheet
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* KEY STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Anggota</p>
                  <p className="text-2xl font-extrabold text-slate-800">{members.length} Orang</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jam Emas Rapat</p>
                  <p className="text-sm font-bold text-emerald-800">
                    {rekapData.bestSlotInfo.day}, {rekapData.bestSlotInfo.slotLabel}
                  </p>
                  <p className="text-xs text-slate-500">{rekapData.bestSlotInfo.freeCount} anggota free ({rekapData.bestSlotInfo.freePercent}%)</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Izin ({selectedMonth})</p>
                  <p className="text-2xl font-extrabold text-slate-800">{rekapData.attendanceCount} Laporan</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rentang Jam Sesi</p>
                  <p className="text-sm font-bold text-slate-800">4 Sesi Jam</p>
                  <p className="text-xs text-slate-500">Pagi, Siang, Sore, Malam</p>
                </div>
              </div>
            </div>

            {/* TABEL REKAP BULANAN */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Rekapitulasi Ketersediaan Anggota - Bulan {selectedMonth}</h3>
                  <p className="text-xs text-slate-500">Persentase ketersediaan waktu luang (Free) per anggota</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama anggota..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-6 font-semibold">Nama Anggota</th>
                      <th className="py-3.5 px-4 font-semibold">Jabatan</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Free (%)</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Slot Free</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Akademik</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Lainnya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapData.monthlyMemberList
                      .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(m => (
                        <tr key={m.name} className="hover:bg-slate-50">
                          <td className="py-4 px-6 font-bold text-slate-800">{m.name}</td>
                          <td className="py-4 px-4 text-xs text-slate-500">{m.role}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              m.freePercent >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {m.freePercent}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-semibold text-emerald-700">{m.free} Slot</td>
                          <td className="py-4 px-4 text-center font-semibold text-blue-700">{m.akademik} Slot</td>
                          <td className="py-4 px-4 text-center font-semibold text-amber-700">{m.lainnya} Slot</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL REKAP 12 BULAN TAHUNAN */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Rekapitulasi Akumulasi Tahunan (12 Bulan Lengkap)</h3>
                <p className="text-xs text-slate-500">Statistik ketersediaan anggota sepanjang tahun (Januari - Desember)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-6 font-semibold">Nama Anggota</th>
                      <th className="py-3.5 px-4 font-semibold">Jabatan</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Total Slot (12 Bln)</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Total Slot Free</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Rata-Rata Free (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapData.yearlyMemberList.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-4 px-6 font-bold text-slate-800">{m.name}</td>
                        <td className="py-4 px-4 text-xs text-slate-500">{m.role}</td>
                        <td className="py-4 px-4 text-center font-medium text-slate-600">{m.yearlyTotal} Slot</td>
                        <td className="py-4 px-4 text-center font-bold text-emerald-700">{m.yearlyFree} Slot</td>
                        <td className="py-4 px-4 text-center font-extrabold text-emerald-800">{m.yearlyPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MATRIKS JADWAL KESIBUKAN */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Matriks Kesibukan Anggota - Bulan {selectedMonth}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Klik pada tombol di dalam tabel untuk mengubah status kesibukan (*Free*, *Akademik*, *Lainnya*).
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Keterangan:</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">Free</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800">Akademik</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800">Lainnya</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-emerald-900 text-white">
                      <th className="py-3 px-4 font-semibold sticky left-0 bg-emerald-950 z-10 w-44">Nama Anggota</th>
                      {DAYS.map(d => (
                        <th key={d} colSpan={TIME_SLOTS.length} className="py-2 px-2 text-center border-l border-emerald-700 font-bold">
                          {d}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-emerald-800 text-emerald-100 border-b border-emerald-700">
                      <th className="py-2 px-4 sticky left-0 bg-emerald-900 z-10"></th>
                      {DAYS.map(d => 
                        TIME_SLOTS.map(s => (
                          <th key={d + s.id} className="py-2 px-1 text-center font-medium border-l border-emerald-700/50 w-20">
                            {s.label}
                            <span className="block text-[10px] text-emerald-300 font-normal">{s.time.split(' ')[0]}</span>
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-800 sticky left-0 bg-white shadow-sm border-r border-slate-200 z-10 whitespace-nowrap">
                          {m.name}
                        </td>
                        {DAYS.map(d => 
                          TIME_SLOTS.map(s => {
                            const curStatus = schedules[selectedMonth]?.[d]?.[s.id]?.[m.id]?.status || 'Free';
                            return (
                              <td key={d + s.id + m.id} className="p-1 border-l border-slate-100 text-center">
                                <button
                                  onClick={() => {
                                    const nextStatus = curStatus === 'Free' ? 'Akademik' : curStatus === 'Akademik' ? 'Lainnya' : 'Free';
                                    handleStatusChange(selectedMonth, d, s.id, m.id, nextStatus);
                                  }}
                                  className={`w-full py-2 px-1 rounded-lg text-[11px] font-bold border transition-all ${STATUS_COLORS[curStatus]}`}
                                >
                                  {curStatus}
                                </button>
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRESENSI & FORM IZIN */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-500" />
                Form Izin / Presensi Halangan
              </h3>
              <p className="text-xs text-slate-500 mb-6">Anggota yang tidak bisa hadir dapat mengajukan izin di sini.</p>

              <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Anggota</label>
                  <select
                    value={attForm.memberId}
                    onChange={e => setAttForm(p => ({ ...p, memberId: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan</label>
                    <select
                      value={attForm.month}
                      onChange={e => setAttForm(p => ({ ...p, month: e.target.value }))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                    >
                      {MONTHS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hari</label>
                    <select
                      value={attForm.day}
                      onChange={e => setAttForm(p => ({ ...p, day: e.target.value }))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Sesi Jam</label>
                  <select
                    value={attForm.timeSlot}
                    onChange={e => setAttForm(p => ({ ...p, timeSlot: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    {TIME_SLOTS.map(s => (
                      <option key={s.id} value={`${s.label} (${s.time})`}>
                        {s.label} ({s.time})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Ketidakhadiran</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan alasan izin/halangan hadir..."
                    value={attForm.reason}
                    onChange={e => setAttForm(p => ({ ...p, reason: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Kirim Catatan Presensi
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Daftar Riwayat Izin & Presensi Halangan</h3>
              <p className="text-xs text-slate-500 mb-6">Riwayat pengajuan izin anggota Departemen SharE bulan {selectedMonth}</p>

              <div className="space-y-3">
                {rekapData.attendanceList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Belum ada pengajuan izin di bulan {selectedMonth}.</p>
                ) : (
                  rekapData.attendanceList.map(rec => (
                    <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">{rec.memberName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{rec.type}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1"><strong>{rec.month}</strong> ({rec.day}) - {rec.timeSlot}</p>
                        <p className="text-xs text-slate-500 italic mt-0.5">"{rec.reason}"</p>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KELOLA ANGGOTA (TAMBAH & HAPUS OTOMATIS) */}
        {activeTab === 'members' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Tambah Anggota SharE Baru</h3>
              <p className="text-xs text-slate-500 mb-4">Anggota baru akan otomatis terdaftar di matriks jadwal 12 bulan.</p>

              <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap Anggota..."
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="sm:col-span-1 p-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                />

                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="sm:col-span-1 p-2.5 border border-slate-200 rounded-xl text-xs outline-none"
                >
                  <option value="Ketua Departemen">Ketua Departemen</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Staff Entrepreneurship">Staff Entrepreneurship</option>
                  <option value="Staff Finance & Sharia">Staff Finance & Sharia</option>
                  <option value="Staff Marketing">Staff Marketing</option>
                  <option value="Anggota">Anggota General</option>
                </select>

                <button
                  type="submit"
                  className="sm:col-span-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Anggota
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Daftar Anggota Departemen Sharia Entrepreneurship</h3>
                  <p className="text-xs text-slate-500">Total {members.length} Anggota Terdaftar</p>
                </div>
              </div>

              <ul className="divide-y divide-slate-100">
                {members.map(m => (
                  <li key={m.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shadow-inner">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Anggota"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
