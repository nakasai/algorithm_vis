import React, { useState } from 'react';

const GreedyAlgorithmDemo: React.FC = () => {
  // 硬貨の種類（円）
  const coins = [500, 100, 50, 10, 5, 1];
  
  // 目標金額
  const [targetAmount, setTargetAmount] = useState(763);
  // 選択された硬貨
  const [selectedCoins, setSelectedCoins] = useState<number[]>([]);
  // 残りの金額
  const [remainingAmount, setRemainingAmount] = useState(763);
  
  // ダミーのグループ化されたコイン（表示用）
  const coinDisplay = {
    "500": 1,
    "100": 2,
    "10": 1,
    "1": 3
  };
  
  // 選択された硬貨をグループ化して表示するための関数
  const getGroupedCoins = () => {
    return selectedCoins.reduce((acc: Record<string, number>, coin) => {
      acc[coin] = (acc[coin] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };
  
  // 貪欲法の実行（サンプル・実装）
  const runGreedyAlgorithm = () => {
    setSelectedCoins([]);
    setRemainingAmount(targetAmount);
    
    // 実際の貪欲法のロジック
    let amount = targetAmount;
    const newSelectedCoins: number[] = [];
    
    for (const coin of coins) {
      while (amount >= coin) {
        newSelectedCoins.push(coin);
        amount -= coin;
      }
    }
    
    setSelectedCoins(newSelectedCoins);
    setRemainingAmount(0);
  };

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
              value={targetAmount}              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setTargetAmount(value);
                  setRemainingAmount(value);
                  setSelectedCoins([]);
                }
              }}
              className="w-full p-2 border rounded"
            />          </div>
          <div className="flex items-end">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={runGreedyAlgorithm}
            >
              貪欲法で計算
            </button>
          </div>
        </div>
      </div>
      
      {/* 選ばれた硬貨の表示 */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">選択された硬貨:</h2>
        <div className="flex flex-wrap gap-2">
          {selectedCoins.length > 0 ? 
            Object.entries(getGroupedCoins()).map(([coin, count]) => (
              <div key={coin} className="px-3 py-2 bg-green-100 rounded-full">
                {coin}円 × {count}
              </div>
            ))
            :
            Object.entries(coinDisplay).map(([coin, count]) => (
              <div key={coin} className="px-3 py-2 bg-gray-100 rounded-full">
                {coin}円 × {count} (サンプル)
              </div>
            ))
          }
        </div>
        <p className="mt-4 font-medium">
          {selectedCoins.length > 0 
            ? `合計: ${selectedCoins.length}枚 (総額: ${targetAmount}円)` 
            : `合計: 7枚 (総額: ${targetAmount}円) (サンプル)`
          }
        </p>
        <p className="mt-2">残り: {remainingAmount}円</p>
      </div>
      
      <div className="p-4 bg-yellow-100 rounded">
        <p>このアーティファクトは現在実装中です。詳細な機能は近日公開予定です。</p>
      </div>
    </div>
  );
};

export default GreedyAlgorithmDemo;
