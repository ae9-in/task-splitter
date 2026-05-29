
import { Layers, Wand2 } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import './EmptyState.css';

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="empty-state fade-in">
      <div className="empty-icon">
        <Layers size={40} />
      </div>
      <h2 className="empty-title">No projects yet</h2>
      <p className="empty-desc">
        Create your first project to start decomposing requirements into actionable engineering tasks.
      </p>
      <Button
        variant="primary"
        size="lg"
        icon={<Wand2 size={18} />}
        onClick={() => navigate('/projects/new')}
        id="empty-state-create-btn"
      >
        Create your first project
      </Button>
    </div>
  );
}
