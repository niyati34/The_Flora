import { createContext, useContext, useReducer, useEffect } from "react";

const NotesContext = createContext();

const notesReducer = (state, action) => {
  switch (action.type) {
    case "ADD_NOTE":
      return {
        ...state,
        notes: [
          ...state.notes,
          {
            id: Date.now(),
            text: action.text,
            productId: action.productId,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    case "REMOVE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.noteId),
      };
    case "EDIT_NOTE":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.noteId ? { ...note, text: action.text } : note
        ),
      };
    case "LOAD_NOTES":
      return { notes: action.notes };
    default:
      return state;
  }
};

export function NotesProvider({ children }) {
  const [notesState, dispatch] = useReducer(notesReducer, { notes: [] });

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("plantNotes");
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      dispatch({ type: "LOAD_NOTES", notes });
    }
  }, []);

  // Save to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("plantNotes", JSON.stringify(notesState.notes));
  }, [notesState.notes]);

  const addNote = (text, productId = null) => {
    dispatch({ type: "ADD_NOTE", text, productId });
  };

  const removeNote = (noteId) => {
    dispatch({ type: "REMOVE_NOTE", noteId });
  };

  const editNote = (noteId, text) => {
    dispatch({ type: "EDIT_NOTE", noteId, text });
  };

  const getNotesForProduct = (productId) => {
    return notesState.notes.filter((note) => note.productId === productId);
  };

  const getAllNotes = () => {
    return notesState.notes;
  };

  return (
    <NotesContext.Provider
      value={{
        notes: notesState.notes,
        addNote,
        removeNote,
        editNote,
        getNotesForProduct,
        getAllNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
