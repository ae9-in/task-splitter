import { Request, Response } from 'express';
import Project from '../models/Project';
import { decomposeRequirement } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';

function buildCSV(rows: Record<string, string>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? '')).join(',')),
  ];
  return lines.join('\r\n');
}

// ─── List Projects ─────────────────────────────────────────────────────────────
export const listProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find(
      {},
      { title: 1, description: 1, status: 1, createdAt: 1, updatedAt: 1, modules: 1 }
    ).sort({ updatedAt: -1 });

    const summaries = projects.map((p) => {
      const taskCount = p.modules.reduce(
        (sum, mod) =>
          sum + mod.features.reduce((fSum, feat) => fSum + feat.tasks.length, 0),
        0
      );
      return {
        _id: p._id,
        title: p.title,
        description: p.description,
        status: p.status,
        moduleCount: p.modules.length,
        taskCount,
        requirementPreview: '',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    res.json({ success: true, data: summaries });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

// ─── Create Project ────────────────────────────────────────────────────────────
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, requirementText } = req.body;

    if (!title || title.trim().length < 3) {
      res.status(400).json({ success: false, message: 'Title must be at least 3 characters' });
      return;
    }
    if (!requirementText || requirementText.trim().length < 50) {
      res.status(400).json({
        success: false,
        message: 'Requirement text must be at least 50 characters',
      });
      return;
    }

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || '',
      requirementText: requirementText.trim(),
      status: 'draft',
      modules: [],
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};

// ─── Get Project ───────────────────────────────────────────────────────────────
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
};

// ─── Update Project ────────────────────────────────────────────────────────────
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status } = req.body;
    const allowedStatuses = ['draft', 'in-progress', 'complete'];

    const updates: Record<string, string> = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status && allowedStatuses.includes(status)) updates.status = status;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

// ─── Delete Project ────────────────────────────────────────────────────────────
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};

// ─── Split (AI Decomposition) ──────────────────────────────────────────────────
export const splitProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const modules = await decomposeRequirement(project.requirementText);
    project.modules = modules as typeof project.modules;
    project.status = 'in-progress';
    await project.save();

    res.json({ success: true, data: project });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI decomposition failed';
    res.status(500).json({ success: false, message });
  }
};

// ─── Update Full Structure (Autosave) ─────────────────────────────────────────
export const updateStructure = async (req: Request, res: Response): Promise<void> => {
  try {
    const { modules } = req.body;
    if (!Array.isArray(modules)) {
      res.status(400).json({ success: false, message: 'modules must be an array' });
      return;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { modules } },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: { updatedAt: project.updatedAt } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save structure' });
  }
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const format = (req.query.format as string)?.toLowerCase() || 'json';
    const safeName = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.json"`);
      res.json({
        title: project.title,
        description: project.description,
        status: project.status,
        exportedAt: new Date().toISOString(),
        modules: project.modules,
      });
      return;
    }

    if (format === 'markdown') {
      let md = `# ${project.title}\n\n`;
      if (project.description) md += `> ${project.description}\n\n`;
      md += `**Status:** ${project.status}  \n`;
      md += `**Exported:** ${new Date().toLocaleDateString()}\n\n---\n\n`;

      for (const mod of project.modules) {
        md += `## ${mod.name}\n\n`;
        if (mod.description) md += `${mod.description}\n\n`;

        for (const feat of mod.features) {
          md += `### ${feat.name}\n\n`;
          if (feat.description) md += `${feat.description}\n\n`;

          for (const task of feat.tasks) {
            md += `- [ ] **${task.title}** \`[${task.type}]\` \`[${task.priority}]\`\n`;
            if (task.description) md += `  > ${task.description}\n`;
          }
          md += '\n';
        }
      }

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.md"`);
      res.send(md);
      return;
    }

    if (format === 'csv') {
      const rows: object[] = [];
      for (const mod of project.modules) {
        for (const feat of mod.features) {
          for (const task of feat.tasks) {
            rows.push({
              Module: mod.name,
              Feature: feat.name,
              Task: task.title,
              Description: task.description,
              Priority: task.priority,
              Type: task.type,
            });
          }
        }
      }

      const csv = buildCSV(rows as Record<string, string>[]);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
      res.send(csv);
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid format. Use json, markdown, or csv' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export project' });
  }
};

// ─── Add Module ────────────────────────────────────────────────────────────────
export const addModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const { name, description } = req.body;
    const newModule = {
      id: uuidv4(),
      name: name || 'New Module',
      description: description || '',
      order: project.modules.length,
      features: [],
    };

    project.modules.push(newModule as typeof project.modules[0]);
    await project.save();

    res.status(201).json({ success: true, data: newModule });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add module' });
  }
};
