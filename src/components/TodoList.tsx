import { useEffect, useMemo, useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { useNetworkVariable } from '../networkConfig';
import { TodoItem } from './TodoItem';
import toast from 'react-hot-toast';

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export function TodoList() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable('counterPackageId');
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, refetch, isPending } = useSuiClientQuery('getOwnedObjects', {
    owner: currentAccount?.address || '0x0',
    options: {
      showContent: true,
    },
    filter: {
      StructType: `${packageId}::todo::Todo`,
    },
  }, {
    enabled: !!currentAccount?.address,
  });

  const [moduleOk, setModuleOk] = useState<boolean>(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await suiClient.getNormalizedMoveModule({ package: packageId, module: 'todo' });
        if (mounted) setModuleOk(true);
      } catch (e: any) {
        setModuleOk(false);
      }
    })();
    return () => { mounted = false; };
  }, [packageId, suiClient]);

  const todos: Todo[] = useMemo(() => {
    const list: Todo[] = [];
    const objects = data?.data || [];
    for (const obj of objects) {
      const content = (obj.data as any)?.content;
      if (content?.dataType === 'moveObject' && content.type?.includes('::todo::Todo')) {
        const fields = content.fields as any;
        list.push({ id: (obj.data as any).objectId, text: fields.text, done: fields.done });
      }
    }
    return list;
  }, [data]);

  async function createTodo(text: string) {
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::todo::create_todo`,
      arguments: [txb.pure.string(text)],
    });

    const toastId = toast.loading('Creating todo...');
    signAndExecute({ transaction: txb }, {
      onSuccess: async (result) => {
        toast.success('Todo created!', { id: toastId });
        await waitForEffects(result.digest);
        refetch();
      },
      onError: (err) => {
        toast.error(`Create failed: ${err.message}`, { id: toastId });
      },
    });
  }

  async function toggle(id: string) {
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::todo::toggle_done`,
      arguments: [txb.object(id)],
    });

    setPendingId(id);
    const toastId = toast.loading('Toggling...');
    signAndExecute({ transaction: txb }, {
      onSuccess: async (result) => {
        toast.success('Todo updated!', { id: toastId });
        await waitForEffects(result.digest);
        setPendingId(null);
        refetch();
      },
      onError: (err) => {
        setPendingId(null);
        toast.error(`Toggle failed: ${err.message}`, { id: toastId });
      },
    });
  }

  async function update(id: string, newText: string) {
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::todo::update_text`,
      arguments: [txb.object(id), txb.pure.string(newText)],
    });

    setPendingId(id);
    const toastId = toast.loading('Updating...');
    signAndExecute({ transaction: txb }, {
      onSuccess: async (result) => {
        toast.success('Todo updated!', { id: toastId });
        await waitForEffects(result.digest);
        setPendingId(null);
        refetch();
      },
      onError: (err) => {
        setPendingId(null);
        toast.error(`Update failed: ${err.message}`, { id: toastId });
      },
    });
  }

  async function remove(id: string) {
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::todo::delete_todo`,
      arguments: [txb.object(id)],
    });

    setPendingId(id);
    const toastId = toast.loading('Deleting...');
    signAndExecute({ transaction: txb }, {
      onSuccess: async (result) => {
        toast.success('Todo deleted!', { id: toastId });
        await waitForEffects(result.digest);
        setPendingId(null);
        refetch();
      },
      onError: (err) => {
        setPendingId(null);
        toast.error(`Delete failed: ${err.message}`, { id: toastId });
      },
    });
  }

  async function waitForEffects(digest: string) {
    await suiClient.waitForTransaction({
      digest,
      options: { showEffects: true, showObjectChanges: true },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {!moduleOk ? (
        <div className="rounded border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
          Package ID does not contain `todo` module. Publish the Move package in `move/counter` and set the new package ID in `src/constants.ts`.
        </div>
      ) : null}

      <CreateForm onCreate={createTodo} disabled={!currentAccount || isPending || !moduleOk} />
      <div className="flex flex-col gap-2">
        {todos.map(t => (
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={toggle}
            onUpdate={update}
            onDelete={remove}
            loading={pendingId === t.id}
          />
        ))}
        {todos.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-6">No todos yet. Add your first task above.</div>
        ) : null}
      </div>
    </div>
  );
}

function CreateForm({ onCreate, disabled }: { onCreate: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('');
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        onCreate(trimmed);
        setText('');
      }}
    >
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Add a todo..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={disabled || text.trim().length === 0}
      >
        Add
      </button>
    </form>
  );
}


