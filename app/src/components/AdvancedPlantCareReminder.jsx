import { useState, useEffect, useMemo, useCallback } from "react";
import { useCareReminder } from "../context/CareReminderContext";
import { useNavigate } from "react-router-dom";
import LazyImage from "./LazyImage";

export default function AdvancedPlantCareReminder() {
  const { 
    reminders, 
    addReminder, 
    updateReminder, 
    deleteReminder, 
    markCompleted
  } = useCareReminder();
  
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    plantName: '',
    plantImage: '',
    careType: 'watering',
    frequency: 7,
    frequencyUnit: 'days',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    priority: 'medium',
    reminderTime: '09:00',
    enabled: true
  });

  // Care types with icons and descriptions
  const careTypes = [
    { key: 'watering', label: 'Watering', icon: '💧', description: 'Water the plant' },
    { key: 'fertilizing', label: 'Fertilizing', icon: '🌿', description: 'Apply fertilizer' },
    { key: 'pruning', label: 'Pruning', icon: '✂️', description: 'Trim and prune' },
    { key: 'repotting', label: 'Repotting', icon: '🏺', description: 'Move to larger pot' },
    { key: 'cleaning', label: 'Cleaning', icon: '🧹', description: 'Clean leaves' },
    { key: 'pest_check', label: 'Pest Check', icon: '🐛', description: 'Check for pests' }
  ];

  // Priority levels
  const priorities = [
    { key: 'low', label: 'Low', color: 'success', icon: '🟢' },
    { key: 'medium', label: 'Medium', color: 'warning', icon: '🟡' },
    { key: 'high', label: 'High', color: 'danger', icon: '🔴' }
  ];

  // Helper functions
  const isOverdue = (reminder) => {
    return !reminder.completed && new Date(reminder.nextDueDate) < new Date();
  };

  const isDueToday = (reminder) => {
    if (reminder.completed) return false;
    const today = new Date().toDateString();
    const dueDate = new Date(reminder.nextDueDate).toDateString();
    return today === dueDate;
  };

  const isUpcoming = (reminder) => {
    if (reminder.completed) return false;
    const today = new Date();
    const dueDate = new Date(reminder.nextDueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  // Statistics
  const stats = useMemo(() => {
    const total = reminders.length;
    const completed = reminders.filter(r => r.completed).length;
    const overdue = reminders.filter(r => isOverdue(r)).length;
    const dueToday = reminders.filter(r => isDueToday(r)).length;
    const upcoming = reminders.filter(r => isUpcoming(r)).length;
    
    return { total, completed, overdue, dueToday, upcoming };
  }, [reminders]);

  // Filtered and sorted reminders
  const filteredReminders = useMemo(() => {
    let filtered = reminders.filter(reminder => {
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'overdue' && isOverdue(reminder)) ||
        (filterStatus === 'due_today' && isDueToday(reminder)) ||
        (filterStatus === 'upcoming' && isUpcoming(reminder)) ||
        (filterStatus === 'completed' && reminder.completed);
      
      const matchesSearch = searchTerm === '' || 
        reminder.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.careType.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });

    // Sort reminders
    switch (sortBy) {
      case 'dueDate':
        filtered.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
        break;
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'plantName':
        filtered.sort((a, b) => a.plantName.localeCompare(b.plantName));
        break;
      case 'careType':
        filtered.sort((a, b) => a.careType.localeCompare(b.careType));
        break;
    }

    return filtered;
  }, [reminders, filterStatus, sortBy, searchTerm]);

  const getStatusBadge = (reminder) => {
    if (reminder.completed) {
      return <span className="badge bg-success">Completed</span>;
    } else if (isOverdue(reminder)) {
      return <span className="badge bg-danger">Overdue</span>;
    } else if (isDueToday(reminder)) {
      return <span className="badge bg-warning">Due Today</span>;
    } else if (isUpcoming(reminder)) {
      return <span className="badge bg-info">Upcoming</span>;
    } else {
      return <span className="badge bg-secondary">Scheduled</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = priorities.find(p => p.key === priority);
    return (
      <span className={`badge bg-${priorityConfig.color}`}>
        {priorityConfig.icon} {priorityConfig.label}
      </span>
    );
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reminderData = {
      ...formData,
      id: editingReminder ? editingReminder.id : Date.now(),
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString(),
      nextDueDate: formData.startDate,
      completed: false,
      lastCompleted: null,
      completedDates: []
    };

    if (editingReminder) {
      updateReminder(reminderData);
    } else {
      addReminder(reminderData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      plantName: '',
      plantImage: '',
      careType: 'watering',
      frequency: 7,
      frequencyUnit: 'days',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
      priority: 'medium',
      reminderTime: '09:00',
      enabled: true
    });
    setEditingReminder(null);
    setShowAddForm(false);
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      plantName: reminder.plantName,
      plantImage: reminder.plantImage,
      careType: reminder.careType,
      frequency: reminder.frequency,
      frequencyUnit: reminder.frequencyUnit,
      startDate: reminder.startDate,
      notes: reminder.notes,
      priority: reminder.priority,
      reminderTime: reminder.reminderTime,
      enabled: reminder.enabled
    });
    setShowAddForm(true);
  };

  const handleDelete = (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder(reminderId);
    }
  };

  const handleMarkCompleted = (reminder) => {
    const completedReminder = {
      ...reminder,
      completed: true,
      lastCompleted: new Date().toISOString(),
      completedDates: [...(reminder.completedDates || []), new Date().toISOString()]
    };
    
    markCompleted(completedReminder);
  };

  return (
    <div className="advanced-plant-care-reminder">
      {/* Header */}
      <div className="reminder-header mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h3 className="mb-0">
              <i className="fas fa-leaf text-success me-2"></i>
              Plant Care Reminders
            </h3>
            <p className="text-muted mb-0">Keep your plants healthy and thriving</p>
          </div>
          <div className="col-md-6 text-end">
            <button
              className="btn btn-success"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards mb-4">
        <div className="row">
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-primary">{stats.total}</h4>
                <small className="text-muted">Total Reminders</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-success">{stats.completed}</h4>
                <small className="text-muted">Completed</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-danger">{stats.overdue}</h4>
                <small className="text-muted">Overdue</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-warning">{stats.dueToday}</h4>
                <small className="text-muted">Due Today</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-info">{stats.upcoming}</h4>
                <small className="text-muted">Upcoming</small>
              </div>
            </div>
          </div>
          <div className="col-md-2 col-sm-6 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h4 className="text-secondary">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </h4>
                <small className="text-muted">Completion Rate</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reminder-tabs mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-eye me-2"></i>
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'overdue' ? 'active' : ''}`}
              onClick={() => setActiveTab('overdue')}
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              Overdue ({stats.overdue})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'due_today' ? 'active' : ''}`}
              onClick={() => setActiveTab('due_today')}
            >
              <i className="fas fa-calendar-day me-2"></i>
              Due Today ({stats.dueToday})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <i className="fas fa-calendar-week me-2"></i>
              Upcoming ({stats.upcoming})
            </button>
          </li>
        </ul>
      </div>

      {/* Filters and Search */}
      <div className="filters-section mb-4">
        <div className="row align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="overdue">Overdue</option>
              <option value="due_today">Due Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="plantName">Sort by Plant Name</option>
              <option value="careType">Sort by Care Type</option>
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setFilterStatus('all');
                setSortBy('dueDate');
                setSearchTerm('');
              }}
            >
              <i className="fas fa-undo me-2"></i>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="add-form-section mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-plus me-2"></i>
                {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Plant Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="plantName"
                      value={formData.plantName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Plant Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="plantImage"
                      value={formData.plantImage}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Care Type *</label>
                    <select
                      className="form-select"
                      name="careType"
                      value={formData.careType}
                      onChange={handleInputChange}
                      required
                    >
                      {careTypes.map(type => (
                        <option key={type.key} value={type.key}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Frequency *</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                      <select
                        className="form-select"
                        name="frequencyUnit"
                        value={formData.frequencyUnit}
                        onChange={handleInputChange}
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      {priorities.map(priority => (
                        <option key={priority.key} value={priority.key}>
                          {priority.icon} {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Reminder Time</label>
                    <input
                      type="time"
                      className="form-control"
                      name="reminderTime"
                      value={formData.reminderTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes about this care task..."
                  />
                </div>
                
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleInputChange}
                    id="enabledCheck"
                  />
                  <label className="form-check-label" htmlFor="enabledCheck">
                    Enable this reminder
                  </label>
                </div>
                
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    <i className="fas fa-save me-2"></i>
                    {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="reminders-list">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-leaf fa-3x text-muted mb-3"></i>
            <h4>No reminders found</h4>
            <p className="text-muted">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Create your first plant care reminder to get started!'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                className="btn btn-success"
                onClick={() => setShowAddForm(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add First Reminder
              </button>
            )}
          </div>
        ) : (
          <div className="row">
            {filteredReminders.map(reminder => (
              <div key={reminder.id} className="col-lg-6 mb-4">
                <div className={`card reminder-card ${isOverdue(reminder) ? 'border-danger' : ''}`}>
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {reminder.plantImage ? (
                          <LazyImage
                            src={reminder.plantImage}
                            alt={reminder.plantName}
                            className="plant-thumbnail me-3"
                          />
                        ) : (
                          <div className="plant-placeholder me-3">
                            <i className="fas fa-leaf"></i>
                          </div>
                        )}
                        <div>
                          <h6 className="mb-1">{reminder.plantName}</h6>
                          <div className="d-flex gap-2">
                            {getStatusBadge(reminder)}
                            {getPriorityBadge(reminder.priority)}
                          </div>
                        </div>
                      </div>
                      <div className="dropdown">
                        <button
                          className="btn btn-outline-secondary btn-sm dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleEdit(reminder)}
                            >
                              <i className="fas fa-edit me-2"></i>
                              Edit
                            </button>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(reminder.id)}
                            >
                              <i className="fas fa-trash me-2"></i>
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="care-type-info mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <span className="care-icon me-2">
                          {careTypes.find(t => t.key === reminder.careType)?.icon}
                        </span>
                        <strong>
                          {careTypes.find(t => t.key === reminder.careType)?.label}
                        </strong>
                      </div>
                      <p className="text-muted mb-0">
                        {careTypes.find(t => t.key === reminder.careType)?.description}
                      </p>
                    </div>
                    
                    <div className="reminder-details">
                      <div className="row">
                        <div className="col-6">
                          <small className="text-muted">Frequency</small>
                          <p className="mb-1">
                            Every {reminder.frequency} {reminder.frequencyUnit}
                          </p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Next Due</small>
                          <p className="mb-1">
                            {new Date(reminder.nextDueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {reminder.notes && (
                        <div className="mt-3">
                          <small className="text-muted">Notes</small>
                          <p className="mb-0">{reminder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => handleMarkCompleted(reminder)}
                        disabled={reminder.completed}
                      >
                        <i className="fas fa-check me-2"></i>
                        Mark Complete
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate(`/product/${reminder.plantId || 'new'}`)}
                      >
                        <i className="fas fa-eye me-2"></i>
                        View Plant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .advanced-plant-care-reminder {
          padding: 20px 0;
        }
        
        .reminder-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .stats-cards .card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .stats-cards .card:hover {
          transform: translateY(-2px);
        }
        
        .reminder-tabs .nav-tabs {
          border-bottom: 2px solid #dee2e6;
        }
        
        .reminder-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
        }
        
        .reminder-tabs .nav-link.active {
          color: #007bff;
          border-bottom: 2px solid #007bff;
          background: none;
        }
        
        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .add-form-section .card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .reminder-card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .reminder-card:hover {
          transform: translateY(-2px);
        }
        
        .reminder-card.border-danger {
          border: 2px solid #dc3545 !important;
        }
        
        .plant-thumbnail {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .plant-placeholder {
          width: 50px;
          height: 50px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
        
        .care-icon {
          font-size: 20px;
        }
        
        .reminder-details {
          font-size: 14px;
        }
        
        .reminder-details p {
          margin-bottom: 0;
          font-weight: 500;
        }
        
        .badge {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
