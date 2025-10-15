import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Bell, Edit } from 'lucide-react';
import { alarmsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Alarms = () => {
  const [alarms, setAlarms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [alarmTime, setAlarmTime] = useState('');
  const [alarmMessage, setAlarmMessage] = useState('');
  const [activeTimeouts, setActiveTimeouts] = useState({});
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const [audioInterval, setAudioInterval] = useState(null);

  useEffect(() => {
    fetchAlarms();
  }, []);

  useEffect(() => {
    if (Array.isArray(alarms)) {
      alarms.forEach(alarm => {
        if (alarm.active && !activeTimeouts[alarm._id]) {
          setupAlarmTimeout(alarm);
        }
      });
    }
  }, [alarms, activeTimeouts]);

  const fetchAlarms = async () => {
    try {
      const response = await alarmsAPI.getAll();
      setAlarms(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Fetch alarms error:', error);
      setAlarms([]);
      toast.error('Failed to fetch alarms');
    }
  };

  const playAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const interval = setInterval(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      }, 1000);
      
      setAudioInterval(interval);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const stopAlarmSound = () => {
    if (audioInterval) {
      clearInterval(audioInterval);
      setAudioInterval(null);
    }
  };

  const setupAlarmTimeout = (alarm) => {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':');
    const alarmDate = new Date();
    alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const timeUntilAlarm = alarmDate.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      setRingingAlarm(alarm);
      playAlarmSound();
    }, timeUntilAlarm);

    setActiveTimeouts(prev => ({ ...prev, [alarm._id]: timeoutId }));
  };

  const handleDismiss = () => {
    stopAlarmSound();
    setRingingAlarm(null);
    if (ringingAlarm) {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
      const hours = snoozeTime.getHours().toString().padStart(2, '0');
      const minutes = snoozeTime.getMinutes().toString().padStart(2, '0');
      
      const snoozeAlarm = { ...ringingAlarm, time: `${hours}:${minutes}` };
      setupAlarmTimeout(snoozeAlarm);
      toast.success('Alarm snoozed for 5 minutes');
    }
  };

  const handleRepeat = () => {
    stopAlarmSound();
    setRingingAlarm(null);
    if (ringingAlarm) {
      setupAlarmTimeout(ringingAlarm);
      toast.success('Alarm set for tomorrow');
    }
  };

  const handleStop = async () => {
    stopAlarmSound();
    setRingingAlarm(null);
    if (ringingAlarm) {
      await deleteAlarm(ringingAlarm._id);
      toast.success('Alarm stopped');
    }
  };

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
          message: alarmMessage || 'Alarm!'
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
      
      if (activeTimeouts[id]) {
        clearTimeout(activeTimeouts[id]);
        setActiveTimeouts(prev => {
          const newTimeouts = { ...prev };
          delete newTimeouts[id];
          return newTimeouts;
        });
      }
      
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

        {/* Alarm Ringing Modal */}
        {ringingAlarm && (
          <div className="fixed inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-indigo-300 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-4 p-8 shadow-2xl border-4 border-blue-400">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Bell className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-blue-600 mb-2">
                  ALARM!
                </h2>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {ringingAlarm.time}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  {ringingAlarm.message}
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleDismiss}
                    className="w-full px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-lg font-bold"
                  >
                    Dismiss (5 min)
                  </button>
                  
                  <button
                    onClick={handleRepeat}
                    className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg font-bold"
                  >
                    Repeat Tomorrow
                  </button>
                  
                  <button
                    onClick={handleStop}
                    className="w-full px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg font-bold"
                  >
                    Stop Alarm
                  </button>
                </div>
              </div>
            </div>
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