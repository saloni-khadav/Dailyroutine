// Global alarm manager that persists across page navigation
class GlobalAlarmManager {
  constructor() {
    this.alarms = [];
    this.activeTimeouts = {};
    this.ringingAlarm = null;
    this.modalElement = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('🚀 Global Alarm Manager initialized');
  }

  setAlarms(alarms) {
    console.log('📋 Setting alarms globally:', alarms.length);
    this.alarms = alarms;
    this.setupTimeouts();
  }

  setupTimeouts() {
    // Clear existing timeouts
    Object.values(this.activeTimeouts).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.activeTimeouts = {};

    // Setup new timeouts
    this.alarms.forEach(alarm => {
      if (alarm.active) {
        this.setupAlarmTimeout(alarm);
      }
    });
  }

  setupAlarmTimeout(alarm) {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':');
    const alarmDate = new Date();
    alarmDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const timeUntilAlarm = alarmDate.getTime() - now.getTime();
    
    // For testing - if past time, trigger in 3 seconds
    let actualTimeout = timeUntilAlarm;
    if (timeUntilAlarm <= 0) {
      console.log('⚠️ Past alarm, setting for 3 seconds');
      actualTimeout = 3000;
    }

    console.log('⏰ Setting timeout for:', alarm.time, 'in', actualTimeout, 'ms');

    const timeoutId = setTimeout(() => {
      console.log('🚨🚨🚨 GLOBAL ALARM RINGING!', alarm);
      this.triggerAlarm(alarm);
    }, actualTimeout);

    this.activeTimeouts[alarm._id] = timeoutId;
  }

  triggerAlarm(alarm) {
    console.log('🔔 Triggering global alarm popup');
    this.ringingAlarm = alarm;
    this.playAlarmSound();
    this.showAlarmModal();
  }

  playAlarmSound() {
    try {
      console.log('🔊 Playing alarm sound');
      // Create multiple beep sounds
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
        }, i * 1000);
      }
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }

  showAlarmModal() {
    // Remove existing modal if any
    this.hideAlarmModal();

    // Create modal element
    this.modalElement = document.createElement('div');
    this.modalElement.id = 'global-alarm-modal';
    this.modalElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      background: rgba(239, 68, 68, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 24px;
      padding: 32px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 8px solid #dc2626;
      position: relative;
      text-align: center;
      animation: pulse 2s infinite;
    `;

    modalContent.innerHTML = `
      <div style="width: 96px; height: 96px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; animation: bounce 1s infinite;">
        <svg width="48" height="48" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4V7.17C16.83 7.69 19 10.08 19 13V16L21 18V19H3V18L5 16V13C5 10.08 7.17 7.69 10 7.17V4C10 2.9 10.9 2 12 2M12 22C13.11 22 14 21.11 14 20H10C10 21.11 10.89 22 12 22Z"/>
        </svg>
      </div>
      
      <h2 style="font-size: 32px; font-weight: bold; color: #dc2626; margin-bottom: 8px;">
        🚨 ALARM RINGING! 🚨
      </h2>
      <h3 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 8px;">
        ${this.ringingAlarm.time}
      </h3>
      <p style="font-size: 18px; color: #6b7280; margin-bottom: 32px;">
        ${this.ringingAlarm.message}
      </p>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="snooze-btn" style="width: 100%; padding: 16px 24px; background: #eab308; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
          ⏰ Snooze (5 min)
        </button>
        
        <button id="repeat-btn" style="width: 100%; padding: 16px 24px; background: #3b82f6; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
          🔁 Repeat Tomorrow
        </button>
        
        <button id="stop-btn" style="width: 100%; padding: 16px 24px; background: #ef4444; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
          ❌ Stop Alarm
        </button>
      </div>
    `;

    // Add event listeners
    modalContent.querySelector('#snooze-btn').onclick = () => this.snoozeAlarm();
    modalContent.querySelector('#repeat-btn').onclick = () => this.repeatAlarm();
    modalContent.querySelector('#stop-btn').onclick = () => this.stopAlarm();

    this.modalElement.appendChild(modalContent);
    document.body.appendChild(this.modalElement);

    console.log('✅ Global alarm modal displayed');
  }

  hideAlarmModal() {
    if (this.modalElement) {
      document.body.removeChild(this.modalElement);
      this.modalElement = null;
    }
  }

  snoozeAlarm() {
    console.log('😴 Snoozing alarm');
    this.hideAlarmModal();
    
    // Set snooze for 5 minutes
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
    const hours = snoozeTime.getHours().toString().padStart(2, '0');
    const minutes = snoozeTime.getMinutes().toString().padStart(2, '0');
    
    const snoozeAlarm = { ...this.ringingAlarm, time: `${hours}:${minutes}` };
    this.setupAlarmTimeout(snoozeAlarm);
    
    this.ringingAlarm = null;
  }

  repeatAlarm() {
    console.log('🔁 Repeating alarm for tomorrow');
    this.hideAlarmModal();
    this.setupAlarmTimeout(this.ringingAlarm);
    this.ringingAlarm = null;
  }

  stopAlarm() {
    console.log('🛑 Stopping alarm');
    this.hideAlarmModal();
    
    if (this.ringingAlarm && this.activeTimeouts[this.ringingAlarm._id]) {
      clearTimeout(this.activeTimeouts[this.ringingAlarm._id]);
      delete this.activeTimeouts[this.ringingAlarm._id];
    }
    
    this.ringingAlarm = null;
  }
}

// Create global instance
window.globalAlarmManager = window.globalAlarmManager || new GlobalAlarmManager();

export default window.globalAlarmManager;