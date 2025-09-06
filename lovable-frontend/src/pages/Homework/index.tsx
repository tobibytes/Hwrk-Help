import React from 'react';
import HomeworkLayout from '@/components/pages/Homework/HomeworkLayout';
import HomeworkList from '@/components/pages/Homework/HomeworkList';
import { useHomeworkPage } from '@/hooks/pages/useHomeworkPage';

export default function Index() {
  const { loading, items } = useHomeworkPage();
  return (
    <HomeworkLayout title="My Homework">
      {loading ? <div>Loading…</div> : <HomeworkList items={items} />}
    </HomeworkLayout>
  );
}
