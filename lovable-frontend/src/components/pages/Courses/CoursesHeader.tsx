import React from 'react';

const CoursesHeader: React.FC = () => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Courses</h1>
      <p className="text-foreground-secondary">Manage your enrolled courses and sync materials</p>
    </div>
  </div>
);

export default CoursesHeader;

