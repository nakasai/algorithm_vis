import React, { useState } from 'react';

const IntervalPartitionVisualizer: React.FC = () => {
  // 基本的なステート管理
  const [n, setN] = useState(5); // 数列の長さ
  const [k, setK] = useState(2); // 分割数

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">区間分割問題の動的計画法</h1>
      <p className="mb-4">
        区間分割問題を動的計画法で解くプロセスを視覚的に確認できます。
      </p>
      
      {/* 設定パネル */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">パラメータ設定</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">配列サイズ (N)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="3"
                max="10"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                className="w-full mr-4"
              />
              <span className="w-8 text-center">{n}</span>
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-semibold">分割数 (K)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max={Math.max(1, n-1)}
                value={k}
                onChange={(e) => setK(parseInt(e.target.value))}
                className="w-full mr-4"
              />
              <span className="w-8 text-center">{k}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-100 rounded">
        <p>このアーティファクトは現在実装中です。詳細な機能は近日公開予定です。</p>
      </div>
    </div>
  );
};

export default IntervalPartitionVisualizer;
