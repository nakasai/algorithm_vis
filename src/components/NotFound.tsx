import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">ページが見つかりません</h2>
        <p className="mb-8 text-gray-600">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          アーティファクト一覧に戻る
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
