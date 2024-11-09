import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

interface ProgressProps {
  progress: number;
}

const Progress: React.FC<ProgressProps> = ({ progress }) => {
  return (
    <ProgressBar 
      now={progress} 
      variant="success" 
      style={{ width: '100%', height: '10px', margin: 0, padding: 0, borderRadius: 0, backgroundColor: "#2f2f31"}}
    />
  );
}

export default Progress;
