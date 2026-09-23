import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@launchswift_projects';

export type SectionStatus = 'empty' | 'in_progress' | 'complete';

export interface SectionData {
  status: SectionStatus;
  data: Record<string, unknown>;
  completedAt?: string;
}

export interface AppProject {
  id: string;
  name: string;
  bundleId: string;
  iconColor: string;
  platform: 'ios' | 'ios_ipad' | 'universal';
  createdAt: string;
  updatedAt: string;
  sections: {
    credentials: SectionData;
    appInfo: SectionData;
    metadata: SectionData;
    screenshots: SectionData;
    pricing: SectionData;
    reviewInfo: SectionData;
    privacy: SectionData;
    iap: SectionData;
    subscriptions: SectionData;
    testflight: SectionData;
    ageRating: SectionData;
    checklist: SectionData;
  };
}

const defaultSection = (): SectionData => ({ status: 'empty', data: {} });

const SAMPLE_PROJECT: AppProject = {
  id: 'sample-1',
  name: 'PhotoEdit Pro',
  bundleId: 'com.example.photoeditpro',
  iconColor: '#2F81F7',
  platform: 'ios',
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  sections: {
    credentials: { status: 'complete', data: { appleId: 'dev@example.com', teamId: 'ABC123XYZ' }, completedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    appInfo: { status: 'complete', data: { appName: 'PhotoEdit Pro', subtitle: 'Professional Photo Editor', bundleId: 'com.example.photoeditpro', sku: 'com.example.photoeditpro', primaryLanguage: 'English (U.S.)', category: 'Photo & Video' }, completedAt: new Date(Date.now() - 86400000).toISOString() },
    metadata: { status: 'in_progress', data: { description: 'Transform your photos with professional-grade editing tools...', keywords: 'photo editor, filters, retouch, camera' } },
    screenshots: defaultSection(),
    pricing: { status: 'complete', data: { priceTier: 'paid', price: '$4.99', releaseType: 'automatic', allCountries: true }, completedAt: new Date(Date.now() - 86400000).toISOString() },
    reviewInfo: defaultSection(),
    privacy: defaultSection(),
    iap: defaultSection(),
    subscriptions: defaultSection(),
    testflight: defaultSection(),
    ageRating: defaultSection(),
    checklist: defaultSection(),
  },
};

interface ProjectContextValue {
  projects: AppProject[];
  loading: boolean;
  addProject: (project: Omit<AppProject, 'id' | 'createdAt' | 'updatedAt' | 'sections'>) => Promise<AppProject>;
  updateProject: (id: string, updates: Partial<AppProject>) => Promise<void>;
  updateSection: (projectId: string, sectionKey: keyof AppProject['sections'], data: Partial<SectionData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => AppProject | undefined;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    console.log('[ProjectContext] Loading projects from AsyncStorage');
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppProject[];
        console.log(`[ProjectContext] Loaded ${parsed.length} projects`);
        setProjects(parsed);
      } else {
        console.log('[ProjectContext] No projects found, seeding sample project');
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([SAMPLE_PROJECT]));
        setProjects([SAMPLE_PROJECT]);
      }
    } catch (e) {
      console.error('[ProjectContext] Failed to load projects:', e);
      setProjects([SAMPLE_PROJECT]);
    } finally {
      setLoading(false);
    }
  };

  const saveProjects = async (updated: AppProject[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log(`[ProjectContext] Saved ${updated.length} projects`);
    } catch (e) {
      console.error('[ProjectContext] Failed to save projects:', e);
    }
  };

  const addProject = useCallback(async (project: Omit<AppProject, 'id' | 'createdAt' | 'updatedAt' | 'sections'>): Promise<AppProject> => {
    console.log('[ProjectContext] Adding new project:', project.name);
    const newProject: AppProject = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: {
        credentials: defaultSection(),
        appInfo: defaultSection(),
        metadata: defaultSection(),
        screenshots: defaultSection(),
        pricing: defaultSection(),
        reviewInfo: defaultSection(),
        privacy: defaultSection(),
        iap: defaultSection(),
        subscriptions: defaultSection(),
        testflight: defaultSection(),
        ageRating: defaultSection(),
        checklist: defaultSection(),
      },
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    await saveProjects(updated);
    return newProject;
  }, [projects]);

  const updateProject = useCallback(async (id: string, updates: Partial<AppProject>) => {
    console.log('[ProjectContext] Updating project:', id);
    const updated = projects.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    await saveProjects(updated);
  }, [projects]);

  const updateSection = useCallback(async (projectId: string, sectionKey: keyof AppProject['sections'], data: Partial<SectionData>) => {
    console.log(`[ProjectContext] Updating section "${sectionKey}" for project:`, projectId);
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      const section = { ...p.sections[sectionKey], ...data };
      return {
        ...p,
        updatedAt: new Date().toISOString(),
        sections: { ...p.sections, [sectionKey]: section },
      };
    });
    setProjects(updated);
    await saveProjects(updated);
  }, [projects]);

  const deleteProject = useCallback(async (id: string) => {
    console.log('[ProjectContext] Deleting project:', id);
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    await saveProjects(updated);
  }, [projects]);

  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  return (
    <ProjectContext.Provider value={{ projects, loading, addProject, updateProject, updateSection, deleteProject, getProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
