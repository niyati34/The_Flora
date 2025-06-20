import { createContext, useContext, useState, useEffect } from "react";

const CareReminderContext = createContext();

export function CareReminderProvider({ children }) {
  const [reminders, setReminders] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("plantReminders");
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("plantReminders", JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (
    productId,
    plantName,
    careType,
    frequency,
    startDate
  ) => {
    const newReminder = {
      id: Date.now(),
      productId,
      plantName,
      careType, // 'water', 'fertilize', 'prune', 'repot'
      frequency, // days between reminders
      startDate,
      lastDone: null,
      nextDue: calculateNextDue(startDate, frequency),
      isActive: true,
    };

    setReminders((prev) => [...prev, newReminder]);
    return newReminder.id;
  };

  const markReminderDone = (reminderId) => {
    setReminders((prev) =>
      prev.map((reminder) => {
        if (reminder.id === reminderId) {
          const now = new Date().toISOString();
          return {
            ...reminder,
            lastDone: now,
            nextDue: calculateNextDue(now, reminder.frequency),
          };
        }
        return reminder;
      })
    );
  };

  const deleteReminder = (reminderId) => {
    setReminders((prev) =>
      prev.filter((reminder) => reminder.id !== reminderId)
    );
  };

  const getRemindersForProduct = (productId) => {
    return reminders.filter((reminder) => reminder.productId === productId);
  };

  const getDueReminders = () => {
    const now = new Date();
    return reminders.filter(
      (reminder) => reminder.isActive && new Date(reminder.nextDue) <= now
    );
  };

  const getUpcomingReminders = (days = 3) => {
    const future = new Date();
    future.setDate(future.getDate() + days);

    return reminders.filter(
      (reminder) =>
        reminder.isActive &&
        new Date(reminder.nextDue) <= future &&
        new Date(reminder.nextDue) > new Date()
    );
  };

  return (
    <CareReminderContext.Provider
      value={{
        reminders,
        addReminder,
        markReminderDone,
        deleteReminder,
        getRemindersForProduct,
        getDueReminders,
        getUpcomingReminders,
      }}
    >
      {children}
    </CareReminderContext.Provider>
  );
}

function calculateNextDue(startDate, frequencyDays) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + frequencyDays);
  return date.toISOString();
}

export const useCareReminder = () => {
  const context = useContext(CareReminderContext);
  if (!context) {
    throw new Error(
      "useCareReminder must be used within a CareReminderProvider"
    );
  }
  return context;
};
