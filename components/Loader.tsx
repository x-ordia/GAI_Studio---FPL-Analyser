import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
        <div className="simple-spinner" role="status" aria-label="Loading content">
            <span className="sr-only">Loading...</span>
        </div>
    </div>
  );
};

export default Loader;