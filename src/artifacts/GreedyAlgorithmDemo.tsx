import React, { useState } from 'react';

const GreedyAlgorithmDemo = () => {
  // 硬貨の種類（円）
  const [coins, setCoins] = useState([500, 100, 50, 10, 5, 1]);
  // 目標金額
  const [targetAmount, setTargetAmount] = useState(763);
  // 選択された硬貨
  const [selectedCoins, setSelectedCoins] = useState([]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">貪欲法アルゴリズム</h1>
      <p className="mb-4">
        貪欲法アルゴリズムの動作をコイン問題を例に視覚的に確認できます。
      </p>
      
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">設定</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">目標金額（円）:</label>
            <input
              type="text"
              value={targetAmount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setTargetAmount(value);
                }
              }}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-100 rounded">
        <p>このアーティファクトは現在実装中です。詳細な機能は近日公開予定です。</p>
      </div>
    </div>
  );
};

export default GreedyAlgorithmDemo;
