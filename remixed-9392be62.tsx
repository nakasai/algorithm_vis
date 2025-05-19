import React, { useState, useEffect } from 'react';

const GreedyAlgorithmDemo = () => {
  // 硬貨の種類（円）
  const [coins, setCoins] = useState([500, 100, 50, 10, 5, 1]);
  // 目標金額
  const [targetAmount, setTargetAmount] = useState(763);
  // 選択された硬貨
  const [selectedCoins, setSelectedCoins] = useState([]);
  // 残りの金額
  const [remainingAmount, setRemainingAmount] = useState(763);
  // アニメーションステップ
  const [step, setStep] = useState(-1);
  // アニメーション速度（ミリ秒）
  const [speed, setSpeed] = useState(800);
  // アニメーション実行中かどうか
  const [isRunning, setIsRunning] = useState(false);
  // 解説メッセージ
  const [message, setMessage] = useState('「開始」ボタンを押して、貪欲法のデモを開始してください。あるいは「次へ」ボタンで手動で進めることもできます。');
  // 反例を表示するかどうか
  const [showExample, setShowExample] = useState(false);
  // 硬貨の枚数制限
  const [coinLimits, setCoinLimits] = useState({500: -1, 100: -1, 50: -1, 10: -1, 5: -1, 1: -1});
  // 制限モード
  const [useLimits, setUseLimits] = useState(false);

  // 選択された硬貨をグループ化して表示
  const groupedCoins = selectedCoins.reduce((acc, coin) => {
    acc[coin] = (acc[coin] || 0) + 1;
    return acc;
  }, {});

  // 入力金額の変更
  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTargetAmount(value);
    } else if (e.target.value === '') {
      setTargetAmount('');
    }
  };

  // 硬貨制限の変更
  const handleLimitChange = (coin, value) => {
    const limit = value === '' ? -1 : parseInt(value);
    const newLimits = {
      ...coinLimits,
      [coin]: isNaN(limit) ? -1 : limit
    };
    setCoinLimits(newLimits);
    console.log(`硬貨${coin}円の制限を${newLimits[coin]}枚に設定しました`);
  };

  // 硬貨の追加
  const handleAddCoin = (value) => {
    if (value && !isNaN(parseInt(value)) && !coins.includes(parseInt(value))) {
      const newValue = parseInt(value);
      setCoins([...coins, newValue].sort((a, b) => b - a));
      
      // 新しい硬貨の制限も初期化
      setCoinLimits({
        ...coinLimits,
        [newValue]: -1
      });
    }
  };

  // 硬貨の削除
  const handleRemoveCoin = (coin) => {
    if (coins.length > 1) {
      setCoins(coins.filter(c => c !== coin).sort((a, b) => b - a));
      
      // coinLimitsからも削除
      const newLimits = {...coinLimits};
      delete newLimits[coin];
      setCoinLimits(newLimits);
    }
  };

  // 次のステップで使用する硬貨を選択する関数
  const selectNextCoin = () => {
    // 使用できる次の硬貨を探す
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      
      // この硬貨が残額以下かチェック
      if (coin <= remainingAmount) {
        // 制限モードが有効な場合、枚数制限をチェック
        if (useLimits) {
          // この硬貨がすでに何枚使われているかをカウント
          const usedCount = selectedCoins.filter(c => c === coin).length;
          // 制限枚数に達していなければこの硬貨を使用
          if (coinLimits[coin] === -1 || usedCount < coinLimits[coin]) {
            return { coin, index: i, usable: true };
          }
          // 制限に達していればスキップして次の硬貨へ
        } else {
          // 制限モードが無効なら、この硬貨を使用
          return { coin, index: i, usable: true };
        }
      }
    }
    
    // 使用できる硬貨がない
    return { coin: null, index: -1, usable: false };
  };

  // 貪欲法の開始
  const startGreedy = () => {
    resetGreedy();
    setRemainingAmount(targetAmount);
    setStep(0);
    setIsRunning(true);
    setMessage(`貪欲法を開始します。目標金額: ${targetAmount}円`);
  };
  
  // 貪欲法のリセット
  const resetGreedy = () => {
    setSelectedCoins([]);
    setRemainingAmount(targetAmount);
    setStep(-1);
    setIsRunning(false);
    setMessage('「開始」ボタンを押して、貪欲法のデモを開始してください。あるいは「次へ」ボタンで手動で進めることもできます。');
  };
  
  // 手動制御: 次のステップへ
  const nextStep = () => {
    // 初回の場合は初期化
    if (step === -1) {
      setRemainingAmount(targetAmount);
      setSelectedCoins([]);
      setStep(0);
      setMessage(`貪欲法を開始します。目標金額: ${targetAmount}円`);
      return;
    }
    
    if (remainingAmount === 0) {
      setMessage(`完了！${targetAmount}円を${selectedCoins.length}枚の硬貨で支払います。`);
      return;
    }
    
    // 次に使用する硬貨を決定
    const nextCoinInfo = selectNextCoin();
    
    if (!nextCoinInfo.usable) {
      // 使用できる硬貨がない場合
      setMessage('これ以上続行できません。適切な硬貨がありません。');
      return;
    }
    
    if (nextCoinInfo.coin === null) {
      // すべての硬貨が制限に達している場合
      const skippedCoins = coins.filter(coin => 
        coin <= remainingAmount && 
        coinLimits[coin] !== -1 && 
        selectedCoins.filter(c => c === coin).length >= coinLimits[coin]
      );
      
      if (skippedCoins.length > 0) {
        setMessage(`ステップ ${step + 1}: ${skippedCoins.join(', ')}円硬貨はすべて制限枚数に達しています。`);
      } else {
        setMessage(`ステップ ${step + 1}: 適切な硬貨が見つかりません。`);
      }
      setStep(step + 1);
      return;
    }
    
    // 硬貨を追加
    setSelectedCoins([...selectedCoins, nextCoinInfo.coin]);
    setRemainingAmount(remainingAmount - nextCoinInfo.coin);
    setStep(step + 1);
    setMessage(`ステップ ${step + 1}: ${nextCoinInfo.coin}円硬貨を選択。残り: ${remainingAmount - nextCoinInfo.coin}円`);
  };
  
  // 手動制御: 前のステップへ
  const prevStep = () => {
    if (step > 0) {
      const prevCoin = selectedCoins[selectedCoins.length - 1];
      const newSelectedCoins = selectedCoins.slice(0, -1);
      
      setSelectedCoins(newSelectedCoins);
      setRemainingAmount(remainingAmount + prevCoin);
      setStep(step - 1);
      setMessage(`ステップ ${step - 1}: 前のステップに戻りました。残り: ${remainingAmount + prevCoin}円`);
    } else {
      setMessage('これ以上戻れません。最初のステップです。');
    }
  };

  // 貪欲法の実行（ステップごと）
  useEffect(() => {
    if (step >= 0 && isRunning) {
      if (remainingAmount === 0) {
        setIsRunning(false);
        setMessage(`完了！${targetAmount}円を${selectedCoins.length}枚の硬貨で支払います。`);
        return;
      }

      const timer = setTimeout(() => {
        // 次に使用する硬貨を決定
        const nextCoinInfo = selectNextCoin();
        
        if (!nextCoinInfo.usable) {
          // 使用できる硬貨がない場合
          setIsRunning(false);
          setMessage('これ以上続行できません。適切な硬貨がありません。');
          return;
        }
        
        if (nextCoinInfo.coin === null) {
          // すべての硬貨が制限に達している場合
          const skippedCoins = coins.filter(coin => 
            coin <= remainingAmount && 
            coinLimits[coin] !== -1 && 
            selectedCoins.filter(c => c === coin).length >= coinLimits[coin]
          );
          
          if (skippedCoins.length > 0) {
            setMessage(`ステップ ${step + 1}: ${skippedCoins.join(', ')}円硬貨はすべて制限枚数に達しています。`);
          } else {
            setMessage(`ステップ ${step + 1}: 適切な硬貨が見つかりません。`);
          }
          setStep(step + 1);
          return;
        }
        
        // 硬貨を追加
        setSelectedCoins([...selectedCoins, nextCoinInfo.coin]);
        setRemainingAmount(remainingAmount - nextCoinInfo.coin);
        setStep(step + 1);
        setMessage(`ステップ ${step + 1}: ${nextCoinInfo.coin}円硬貨を選択。残り: ${remainingAmount - nextCoinInfo.coin}円`);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [step, isRunning, remainingAmount, coins, selectedCoins, speed, targetAmount, coinLimits, useLimits]);

  // 初期化
  useEffect(() => {
    setRemainingAmount(targetAmount);
  }, []);
  
  // ソースコードの表示/非表示の状態
  const [showCode, setShowCode] = useState(true);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">貪欲法（Greedy Algorithm）インタラクティブデモ</h1>
      
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">設定</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">目標金額（円）:</label>
            <input
              type="text"
              value={targetAmount}
              onChange={handleAmountChange}
              onClick={(e) => e.target.select()}
              className="w-full p-2 border rounded"
              disabled={isRunning}
            />
          </div>
          
          <div className="flex-1">
            <label className="block mb-1 font-medium">アニメーション速度:</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
              disabled={isRunning}
            >
              <option value="200">とても速い (200ms)</option>
              <option value="500">速い (500ms)</option>
              <option value="800">普通 (800ms)</option>
              <option value="1200">遅い (1200ms)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center mb-1">
            <input 
              type="checkbox" 
              id="useLimits" 
              checked={useLimits} 
              onChange={(e) => setUseLimits(e.target.checked)} 
              className="mr-2"
              disabled={isRunning}
            />
            <label htmlFor="useLimits" className="font-medium">硬貨の枚数制限を有効にする</label>
          </div>
          
          {useLimits && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-2">
              {coins.map(coin => (
                <div key={`limit-${coin}`} className="flex flex-col">
                  <label className="text-sm">{coin}円の枚数:</label>
                  <input 
                    type="number" 
                    min="-1"
                    value={coinLimits[coin] === -1 ? '' : coinLimits[coin]} 
                    onChange={(e) => handleLimitChange(coin, e.target.value)}
                    placeholder="無制限"
                    className="p-1 border rounded text-center"
                    disabled={isRunning}
                  />
                  <span className="text-xs text-gray-500 text-center">(-1: 無制限)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">利用可能な硬貨</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {coins.map(coin => (
            <div key={coin} className="relative inline-block">
              <span className="inline-block px-3 py-2 bg-blue-100 rounded-full font-medium">
                {coin}円
              </span>
              <button
                onClick={() => handleRemoveCoin(coin)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                disabled={isRunning || coins.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="新しい硬貨を追加..."
            className="p-2 border rounded flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCoin(e.target.value);
                e.target.value = '';
              }
            }}
            disabled={isRunning}
          />
          <button
            onClick={(e) => {
              const input = e.target.previousSibling;
              handleAddCoin(input.value);
              input.value = '';
            }}
            className="px-3 py-2 bg-green-500 text-white rounded"
            disabled={isRunning}
          >
            追加
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={startGreedy}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={isRunning}
        >
          開始
        </button>
        <button
          onClick={resetGreedy}
          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded"
        >
          リセット
        </button>
        <button
          onClick={() => setShowExample(!showExample)}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded"
        >
          {showExample ? "反例を隠す" : "反例を表示"}
        </button>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setIsRunning(false);
            prevStep();
          }}
          className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded"
          disabled={step <= 0}
        >
          ◀ 前へ
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            nextStep();
          }}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
        >
          次へ ▶
        </button>
        <div className="flex-1 px-4 py-2 bg-gray-200 text-center rounded">
          ステップ: {step >= 0 ? step : 0}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">実行結果</h2>
          <div className="p-3 mb-4 bg-gray-100 rounded min-h-12">
            <p>{message}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">選択された硬貨:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(groupedCoins).map(([coin, count]) => (
                <div key={coin} className="px-3 py-2 bg-green-100 rounded-full">
                  {coin}円 × {count}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">残り金額: {remainingAmount}円</p>
            </div>
            <div>
              <p className="font-medium">硬貨の合計枚数: {selectedCoins.length}枚</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2 flex justify-between items-center">
            <span>C++ソースコード</span>
            <button 
              onClick={() => setShowCode(!showCode)} 
              className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              {showCode ? "コードを隠す" : "コードを表示"}
            </button>
          </h2>
          
          {showCode && (
            <div className="overflow-hidden relative mb-4">
              <div className="flex text-sm">
                {/* 行番号部分 */}
                <div className="bg-gray-700 text-gray-300 py-3 px-3 text-right select-none" style={{minWidth: '3rem', lineHeight: '1.5rem'}}>
                  {Array.from({length: 27}, (_, i) => (
                    <div key={i} style={{height: '1.5rem'}}>{i+1}</div>
                  ))}
                </div>
                
                {/* コード部分 */}
                <pre className="bg-gray-800 text-white py-3 px-3 overflow-auto flex-1" style={{margin: 0, lineHeight: '1.5rem'}}>
<code>{`#include <iostream>
#include <vector>
using namespace std;

// コインの金額
const vector<int> value = {500, 100, 50, 10, 5, 1};

int main() {
    // 入力
    int X;
    vector<int> a(6);
    cin >> X;
    for (int i = 0; i < 6; ++i) cin >> a[i];

    // 貪欲法
    int result = 0;
    for (int i = 0; i < 6; ++i) {
        // 枚数制限がない場合の枚数
        int add = X / value[i];
        // 枚数制限を考慮
        if (add > a[i]) add = a[i];
        // 残り金額を求めて，答えに枚数を加算する
        X -= value[i] * add;
        result += add;
    }
    cout << result << endl;
}`}</code>
                </pre>
              </div>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 rounded">
            <h3 className="font-medium mb-2">コードの解説:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>入力</strong>: 目標金額 X と各硬貨の枚数制限 a[i] を読み込む (12-13行目)</li>
              <li><strong>貪欲法の核心</strong>: 大きな額面の硬貨から順に使用していく (17-25行目)</li>
              <li><strong>枚数計算</strong>: <code>add = X / value[i]</code> で各硬貨の理想的な使用枚数を計算 (19行目)</li>
              <li><strong>制限の考慮</strong>: <code>if (add > a[i]) add = a[i];</code> で実際に使える枚数に調整 (21行目)</li>
              <li><strong>更新処理</strong>: 残り金額を減らし、使用した硬貨の枚数を加算 (23-24行目)</li>
              <li><strong>日本の硬貨システム特性</strong>: 日本円の硬貨体系では、この貪欲法が最小枚数を保証する (6行目で既に大きい順にソートされている）</li>
            </ul>
          </div>
        </div>
      </div>
      
      {showExample && (
        <div className="p-4 bg-yellow-50 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">貪欲法が最適解を与えない例</h2>
            <button
              onClick={() => setShowExample(false)}
              className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
            >
              閉じる
            </button>
          </div>
          
          <p className="mb-2">
            目標金額: <strong>40セント</strong><br />
            利用可能な硬貨: 25¢, 10¢, 1¢ (※5¢硬貨がない設定)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white rounded shadow">
              <h3 className="font-medium mb-2">貪欲法による解:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 rounded-full">25¢ × 1</span>
                <span className="px-3 py-1 bg-blue-100 rounded-full">10¢ × 1</span>
                <span className="px-3 py-1 bg-blue-100 rounded-full">1¢ × 5</span>
              </div>
              <p className="mt-2">合計: 7枚の硬貨</p>
            </div>
            
            <div className="p-3 bg-white rounded shadow">
              <h3 className="font-medium mb-2">最適解:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 rounded-full">10¢ × 4</span>
              </div>
              <p className="mt-2">合計: 4枚の硬貨</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-orange-100 rounded">
            <p>
              <strong>解説:</strong> 40セントを作る場合、貪欲法では25¢+10¢+1¢×5の合計7枚を選びますが、最適解は10¢を4枚使う方法（合計4枚）です。
              このように、硬貨の組み合わせによっては、貪欲法は必ずしも最適解を導くとは限りません。
            </p>
          </div>
        </div>
      )}
      
      <div className="p-4 bg-blue-50 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">貪欲法の解説</h2>
        <p>
          貪欲法（Greedy Algorithm）は、その場その場で最適と思われる選択を行い、最終的な解を得る手法です。
          このデモでは、コイン支払い問題（硬貨の最小枚数を使って金額を支払う問題）を例にしています。
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>各ステップで可能な限り大きな価値の硬貨を選びます</li>
          <li>日本の硬貨システム（1, 5, 10, 50, 100, 500円）では、貪欲法が常に最適解（最小枚数）を与えます</li>
          <li>しかし、全ての問題で貪欲法が最適解を導くわけではありません（「反例を表示」ボタンでご確認ください）</li>
          <li>貪欲法の利点は、実装が簡単で実行速度が速いことです</li>
          <li>枚数制限がある場合も考慮できるよう、上部の設定で「硬貨の枚数制限」を有効にできます</li>
        </ul>
      </div>
    </div>
  );
};

export default GreedyAlgorithmDemo;
