import { useEffect, useRef } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { updateStructure } from '../api/projects';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

let saveStatusSetter: ((status: SaveStatus) => void) | null = null;

export function registerSaveStatusSetter(setter: (status: SaveStatus) => void) {
  saveStatusSetter = setter;
}

export function useAutosave(projectId: string | undefined) {
  const { project, isDirty } = useProjectContext();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!isDirty || !projectId || !project) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    saveStatusSetter?.('saving');

    timerRef.current = setTimeout(async () => {
      try {
        await updateStructure(projectId, project.modules);
        if (isMountedRef.current) {
          saveStatusSetter?.('saved');
          // Reset to idle after 3 seconds
          setTimeout(() => saveStatusSetter?.('idle'), 3000);
        }
      } catch {
        if (isMountedRef.current) {
          saveStatusSetter?.('error');
        }
      }
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, project?.modules, projectId]);
}

export type { SaveStatus };
