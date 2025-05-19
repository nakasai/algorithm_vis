import React from 'react';

const EditDistanceVisualizer: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">編集距離アルゴリズム可視化</h1>
      <p className="mb-4">
        レーベンシュタイン距離（編集距離）アルゴリズムの動作を視覚的に確認できます。
        2つの文字列間の変換に必要な最小編集回数を計算します。
      </p>
      <div className="p-4 bg-yellow-100 rounded">
        <p>このアーティファクトは現在実装中です。詳細な機能は近日公開予定です。</p>
      </div>
    </div>
  );
};

export default EditDistanceVisualizer;
