import { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

export function useSecurityManager({ enabled, autoLockMinutes, biometricEnabled, onLock }) {
  const pendingResolveRef = useRef(null);
  const lastActiveRef = useRef(Date.now());
  const blurAtRef = useRef(null);
  const securityStateRef = useRef(null);
  const initializedRef = useRef(false);

  const [securityState, setSecurityState] = useState({
    enabled: !!enabled,
    isReady: false,
    isLocked: false,
    isAuthenticated: false,
    hasPassword: false,
    biometricEnabled: !!biometricEnabled,
    lastActiveTime: Date.now(),
    autoLockMinutes: autoLockMinutes ?? 2,
    pendingReason: null,
    pendingAuthMode: 'default',
    unlockMethod: null,
  });

  useEffect(() => {
    securityStateRef.current = securityState;
  }, [securityState]);

  const getBridge = useCallback(() => window.electronAPI || window.electron, []);

  const updateSecurityState = useCallback((patch) => {
    setSecurityState(prev => {
      const nextPatch = typeof patch === 'function' ? patch(prev) : patch;
      return { ...prev, ...nextPatch };
    });
  }, []);

  const resolvePendingAuth = useCallback((result) => {
    const resolve = pendingResolveRef.current;
    pendingResolveRef.current = null;
    if (resolve) resolve(result);
  }, []);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    updateSecurityState(prev => (
      prev.isLocked
        ? prev
        : { lastActiveTime: now }
    ));
  }, [updateSecurityState]);

  const lockApp = useCallback((reason = 'manual') => {
    updateSecurityState({
      isLocked: true,
      isAuthenticated: false,
      pendingReason: reason,
      pendingAuthMode: 'default',
      unlockMethod: null,
    });
    onLock?.(reason);
  }, [onLock, updateSecurityState]);

  const finishUnlock = useCallback((method = 'pin') => {
    const now = Date.now();
    lastActiveRef.current = now;
    updateSecurityState({
      isLocked: false,
      isAuthenticated: true,
      pendingReason: null,
      pendingAuthMode: 'default',
      unlockMethod: method,
      lastActiveTime: now,
    });
    resolvePendingAuth(true);
  }, [resolvePendingAuth, updateSecurityState]);

  const verifyPassword = useCallback(async (pin) => {
    const bridge = getBridge();
    if (!bridge?.security?.verifyPin) return false;
    try {
      const verified = await bridge.security.verifyPin(pin);
      return !!verified;
    } catch (error) {
      console.error('[Security] Failed to verify PIN:', error);
      return false;
    }
  }, [getBridge]);

  const unlockWithPassword = useCallback(async (pin) => {
    const valid = await verifyPassword(pin);
    if (!valid) return false;
    finishUnlock('pin');
    return true;
  }, [finishUnlock, verifyPassword]);

  const promptBiometric = useCallback(async (reason = 'Unlock TomaNotes') => {
    const bridge = getBridge();
    const invokeBiometric = bridge?.auth?.biometric || bridge?.security?.promptTouchID;
    if (!invokeBiometric) return false;
    try {
      const verified = await invokeBiometric(reason);
      return !!verified;
    } catch (error) {
      console.error('[Security] Failed to prompt Touch ID:', error);
      return false;
    }
  }, [getBridge]);

  const getBiometricPromptMessage = useCallback((reason = 'unlock') => {
    switch (reason) {
      case 'startup':
      case 'unlock':
      case 'manual':
      case 'idle':
        return 'Unlock TomaNotes';
      case 'trash':
        return 'Unlock trash in TomaNotes';
      case 'protected-note':
        return 'Unlock protected note in TomaNotes';
      case 'delete-protected-note':
        return 'Confirm deleting protected note in TomaNotes';
      case 'disable-biometric':
        return 'Confirm disabling Touch ID in TomaNotes';
      case 'disable-security':
        return 'Confirm disabling passcode in TomaNotes';
      default:
        return 'Unlock TomaNotes';
    }
  }, []);

  const unlockWithBiometric = useCallback(async (reason = 'Unlock TomaNotes') => {
    const success = await promptBiometric(reason);
    if (!success) return false;
    finishUnlock('biometric');
    return true;
  }, [finishUnlock, promptBiometric]);

  const enablePassword = useCallback(async (pin) => {
    const bridge = getBridge();
    if (!bridge?.security?.setPin) return false;
    const success = await bridge.security.setPin(pin);
    if (!success) return false;
    const now = Date.now();
    lastActiveRef.current = now;
    updateSecurityState({
      enabled: true,
      hasPassword: true,
      isReady: true,
      isLocked: false,
      isAuthenticated: true,
      pendingReason: null,
      pendingAuthMode: 'default',
      unlockMethod: 'pin',
      lastActiveTime: now,
    });
    return true;
  }, [getBridge, updateSecurityState]);

  const disablePassword = useCallback(async () => {
    const bridge = getBridge();
    if (bridge?.security?.clearPin) {
      await bridge.security.clearPin();
    }
    resolvePendingAuth(false);
    updateSecurityState({
      enabled: false,
      hasPassword: false,
      biometricEnabled: false,
      isLocked: false,
      isAuthenticated: false,
      pendingReason: null,
      pendingAuthMode: 'default',
      unlockMethod: null,
    });
    return true;
  }, [getBridge, resolvePendingAuth, updateSecurityState]);

  const enableBiometric = useCallback(async () => {
    const current = securityStateRef.current;
    if (!current?.hasPassword) return false;
    const verified = await promptBiometric('Enable biometric unlock for TomaNotes');
    if (!verified) return false;
    updateSecurityState({ biometricEnabled: true });
    return true;
  }, [promptBiometric, updateSecurityState]);

  const disableBiometric = useCallback(() => {
    updateSecurityState({ biometricEnabled: false });
    return true;
  }, [updateSecurityState]);

  const requireAuth = useCallback(async ({ reason = 'auth', force = false, mode = 'default' } = {}) => {
    const current = securityStateRef.current;

    // Security disabled -> always pass.
    if (!current?.enabled || !current.hasPassword) return true;

    // Already unlocked -> pass.
    if (!force && current.isAuthenticated && !current.isLocked) {
      recordActivity();
      return true;
    }

    // Biometric-only verification path.
    if (mode === 'biometric') {
      if (!current.biometricEnabled) return false;
      const bioOnlySuccess = await promptBiometric(getBiometricPromptMessage(reason));
      if (bioOnlySuccess) {
        finishUnlock('biometric');
        return true;
      }
      return false;
    }

    // Fall back to password lock screen.
    updateSecurityState({
      isLocked: true,
      isAuthenticated: false,
      pendingReason: reason,
      pendingAuthMode: mode,
      unlockMethod: null,
    });

    return new Promise(resolve => {
      pendingResolveRef.current = resolve;
    });
  }, [finishUnlock, getBiometricPromptMessage, promptBiometric, recordActivity, updateSecurityState]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const bridge = getBridge();
      const hasPassword = enabled && bridge?.security?.hasPin
        ? await bridge.security.hasPin()
        : false;

      if (cancelled) return;

      const now = Date.now();
      lastActiveRef.current = now;

      if (!initializedRef.current) {
        initializedRef.current = true;
        updateSecurityState({
          enabled: !!enabled,
          isReady: true,
          hasPassword: !!hasPassword,
          biometricEnabled: !!biometricEnabled && !!hasPassword,
          autoLockMinutes: autoLockMinutes ?? 2,
          lastActiveTime: now,
          isLocked: !!enabled && !!hasPassword,
          isAuthenticated: false,
          pendingReason: !!enabled && !!hasPassword ? 'startup' : null,
          pendingAuthMode: 'default',
        });
        return;
      }

      updateSecurityState({
        enabled: !!enabled,
        hasPassword: !!hasPassword,
        biometricEnabled: !!enabled && !!hasPassword && !!biometricEnabled,
        autoLockMinutes: autoLockMinutes ?? 2,
      });
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [autoLockMinutes, biometricEnabled, enabled, getBridge, updateSecurityState]);

  useEffect(() => {
    if (!securityState.enabled || securityState.isLocked || !securityState.isAuthenticated) return undefined;

    const handleActivity = () => recordActivity();
    ACTIVITY_EVENTS.forEach(eventName => window.addEventListener(eventName, handleActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach(eventName => window.removeEventListener(eventName, handleActivity));
    };
  }, [recordActivity, securityState.enabled, securityState.isAuthenticated, securityState.isLocked]);

  useEffect(() => {
    const bridge = getBridge();
    if (!bridge?.system) return undefined;

    const handleBlur = () => {
      blurAtRef.current = Date.now();
    };

    const handleFocus = () => {
      const current = securityStateRef.current;
      if (!current?.enabled || current.isLocked || current.autoLockMinutes === -1 || !blurAtRef.current) {
        blurAtRef.current = null;
        return;
      }

      const elapsed = Date.now() - blurAtRef.current;
      blurAtRef.current = null;
      if (elapsed >= current.autoLockMinutes * 60 * 1000) {
        lockApp('idle');
      }
    };

    const offBlur = bridge.system.onBlur(handleBlur);
    const offFocus = bridge.system.onFocus(handleFocus);
    return () => {
      if (typeof offBlur === 'function') offBlur();
      if (typeof offFocus === 'function') offFocus();
    };
  }, [getBridge, lockApp]);

  useEffect(() => {
    if (!securityState.enabled || securityState.autoLockMinutes === -1 || securityState.isLocked || !securityState.isAuthenticated) return undefined;

    const timer = window.setInterval(() => {
      const current = securityStateRef.current;
      if (!current?.enabled || current.isLocked || current.autoLockMinutes === -1) return;
      if (Date.now() - lastActiveRef.current >= current.autoLockMinutes * 60 * 1000) {
        lockApp('idle');
      }
    }, 15000);

    return () => window.clearInterval(timer);
  }, [lockApp, securityState.autoLockMinutes, securityState.enabled, securityState.isAuthenticated, securityState.isLocked]);

  const cancelAuth = useCallback(() => {
    updateSecurityState({
      isLocked: false,
      isAuthenticated: true,
      pendingReason: null,
      pendingAuthMode: 'default',
      unlockMethod: null,
    });
    resolvePendingAuth(false);
  }, [resolvePendingAuth, updateSecurityState]);

  return {
    securityState,
    requireAuth,
    lockApp,
    cancelAuth,
    recordActivity,
    unlockWithPassword,
    enablePassword,
    disablePassword,
    enableBiometric,
    disableBiometric,
    unlockWithBiometric,
    getBiometricPromptMessage,
  };
}
