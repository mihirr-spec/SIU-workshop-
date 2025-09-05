import { useState } from 'react';
import { Button } from '@radix-ui/themes';
import { ClipLoader } from 'react-spinners';

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  loading,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded border bg-white">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          className="h-4 w-4"
          disabled={loading}
        />
        {isEditing ? (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        ) : (
          <span className={todo.done ? 'line-through text-gray-500' : ''}>{todo.text}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              size="1"
              onClick={() => {
                onUpdate(todo.id, text.trim());
                setIsEditing(false);
              }}
              disabled={loading || text.trim().length === 0}
            >
              Save
            </Button>
            <Button size="1" variant="soft" onClick={() => setIsEditing(false)} disabled={loading}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="1" variant="soft" onClick={() => setIsEditing(true)} disabled={loading}>
              Edit
            </Button>
            <Button size="1" color="red" onClick={() => onDelete(todo.id)} disabled={loading}>
              Delete
            </Button>
          </>
        )}
        {loading ? <ClipLoader size={16} /> : null}
      </div>
    </div>
  );
}


