import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { alarmsAPI } from '../utils/api';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const AlarmContext = createContext();

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarm must be used within an AlarmProvider');
  }
  return context;
};

export const AlarmProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([]);
  const [activeTimeouts, setActiveTimeouts] = useState({});
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const [audioInterval, setAudioInterval] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAlarms();
    }
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
      try {
        await alarmsAPI.delete(ringingAlarm._id);
        
        if (activeTimeouts[ringingAlarm._id]) {
          clearTimeout(activeTimeouts[ringingAlarm._id]);
          setActiveTimeouts(prev => {
            const newTimeouts = { ...prev };
            delete newTimeouts[ringingAlarm._id];
            return newTimeouts;
          });
        }
        
        toast.success('Alarm stopped');
        fetchAlarms();
      } catch (error) {
        toast.error('Failed to delete alarm');
      }
    }
  };

  const value = {
    alarms,
    fetchAlarms,
    setupAlarmTimeout,
    activeTimeouts,
    setActiveTimeouts
  };

  const AlarmModal = () => {
    if (!ringingAlarm) return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: 2147483647 }}
      >
        <div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-1 rounded-3xl animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full mx-4 p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Bell className="w-12 h-12 text-white animate-pulse" />
              </div>
              
              <h2 className="text-4xl font-bold text-red-600 mb-2 animate-pulse">
                🚨 ALARM! 🚨
              </h2>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {ringingAlarm.time}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {ringingAlarm.message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDismiss}
                  className="w-full px-6 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 text-lg font-bold transition-all transform hover:scale-105"
                >
                  ⏰ Snooze (5 min)
                </button>
                
                <button
                  onClick={handleRepeat}
                  className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-lg font-bold transition-all transform hover:scale-105"
                >
                  🔁 Repeat Tomorrow
                </button>
                
                <button
                  onClick={handleStop}
                  className="w-full px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 text-lg font-bold transition-all transform hover:scale-105"
                >
                  ❌ Stop Alarm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <AlarmContext.Provider value={value}>
      {children}
      <AlarmModal />
    </AlarmContext.Provider>
  );
};