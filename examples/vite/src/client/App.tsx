import { useState } from 'react';
import type { AppType } from '../index';
import { hc } from 'hono/client';
import styles from './App.module.css';

export const client = hc<AppType>('/');

async function getGreeting() {
  const res = await client.api.$get();
  return res.text();
}

export function App() {
  const [greeting, setGreeting] = useState<string | null>(null);

  const handleOnClick = async () => {
    const greeting = await getGreeting();
    setGreeting(greeting);
  };

  return (
    <div className={styles.app}>
      <h1>Hello HONC 🪿</h1>

      <h2>What does the goose say?</h2>

      <button type="button" className={styles.button} onClick={handleOnClick}>
        Find out
      </button>

      {greeting && (
        <div>
          <pre>{greeting}</pre>
        </div>
      )}
    </div>
  );
}
