
export const safeLocalStorage = {
  
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        console.log(`✅ Stored ${key}:`, stringValue);
        return true;
      }
    } catch (error) {
      console.error(`❌ Error storing ${key}:`, error);
      return false;
    }
    return false;
  },

  
  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        
        
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
    } catch (error) {
      console.error(`❌ Error getting ${key}:`, error);
    }
    return defaultValue;
  },


  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        console.log(`✅ Removed ${key}`);
        return true;
      }
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
      return false;
    }
    return false;
  },


  clear: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
        console.log('✅ Cleared all localStorage');
        return true;
      }
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
      return false;
    }
    return false;
  },

 
  isAvailable: () => {
    try {
      return typeof window !== 'undefined' && 
             window.localStorage && 
             typeof window.localStorage.setItem === 'function';
    } catch {
      return false;
    }
  }
};


export const authStorage = {
  setAuthData: (token, userData) => {
    const tokenSet = safeLocalStorage.setItem('token', token);
    const userDataSet = safeLocalStorage.setItem('userData', userData);
    return tokenSet && userDataSet;
  },

  getAuthData: () => {
    const token = safeLocalStorage.getItem('token');
    const userData = safeLocalStorage.getItem('userData');
    
    return {
      token,
      userData,
      isAuthenticated: !!(token && userData)
    };
  },

  clearAuthData: () => {
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('userData');
  },

 
  debugAuthState: () => {
    console.log('🔍 Auth Debug Info:');
    console.log('localStorage available:', safeLocalStorage.isAvailable());
    console.log('Raw token:', localStorage.getItem('token'));
    console.log('Raw userData:', localStorage.getItem('userData'));
    
    const authData = authStorage.getAuthData();
    console.log('Parsed auth data:', authData);
  }
};