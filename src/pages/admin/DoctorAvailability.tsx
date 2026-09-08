import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { callBackend } from '../../services/api';
import { Doctor, TimeSlot, DoctorAvailability as AvailabilityType } from '../../types';
import { ArrowLeft, Clock, Plus, Trash2, Ban, CheckCircle, Edit, Calendar } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatTime } from '../../utils/helpers';

export const DoctorAvailability: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [slotForm, setSlotForm] = useState<{
    dayOfWeek: TimeSlot['dayOfWeek'];
    startTime: string;
    endTime: string;
    status: TimeSlot['status'];
  }>({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '13:00',
    status: 'Available'
  });

  const days: TimeSlot['dayOfWeek'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const fetchAvailability = () => {
    setLoading(true);
    Promise.all([
      callBackend({ action: 'GET_DOCTOR', data: { doctorId: id } }),
      callBackend({ action: 'GET_DOCTOR_AVAILABILITY', data: { doctorId: id } })
    ]).then(([docRes, availRes]) => {
      if (docRes.success && docRes.data) {
        setDoctor(docRes.data);
      }
      if (availRes.success && availRes.data) {
        setSchedule(availRes.data.weeklySchedule || []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAvailability();
  }, [id]);

  const handleOpenAdd = (day?: TimeSlot['dayOfWeek']) => {
    setEditingSlot(null);
    setSlotForm({
      dayOfWeek: day || 'Monday',
      startTime: '09:00',
      endTime: '13:00',
      status: 'Available'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status
    });
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: TimeSlot[];
    if (editingSlot) {
      updated = schedule.map(s => (s.id === editingSlot.id ? { ...s, ...slotForm } : s));
    } else {
      const newSlot: TimeSlot = {
        id: `SLOT-${Date.now()}`,
        ...slotForm
      };
      updated = [...schedule, newSlot];
    }

    setSaving(true);
    const res = await callBackend({
      action: 'UPDATE_DOCTOR_AVAILABILITY',
      data: { doctorId: id, weeklySchedule: updated }
    });
    setSaving(false);

    if (res.success) {
      setSchedule(updated);
      setIsModalOpen(false);
      showToast('Weekly schedule updated.', 'success');
    } else {
      showToast('Failed to update schedule.', 'error');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const updated = schedule.filter(s => s.id !== slotId);
    setSaving(true);
    const res = await callBackend({
      action: 'UPDATE_DOCTOR_AVAILABILITY',
      data: { doctorId: id, weeklySchedule: updated }
    });
    setSaving(false);
    if (res.success) {
      setSchedule(updated);
      showToast('Slot removed.', 'info');
    }
  };

  const handleQuickToggleStatus = async (slot: TimeSlot, newStatus: TimeSlot['status']) => {
    const updated = schedule.map(s => (s.id === slot.id ? { ...s, status: newStatus } : s));
    setSchedule(updated);
    await callBackend({
      action: 'UPDATE_DOCTOR_AVAILABILITY',
      data: { doctorId: id, weeklySchedule: updated }
    });
    showToast(`Slot marked as ${newStatus}.`, 'success');
  };

  if (loading || !doctor) {
    return (
      <div>
        <Header title="Manage Doctor Availability" />
        <div className="py-20">
          <Loading message="Loading schedule grid..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Header title={`Weekly Availability: ${doctor.name}`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/doctors')}>
          Back to Doctors
        </Button>

        <div className="flex items-center space-x-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenAdd()}>
            Add Time Slot
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-700">Slot Status Legend:</span>
        <Badge variant="success">Available</Badge>
        <Badge variant="info">Booked</Badge>
        <Badge variant="warning">Blocked</Badge>
        <Badge variant="danger">Unavailable</Badge>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="space-y-4">
        {days.map(day => {
          const daySlots = schedule.filter(s => s.dayOfWeek === day);
          return (
            <Card key={day} className="p-4">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">{day}</h3>
                  <span className="text-xs text-slate-500 font-medium">({daySlots.length} slots)</span>
                </div>
                <Button variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => handleOpenAdd(day)}>
                  Add Slot
                </Button>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No shift slots scheduled for {day}.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-900">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <Badge variant={slot.status === 'Available' ? 'success' : slot.status === 'Booked' ? 'info' : slot.status === 'Blocked' ? 'warning' : 'danger'} size="sm">
                            {slot.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {slot.status === 'Available' && (
                          <button
                            onClick={() => handleQuickToggleStatus(slot, 'Blocked')}
                            className="p-1 rounded text-amber-600 hover:bg-amber-100"
                            title="Block Slot"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {slot.status === 'Blocked' && (
                          <button
                            onClick={() => handleQuickToggleStatus(slot, 'Available')}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-100"
                            title="Unblock Slot"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(slot)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-200"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-100"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal for Add / Edit Time Slot */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
        subtitle={`Configure schedule for ${doctor.name}`}
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          <Select
            label="Day of Week"
            value={slotForm.dayOfWeek}
            onChange={e => setSlotForm({ ...slotForm, dayOfWeek: e.target.value as any })}
            options={days.map(d => ({ value: d, label: d }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={slotForm.startTime}
              onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={slotForm.endTime}
              onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })}
              required
            />
          </div>

          <Select
            label="Slot Availability Status"
            value={slotForm.status}
            onChange={e => setSlotForm({ ...slotForm, status: e.target.value as any })}
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'Booked', label: 'Booked' },
              { value: 'Blocked', label: 'Blocked' },
              { value: 'Unavailable', label: 'Unavailable' }
            ]}
          />

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {editingSlot ? 'Update Slot' : 'Create Slot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
