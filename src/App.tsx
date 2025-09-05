import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Box, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { useMemo } from 'react';
import { useNetworkVariable } from './networkConfig';
import { TodoList } from './components/TodoList';

function App() {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable('counterPackageId');
  const shortAddress = useMemo(() => {
    if (!currentAccount?.address) return '';
    const a = currentAccount.address;
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }, [currentAccount?.address]);

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: '1px solid var(--gray-a2)',
        }}
      >
        <Box>
          <Heading>Todo Board dApp</Heading>
          <Text size="1" color="gray">
            Package ID: {counterPackageId}
          </Text>
          {currentAccount?.address ? (
            <Text size="1" color="blue">{shortAddress}</Text>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <input id="pkgInput" className="border rounded px-2 py-1 text-xs w-72" placeholder="Paste new package ID (0x...)" />
            <button
              className="text-xs px-2 py-1 bg-gray-900 text-white rounded"
              onClick={() => {
                const el = document.getElementById('pkgInput') as HTMLInputElement | null;
                const val = el?.value?.trim();
                if (val && val.startsWith('0x')) {
                  try { window.localStorage.setItem('sui_pkg', val); } catch {}
                  window.location.reload();
                }
              }}
            >
              Set Package
            </button>
          </div>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: 'var(--gray-a2)', minHeight: 500 }}
        >
          {currentAccount ? (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Todos</h2>
                    <span className="text-xs text-gray-500">Connected: {shortAddress}</span>
                  </div>
                  <TodoList />
                </div>
              </div>
            </div>
          ) : (
            <Heading>Please connect your wallet</Heading>
          )}
        </Container>
      </Container>
    </>
  );
}

export default App;
