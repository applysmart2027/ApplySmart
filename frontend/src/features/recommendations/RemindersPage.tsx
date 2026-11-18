import { useState } from 'react';
import { Link } from 'react-router';
import { sampleReminders } from './sampleData';
import './recommendations.css';

export function RemindersPage() {
  const [reminders, setReminders] = useState(sampleReminders);
  const [title, setTitle] = useState('');
  const [relatedJob, setRelatedJob] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddReminder = () => {
    if (!title.trim() || !relatedJob.trim() || !dueDate) {
      return;
    }

    setReminders([
      ...reminders,
      {
        id: `rem-${Date.now()}`,
        title: title.trim(),
        relatedJob: relatedJob.trim(),
        dueDate,
        completed: false,
      },
    ]);

    setTitle('');
    setRelatedJob('');
    setDueDate('');
  };

  const handleToggleReminder = (id: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id
          ? { ...reminder, completed: !reminder.completed }
          : reminder,
      ),
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(
      reminders.filter((reminder) => reminder.id !== id),
    );
  };

  const upcomingReminders = reminders.filter(
    (reminder) => !reminder.completed,
  );

  const completedReminders = reminders.filter(
    (reminder) => reminder.completed,
  );

  return (
    <section className="recommendations-page">
      <div className="recommendations-top-nav">
        <Link
          className="recommendations-tab"
          to="/recommendations"
        >
          Recommended Jobs
        </Link>

        <Link
          className="recommendations-tab"
          to="/recommendations/summary"
        >
          Progress Summary
        </Link>

        <Link
          className="recommendations-tab active"
          to="/recommendations/reminders"
        >
          Reminders & Follow-ups
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>Reminders and Follow-ups</h1>

          <p className="page-intro">
            Keep track of upcoming job-search tasks and follow-ups.
          </p>
        </div>
      </div>

      <section className="panel reminders-form">
        <h2>Add Reminder</h2>

        <div className="reminders-form-grid">
          <label className="field">
            Reminder

            <input
              type="text"
              placeholder="Example: Send follow-up email"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="field">
            Related Job

            <input
              type="text"
              placeholder="Example: Ubisoft - Developer Co-op"
              value={relatedJob}
              onChange={(event) => setRelatedJob(event.target.value)}
            />
          </label>

          <label className="field">
            Due Date

            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>

        <div className="reminders-form-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={handleAddReminder}
          >
            Add Reminder
          </button>
        </div>
      </section>

      <section className="panel reminders-section">
        <h2>Upcoming</h2>

        {upcomingReminders.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming reminders.</p>
          </div>
        ) : (
          <div className="reminders-list">
            {upcomingReminders.map((reminder) => (
              <div
                className="reminder-row"
                key={reminder.id}
              >
                <div className="reminder-content">
                  <strong>{reminder.title}</strong>
                  <p>{reminder.relatedJob}</p>
                </div>

                <span className="reminder-date">
                  {reminder.dueDate}
                </span>

                <div className="reminder-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      handleToggleReminder(reminder.id)
                    }
                  >
                    Mark Complete
                  </button>

                  <button
                    className="button button-danger"
                    type="button"
                    onClick={() =>
                      handleDeleteReminder(reminder.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel reminders-section">
        <h2>Completed</h2>

        {completedReminders.length === 0 ? (
          <div className="empty-state">
            <p>No completed reminders.</p>
          </div>
        ) : (
          <div className="reminders-list">
            {completedReminders.map((reminder) => (
              <div
                className="reminder-row"
                key={reminder.id}
              >
                <div className="reminder-content">
                  <strong>{reminder.title}</strong>
                  <p>{reminder.relatedJob}</p>
                </div>

                <span className="reminder-date">
                  {reminder.dueDate}
                </span>

                <div className="reminder-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      handleToggleReminder(reminder.id)
                    }
                  >
                    Mark Incomplete
                  </button>

                  <button
                    className="button button-danger"
                    type="button"
                    onClick={() =>
                      handleDeleteReminder(reminder.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}