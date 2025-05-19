import React, { useState } from 'react';

const GreedyAlgorithmDemo: React.FC = () => {  // 硬貨の種類（円）- 直接値を使用する形に修正
  // Coin denominations defined in coinDisplay below

  // 目標金額
  const [targetAmount, setTargetAmount] = useState(763);
  // 選択された硬貨
  // const [selectedCoins, setSelectedCoins] = useState<number[]>([]);
  
  // ダミーのグループ化されたコイン（表示用）
  const coinDisplay = {
    "500": 1,
    "100": 2,
    "10": 1,
    "1": 3
  };
  // 選択された硬貨のグループ化はcoinDisplayのダミーデータを使用

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">貪欲法アルゴリズム</h1>
      <p className="mb-4">
        貪欲法アルゴリズムの動作をコイン問題を例に視覚的に確認できます。
      </p>
      
      {/* 目標金額表示 */}
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
                  setTargetAmount(value);                  // Reset state values
                }
              }}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
      
      {/* 選ばれた硬貨の表示（ダミー） */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">選択された硬貨:</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(coinDisplay).map(([coin, count]) => (
            <div key={coin} className="px-3 py-2 bg-green-100 rounded-full">
              {coin}円 × {count}
            </div>
          ))}
        </div>
        <p className="mt-4 font-medium">合計: 7枚 (総額: {targetAmount}円)</p>
      </div>
      
      <div className="p-4 bg-yellow-100 rounded">
        <p>このアーティファクトは現在実装中です。詳細な機能は近日公開予定です。</p>
      </div>
    </div>
  );
};

export default GreedyAlgorithmDemo;
