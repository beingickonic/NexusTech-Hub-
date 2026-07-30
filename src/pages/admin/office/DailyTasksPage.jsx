import React, { useState, useEffect } from 'react';
import OfficeDataTable from '../../../components/admin/office/OfficeDataTable';
import { officeService } from '../../../services/officeService';
import toast from 'react-hot-toast';

const DailyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data } = await officeService.getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks. Verify database schema.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAdd = () => {
    toast('Add functionality will open a modal.', { icon: '🚧' });
  };

  const handleEdit = (task) => {
    toast(`Edit task: ${task.title}`, { icon: '✏️' });
  };

  const handleDelete = async (id) => {
    try {
      await officeService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success("Task deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task");
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (row) => (
      <div>
        <div className="font-semibold">{row.title}</div>
        <div className="text-xs text-nexus-textSecondary">{row.description?.substring(0, 50)}...</div>
      </div>
    )},
    { header: 'Priority', accessor: 'priority', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
        row.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
        'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
      }`}>
        {row.priority}
      </span>
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">
        {row.status}
      </span>
    )},
    { header: 'Assigned To', accessor: 'assigned_to', render: (row) => row.assigned_to?.full_name || 'Unassigned' }
  ];

  return (
    <OfficeDataTable
      title="Daily Tasks"
      description="Manage office tasks, assignments, and priorities."
      columns={columns}
      data={tasks}
      isLoading={isLoading}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      searchPlaceholder="Search tasks..."
    />
  );
};

export default DailyTasksPage;
