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
      console.log('🔄 Setting up alarms:', alarms.length);
      alarms.forEach(alarm => {
        if (alarm.active && !activeTimeouts[alarm._id]) {
          console.log('✅ Setting timeout for:', alarm.time);
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

    let timeUntilAlarm = alarmDate.getTime() - now.getTime();
    
    // For testing - if past time, trigger in 5 seconds
    if (timeUntilAlarm <= 0) {
      console.log('⚠️ Past alarm time, setting for 5 seconds');
      timeUntilAlarm = 5000;
    }
    
    console.log('⏰ Alarm will ring in:', Math.round(timeUntilAlarm / 1000), 'seconds');
    
    const timeoutId = setTimeout(() => {
      console.log('🚨🚨🚨 ALARM RINGING NOW!', alarm);
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

    console.log('🔔 Rendering alarm modal for:', ringingAlarm);

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
          zIndex: 999999999,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9))',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}
      >
        <div 
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '3px solid rgba(59, 130, 246, 0.3)',
            position: 'relative',
            zIndex: 999999999,
            textAlign: 'center'
          }}
        >
          <div style={{ width: '96px', height: '96px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'bounce 1s infinite', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)' }}>
            <Bell style={{ width: '48px', height: '48px', color: 'white' }} />
          </div>
          
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', animation: 'pulse 2s infinite' }}>
            ⏰ ALARM TIME! ⏰
          </h2>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            {ringingAlarm.time}
          </h3>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', fontWeight: '500' }}>
            {ringingAlarm.message}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleDismiss}
              style={{ width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s' }}
            >
              😴 Snooze (5 min)
            </button>
            
            <button
              onClick={handleRepeat}
              style={{ width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}
            >
              🔄 Repeat Tomorrow
            </button>
            
            <button
              onClick={handleStop}
              style={{ width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s' }}
            >
              🛑 Stop Alarm
            </button>
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