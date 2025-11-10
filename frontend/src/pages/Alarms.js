import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Bell, Edit } from 'lucide-react';
import { alarmsAPI } from '../utils/api';
import { useAlarm } from '../context/AlarmContext';
import toast from 'react-hot-toast';

const Alarms = () => {
  const { alarms, fetchAlarms } = useAlarm();
  const [showModal, setShowModal] = useState(false);
  const [alarmTime, setAlarmTime] = useState('');
  const [alarmMessage, setAlarmMessage] = useState('');
  const [editingAlarm, setEditingAlarm] = useState(null);

  useEffect(() => {
    fetchAlarms();
  }, []);



  const handleSetAlarm = async (e) => {
    e.preventDefault();
    if (!alarmTime) return;

    try {
      if (editingAlarm) {
        if (activeTimeouts[editingAlarm._id]) {
          clearTimeout(activeTimeouts[editingAlarm._id]);
        }
        
        await alarmsAPI.update(editingAlarm._id, {
          time: alarmTime,
          message: alarmMessage || 'Alarm!'
        });
        toast.success('Alarm updated');
      } else {
        await alarmsAPI.create({
          time: alarmTime,
          message: alarmMessage || 'Alarm!',
          active: true
        });
        toast.success(`Alarm set for ${alarmTime}`);
      }
      
      setShowModal(false);
      setEditingAlarm(null);
      setAlarmTime('');
      setAlarmMessage('');
      fetchAlarms();
    } catch (error) {
      toast.error('Failed to save alarm');
    }
  };

  const handleEditAlarm = (alarm) => {
    setEditingAlarm(alarm);
    setAlarmTime(alarm.time);
    setAlarmMessage(alarm.message);
    setShowModal(true);
  };

  const deleteAlarm = async (id) => {
    try {
      await alarmsAPI.delete(id);
      toast.success('Alarm deleted');
      fetchAlarms();
    } catch (error) {
      toast.error('Failed to delete alarm');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-8 h-8 mr-3 text-blue-600" />
            Alarms
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Alarm
          </button>
        </div>

        {alarms.length > 0 ? (
          <div className="space-y-4">
            {alarms.map((alarm) => (
              <div key={alarm._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {alarm.time}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{alarm.message}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditAlarm(alarm)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteAlarm(alarm._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alarms set</h3>
            <p className="text-gray-600 dark:text-gray-400">Create your first alarm</p>
          </div>
        )}



        {/* Set Alarm Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingAlarm ? 'Edit Alarm' : 'Set New Alarm'}
              </h2>
              
              <form onSubmit={handleSetAlarm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alarm Time
                  </label>
                  <input
                    type="time"
                    required
                    value={alarmTime}
                    onChange={(e) => setAlarmTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alarm Message
                  </label>
                  <input
                    type="text"
                    placeholder="Enter alarm message..."
                    value={alarmMessage}
                    onChange={(e) => setAlarmMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAlarm(null);
                      setAlarmTime('');
                      setAlarmMessage('');
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingAlarm ? 'Update' : 'Set Alarm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alarms;