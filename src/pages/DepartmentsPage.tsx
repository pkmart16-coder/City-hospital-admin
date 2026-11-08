import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Stethoscope, 
  Search, 
  Activity, 
  MapPin, 
  Phone, 
  UserCheck
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Department, MedicalService } from '../types';
import { formatPKR } from '../utils/formatters';
import { Modal } from '../components/common/Modal';

export const DepartmentsPage: React.FC = () => {
  const { departments, services, doctors } = useHospital();
  const [activeTab, setActiveTab] = useState<'departments' | 'services'>('departments');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Clinical Departments & Medical Services
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hospital wings, department heads, diagnostic procedures and standard consultation pricing
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'departments'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Clinical Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'services'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Diagnostic Procedures & Standard Fees ({services.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search departments, clinical wings or medical services..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => {
            const facultyCount = doctors.filter(d => d.departmentId === dept.id).length;
            return (
              <div
                key={dept.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {dept.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {facultyCount} Active Doctors
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Head:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.headOfDepartment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">{dept.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Extension:
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">Ext. {dept.contactExtension}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Services List */}
      {activeTab === 'services' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4 font-semibold">Service / Procedure</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Est. Duration</th>
                  <th className="py-3 px-4 font-semibold text-center">Emergency 24/7</th>
                  <th className="py-3 px-4 font-semibold text-right">Standard Fee (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{srv.name}</p>
                      <p className="text-[11px] text-slate-500">{srv.description}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {srv.departmentName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {srv.estimatedDuration}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        srv.isEmergencyAvailable 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {srv.isEmergencyAvailable ? 'Available' : 'OPD Only'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatPKR(srv.standardFee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
