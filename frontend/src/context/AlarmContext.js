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
      console.log('🔑 Token found, fetching alarms...');
      fetchAlarms();
    } else {
      console.log('❌ No token found');
    }
  }, []);

  // Persist timeouts across page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('💾 Saving alarm timeouts to localStorage');
      const timeoutData = {};
      Object.keys(activeTimeouts).forEach(alarmId => {
        const alarm = alarms.find(a => a._id === alarmId);
        if (alarm) {
          timeoutData[alarmId] = {
            alarmTime: alarm.time,
            setAt: Date.now()
          };
        }
      });
      localStorage.setItem('alarmTimeouts', JSON.stringify(timeoutData));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeTimeouts, alarms]);

  useEffect(() => {
    if (Array.isArray(alarms)) {
      console.log('🔄 Processing alarms:', alarms.length);
      
      // Clear all existing timeouts first
      Object.values(activeTimeouts).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      setActiveTimeouts({});
      
      // Set up fresh timeouts for all active alarms
      alarms.forEach(alarm => {
        if (alarm.active) {
          console.log('✅ Setting up fresh timeout for alarm:', alarm.time);
          setupAlarmTimeout(alarm);
        }
      });
    }
  }, [alarms]);

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
    console.log('🚨 Setting alarm timeout:', { 
      alarmTime: alarm.time, 
      timeUntilAlarm: timeUntilAlarm,
      willRingAt: new Date(now.getTime() + timeUntilAlarm).toLocaleString()
    });
    
    // For testing - if alarm is for today but time has passed, set for next minute
    let actualTimeout = timeUntilAlarm;
    if (timeUntilAlarm <= 0) {
      console.log('⚠️ Alarm time has passed, setting for next minute for testing');
      actualTimeout = 60000; // 1 minute
    }
    
    const timeoutId = setTimeout(() => {
      console.log('🚨🚨🚨 ALARM RINGING NOW!', alarm);
      console.log('🚨 Setting ringingAlarm state to:', alarm);
      setRingingAlarm(alarm);
      playAlarmSound();
      console.log('🚨 Alarm state should now be set');
    }, actualTimeout);

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
    setActiveTimeouts,
    setRingingAlarm,
    ringingAlarm
  };

  return (
    <AlarmContext.Provider value={value}>
      {children}
      {(() => {
        console.log('🔍 Checking ringingAlarm state:', ringingAlarm);
        if (!ringingAlarm) {
          console.log('🚫 No ringing alarm, not showing popup');
          return null;
        }
        console.log('🚨 RENDERING ALARM POPUP NOW!', ringingAlarm);
        return createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 2147483647,
              background: 'rgba(239, 68, 68, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            <div 
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '8px solid #dc2626',
                position: 'relative',
                zIndex: 2147483648
              }}
            >
            <div className="text-center">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Bell className="w-12 h-12 text-white animate-pulse" />
              </div>
              
              <h2 className="text-4xl font-bold text-red-600 mb-2 animate-pulse">
                🚨 ALARM RINGING! 🚨
              </h2>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {ringingAlarm.time}
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                {ringingAlarm.message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDismiss}
                  className="w-full px-6 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 text-lg font-bold"
                >
                  ⏰ Snooze (5 min)
                </button>
                
                <button
                  onClick={handleRepeat}
                  className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-lg font-bold"
                >
                  🔁 Repeat Tomorrow
                </button>
                
                <button
                  onClick={handleStop}
                  className="w-full px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 text-lg font-bold"
                >
                  ❌ Stop Alarm
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      );
      })()}
    </AlarmContext.Provider>
  );
};