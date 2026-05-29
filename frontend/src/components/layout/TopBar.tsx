import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Layers, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logout as logoutApi } from '../../api/auth';
import toast from 'react-hot-toast';
import type { SaveStatus } from '../../hooks/useAutosave';
import { registerSaveStatusSetter } from '../../hooks/useAutosave';
import './TopBar.css';

export default function TopBar() {
  const { setAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loggingOut, setLoggingOut] = useState(false);

  // Register setter so autosave hook can update the indicator
  React.useEffect(() => {
    registerSaveStatusSetter(setSaveStatus);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
      setAuthenticated(false);
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        <Link to="/" className="topbar-logo" aria-label="TaskSplitter home">
          <div className="topbar-logo-icon">
            <Layers size={20} />
          </div>
          <span className="topbar-logo-text">TaskSplitter</span>
        </Link>

        <div className="topbar-right">
          {saveStatus !== 'idle' && (
            <div className={`save-indicator save-${saveStatus}`} aria-live="polite">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 size={13} className="save-spin" />
                  <span>Saving…</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle size={13} />
                  <span>Saved ✓</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle size={13} />
                  <span>Save failed</span>
                </>
              )}
            </div>
          )}

          <button
            className="topbar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            id="logout-button"
          >
            {loggingOut ? (
              <span className="spinner" style={{ width: 15, height: 15 }} />
            ) : (
              <LogOut size={16} />
            )}
            <span className="topbar-logout-label">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
