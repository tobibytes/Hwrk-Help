import React from 'react';

const CourseDetailHeader: React.FC<{ title: string; onRename: () => void }> = ({ title, onRename }) => (
  <div className="container mx-auto px-0 space-y-0 max-w-5xl">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <button className="btn btn-secondary" onClick={onRename}>Rename</button>
    </div>
  </div>
);

export default CourseDetailHeader;

