import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ChevronDown, ChevronRight, Play, Pause, RotateCcw, Zap, AlertTriangle, Info } from 'lucide-react';

const KnapsackVisualizerEnhanced: React.FC = () => {
  // 初期データ
  const defaultItems = [
    { name: '金の指輪', weight: 4, value: 6 },
    { name: 'ダイヤの指輪', weight: 5, value: 8 },
    { name: '銀の指輪', weight: 2, value: 3 },
  ];
  
  // 状態管理
  const [items, setItems] = useState([...defaultItems]);
  const [maxWeight, setMaxWeight] = useState(7);
  const [dpTable, setDpTable] = useState<number[][]>([]); // Added type
  const [step, setStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]); // Added type
  const [currentI, setCurrentI] = useState(0);
  const [currentW, setCurrentW] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', weight: 1, value: 1 });
  
  // アニメーション制御
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 再生速度: 0.5～3
  const [showCode, setShowCode] = useState(true);
  
  // 計算用の定数
  const N = items ? items.length : 0;
  const W = maxWeight || 1; // デフォルト値を設定して0にならないようにする
  const totalSteps = N * (W + 1);
  
  // 初期化
  useEffect(() => {
    initializeDP();
  }, [items, maxWeight]);
  
  // 自動再生制御
  useEffect(() => {
    if (isPlaying && !isComplete) {
      const timer = setTimeout(() => {
        if (step < totalSteps) {
          setStep(prevStep => prevStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1000 / speed);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, step, speed, totalSteps, isComplete]);
  
  // ステップ変更時の処理
  useEffect(() => {
    if (step >= totalSteps) {
      try {
        // 計算完了
        const finalDpTable: number[][] = Array(N + 1).fill(null).map(() => Array(W + 1).fill(0)); // Added type
        
        for (let i = 0; i < N; i++) {
          if (!items[i]) continue; // 安全チェック: アイテムが存在しない場合はスキップ
          
          for (let w = 0; w <= W; w++) {
            try {
              const item = items[i];
              
              // 選ぶ場合（重さが許す場合）
              if (w - item.weight >= 0) {
                // 安全チェック: 必要な配列要素が存在するか確認
                if (finalDpTable[i] && typeof finalDpTable[i][w - item.weight] !== 'undefined') {
                  const newValue = finalDpTable[i][w - item.weight] + item.value;
                  finalDpTable[i + 1][w] = Math.max(finalDpTable[i + 1][w], newValue);
                }
              }
              
              // 選ばない場合
              if (finalDpTable[i] && typeof finalDpTable[i][w] !== 'undefined') {
                finalDpTable[i + 1][w] = Math.max(finalDpTable[i + 1][w], finalDpTable[i][w]);
              }
            } catch (innerError) {
              console.error(`計算中のエラー (i=${i}, w=${w}):`, innerError);
            }
          }
        }
        
        setDpTable(finalDpTable);
        
        // 選択アイテムの特定
        let remainingWeight = W;
        const selected: any[] = []; // Added type
        
        for (let i = N; i > 0; i--) {
          if (i <= items.length && // 安全チェック: インデックスが配列の範囲内か
              finalDpTable[i] && finalDpTable[i-1] && // 安全チェック: 配列要素が存在するか
              typeof finalDpTable[i][remainingWeight] !== 'undefined' && 
              typeof finalDpTable[i-1][remainingWeight] !== 'undefined' &&
              finalDpTable[i][remainingWeight] !== finalDpTable[i-1][remainingWeight]) {
            const item = items[i-1];
            if (item) { // 安全チェック: アイテムが存在するか
              selected.push(item);
              remainingWeight -= item.weight;
              // 安全チェック: remainingWeight が0未満になったら終了
              if (remainingWeight < 0) break;
            }
          }
        }
        
        setSelectedItems(selected);
        setIsComplete(true);
        setIsPlaying(false);
      } catch (error) {
        console.error("計算完了時にエラー:", error);
        setIsComplete(true);
        setIsPlaying(false);
      }
    } else {
      try {
        // ステップごとの計算
        const i = Math.floor(step / (W + 1));
        const w = step % (W + 1);
        
        setCurrentI(i);
        setCurrentW(w);
        setIsComplete(false);
        
        // DPテーブルの計算
        const newDpTable: number[][] = Array(N + 1).fill(null).map(() => Array(W + 1).fill(0)); // Added type
        
        for (let s = 0; s <= step; s++) {
          try {
            const si = Math.floor(s / (W + 1));
            const sw = s % (W + 1);
            
            if (si < N && si < items.length) { // 安全チェック: インデックスが範囲内か
              const item = items[si];
              if (!item) continue; // 安全チェック: アイテムが存在しない場合はスキップ
              
              // 選ぶ場合（重さが許す場合）
              if (sw - item.weight >= 0) {
                // 安全チェック: 必要な配列要素が存在するか確認
                if (newDpTable[si] && typeof newDpTable[si][sw - item.weight] !== 'undefined') {
                  const newValue = newDpTable[si][sw - item.weight] + item.value;
                  newDpTable[si + 1][sw] = Math.max(newDpTable[si + 1][sw], newValue);
                }
              }
              
              // 選ばない場合
              if (newDpTable[si] && typeof newDpTable[si][sw] !== 'undefined') {
                newDpTable[si + 1][sw] = Math.max(newDpTable[si + 1][sw], newDpTable[si][sw]);
              }
            }
          } catch (stepError) {
            console.error(`ステップ ${s} でエラー:`, stepError);
          }
        }
        
        setDpTable(newDpTable);
      } catch (error) {
        console.error("ステップ計算中にエラー:", error);
      }
    }
  }, [step, totalSteps, items, N, W]); // Removed dpTable from dependencies as it's set here
  
  // DPテーブルの初期化
  const initializeDP = () => {
    try {
      // 定数の安全チェック
      const rowCount = Math.max(1, N + 1);
      const colCount = Math.max(1, W + 1);
      
      const newDpTable: number[][] = Array(rowCount).fill(null).map(() => Array(colCount).fill(0)); // Added type
      setDpTable(newDpTable);
      setSelectedItems([]);
      setCurrentI(0);
      setCurrentW(0);
      setIsComplete(false);
      setStep(0);
      setIsPlaying(false);
      
      console.log(`DPテーブル初期化: ${rowCount}x${colCount}`);
    } catch (error) {
      console.error("DPテーブル初期化エラー:", error);
      // 最低限の初期化
      setDpTable([[0]]);
      setStep(0);
      setIsPlaying(false);
    }
  };
  
  // アイテム追加処理
  const addItem = () => {
    // 空の名前でもアイテムを追加可能に
    const itemName = newItem.name.trim() ? newItem.name : `アイテム${items.length + 1}`;
    setItems([...items, { name: itemName, weight: newItem.weight, value: newItem.value }]);
    setNewItem({ name: '', weight: 1, value: 1 });
  };
  
  // アイテム削除処理
  const removeItem = (index: number) => { // Added type
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  
  // アイテムの更新処理
  const updateItem = (index: number, field: string, value: string) => { // Added types
    const newItems = [...items];
    
    if (field === 'name') {
      newItems[index].name = value;
    } else if (field === 'weight' || field === 'value') {
      (newItems[index] as any)[field] = parseInt(value) || 1; // Added type assertion
    }
    
    setItems(newItems);
  };
  
  // 編集モード終了処理
  const saveSettings = () => {
    setEditMode(false);
    // initializeDP(); // Already called by useEffect on items/maxWeight change
  };
  
  // 初期値に戻す処理
  const resetToDefault = () => {
    setItems([...defaultItems]);
    setMaxWeight(7);
  };
  
  // 再生/一時停止の切り替え
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };
  
  // 次のステップに進む
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(prevStep => prevStep + 1);
    }
  };
  
  // 前のステップに戻る
  const prevStep = () => {
    if (step > 0) {
      setStep(prevStep => prevStep - 1);
    }
  };
  
  // スピードの変更
  const handleSpeedChange = (newSpeed: number[]) => { // Added type
    setSpeed(newSpeed[0]);
  };
  
  // リセット
  const resetVisualization = () => {
    setIsPlaying(false);
    setStep(0);
    setCurrentI(0);
    setCurrentW(0);
    setIsComplete(false);
    setSelectedItems([]);
    
    const newDpTable: number[][] = Array(N + 1).fill(null).map(() => Array(W + 1).fill(0)); // Added type
    setDpTable(newDpTable);
  };
  
  // セルのスタイルを取得
  const getCellStyle = (i: number, j: number) => { // Added types
    if (isComplete) {
      // 優先度1: 最終的な最適値セル (dp[N][W])
      if (i === N && j === W) {
        return "bg-red-100 border-red-500 border-2 font-bold";
      }
      
      // バックトラック処理で訪れるセルを色付け（動的に計算）
      let remainingWeight = W;
      let selectedIndices: any[] = []; // Added type
      
      // まず選択されたアイテムのインデックスを特定
      for (let idx = N; idx > 0; idx--) {
        // 選択されたアイテムかどうかを判定
        if (dpTable[idx] && dpTable[idx-1] && 
            dpTable[idx][remainingWeight] !== dpTable[idx-1][remainingWeight]) {
          // 選択されたアイテム情報を記録
          selectedIndices.push({
            index: idx,
            weight: remainingWeight,
            itemWeight: items[idx-1].weight,
            value: items[idx-1].value
          });
          // 残り重量を減らす
          remainingWeight -= items[idx-1].weight;
        }
      }
      
      // 優先度2: 選択されたアイテムのセル（薄い赤色）
      for (const item of selectedIndices) {
        if (i === item.index && j === item.weight) {
          return "bg-red-100 border-red-300 border";
        }
      }
      
      // 優先度3: 計算元のセル（黄色）
      for (const item of selectedIndices) {
        // 計算元の位置を特定 (一行上、重さが減った位置)
        if (i === item.index - 1 && j === item.weight - item.itemWeight) {
          return "bg-yellow-100 border-yellow-300 border";
        }
      }
      
      return "bg-white";
    }
    
    // --- 以下は計算中の色分け（変更なし） ---
    
    // 現在計算中のセル
    if (i === currentI + 1 && j === currentW) {
      return "bg-blue-100 border-blue-500 border-2";
    }
    
    // 参照されている前のセル（選ばない場合）
    if (i === currentI && j === currentW) {
      return "bg-green-100 border-green-500 border-2";
    }
    
    // 安全チェック
    if (currentI >= items.length) {
      return "bg-white";
    }
    
    // 参照されている前のセル（選ぶ場合）- 重さが許す場合のみ
    const currentItem = items[currentI];
    if (!currentItem) return "bg-white";
    
    const canSelect = currentW - currentItem.weight >= 0;
    if (canSelect && i === currentI && j === currentW - currentItem.weight) {
      return "bg-yellow-100 border-yellow-500 border-2";
    }
    
    return "bg-white";
  };
  
  // 現在の計算ステップの説明を取得
  const getCurrentStepDescription = () => {
    if (isComplete) {
      return (
        <div className="space-y-2">
          <p>計算完了！最適な総価値: <span className="font-bold text-xl">{dpTable[N]?.[W] ?? 0}</span></p>
          <p>選択されたアイテム:</p>
          <ul className="list-disc pl-5">
            {selectedItems.map((item, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {item.name} (価値: {item.value}, 重さ: {item.weight})
              </motion.li>
            ))}
          </ul>
          <p>合計価値: {selectedItems.reduce((sum, item) => sum + item.value, 0)}</p>
          <p>合計重さ: {selectedItems.reduce((sum, item) => sum + item.weight, 0)}</p>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="font-semibold">最適解の求め方（バックトラック）:</p>
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">バックトラックのコード:</p>
              <div className="p-2 bg-gray-800 text-white text-sm rounded overflow-auto">
                <pre className="language-javascript"><code dangerouslySetInnerHTML={{ __html: `<span class="token comment">// 選択アイテムの特定（バックトラック）のコード</span>\\n<span class="token keyword">let</span> remainingWeight <span class="token operator">=</span> W<span class="token punctuation">;</span>  <span class="token comment">// 最大重量からスタート</span>\\n<span class="token keyword">const</span> selected <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>\\n\\n<span class="token comment">// 最後のアイテムから順に見る</span>\\n<span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> N<span class="token punctuation">;</span> i <span class="token operator">></span> <span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">--</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\\n    <span class="token comment">// 現在のDP値と1つ上の行の同じ列を比較</span>\\n    <span class="token keyword">if</span> <span class="token punctuation">(</span>dpTable<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">[</span>remainingWeight<span class="token punctuation">]</span> <span class="token operator">!==</span> dpTable<span class="token punctuation">[</span>i<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">[</span>remainingWeight<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\\n        <span class="token comment">// 値が違う = このアイテムは選ばれている</span>\\n        selected<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>items<span class="token punctuation">[</span>i<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\\n        <span class="token comment">// 選んだアイテムの重さを引く</span>\\n        remainingWeight <span class="token operator">-=</span> items<span class="token punctuation">[</span>i<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">.</span>weight<span class="token punctuation">;</span>\\n    <span class="token punctuation">}</span>\\n    <span class="token comment">// 値が同じなら、そのアイテムは選ばれていない</span>\\n<span class="token punctuation">}</span>`}} /></pre>
              </div>
              
              <style dangerouslySetInnerHTML={{ __html: `
                .language-javascript {
                  font-family: Monaco, Consolas, monospace;
                  line-height: 1.4;
                }
                .token.comment {
                  color: #6a9955;
                  font-style: italic;
                }
                .token.keyword {
                  color: #569cd6;
                }
                .token.operator, .token.punctuation {
                  color: #d4d4d4;
                }
                .token.string {
                  color: #ce9178;
                }
                .token.number {
                  color: #b5cea8;
                }
                .token.function {
                  color: #dcdcaa;
                }
                .token.property, .token.parameter {
                  color: #9cdcfe;
                }
              `}} />
            </div>
            
            <div className="mt-3">
              <p className="text-sm font-medium">具体例（現在のデータで）:</p>
              <ol className="list-decimal pl-5 text-sm mt-1 space-y-1">
                {selectedItems.length > 0 && dpTable && dpTable.length > 0 && (
                  <>
                    <li>
                      最大重量 W = {W}、最適値 = dp[{N}][{W}] = {dpTable[N]?.[W] ?? 0}
                    </li>
                    {Array.from({ length: N }, (_, idx) => {
                      const i = N - idx; // N, N-1, ..., 1
                      const item = items[i-1];
                      const remainingW = (() => {
                        let weight = W;
                        for (let j = 0; j < idx; j++) {
                          const checkedI = N - j;
                          if (dpTable[checkedI] && dpTable[checkedI-1] && 
                              dpTable[checkedI][weight] !== dpTable[checkedI-1][weight]) {
                            weight -= items[checkedI-1].weight;
                          }
                        }
                        return weight;
                      })();
                      
                      const isSelected = dpTable[i] && dpTable[i-1] && 
                                       dpTable[i][remainingW] !== dpTable[i-1][remainingW];
                      
                      return (
                        <li key={i} className={isSelected ? "font-medium" : ""}>
                          i={i}（{item.name}）: dp[{i}][{remainingW}] = {dpTable[i]?.[remainingW] ?? 0}, 
                          dp[{i-1}][{remainingW}] = {dpTable[i-1]?.[remainingW] ?? 0}
                          {isSelected ? (
                            <> 
                              <span className="text-red-600"> → 値が異なる</span>
                              なので<span className="text-red-600">選択されている</span>。
                              残り重量: {remainingW} - {item.weight} = {remainingW - item.weight}
                            </>
                          ) : (
                            <> → 値が同じなので選択されていない。残り重量: {remainingW}</>
                          )}
                        </li>
                      );
                    })}
                  </>
                )}
              </ol>
            </div>
            
            <div className="mt-3">
              <p className="text-sm font-medium">DPテーブルの色の説明:</p>
              <ul className="list-disc pl-5 text-sm mt-1">
                <li><span className="font-bold text-red-600">赤枠の太いセル (dp[N][W])</span>: 最終的な最適値 {dpTable[N]?.[W] ?? 0}</li>
                <li><span className="text-red-600">薄い赤色のセル</span>: バックトラックで「このアイテムは選ばれている」と判定されたセル
                  <ul className="list-disc pl-5 mt-1">
                    {(() => {
                      let cells = [];
                      let remainingWeight = W;
                      
                      for (let i = 0; i < selectedItems.length; i++) {
                        const item = selectedItems[i];
                        const itemIndex = items.findIndex(it => it === item) + 1;
                        
                        cells.push(
                          <li key={i}>
                            dp[{itemIndex}][{remainingWeight}] = {dpTable[itemIndex]?.[remainingWeight] ?? 0}
                          </li>
                        );
                        
                        remainingWeight -= item.weight;
                      }
                      
                      return cells;
                    })()}
                  </ul>
                </li>
                <li><span className="text-yellow-600">黄色のセル</span>: 選ばれたアイテムの価値の計算元となったセル
                  <ul className="list-disc pl-5 mt-1">
                    {(() => {
                      let cells = [];
                      let remainingWeight = W;
                      
                      for (let i = 0; i < selectedItems.length; i++) {
                        const item = selectedItems[i];
                        const itemIndex = items.findIndex(it => it === item) + 1;
                        
                        cells.push(
                          <li key={i}>
                            dp[{itemIndex}][{remainingWeight}] = dp[{itemIndex-1}][{remainingWeight-item.weight}] + {item.value} =&nbsp;
                            {dpTable[itemIndex-1]?.[remainingWeight-item.weight] ?? 0} + {item.value} =&nbsp;
                            {(dpTable[itemIndex-1]?.[remainingWeight-item.weight] ?? 0) + item.value}
                          </li>
                        );
                        
                        remainingWeight -= item.weight;
                      }
                      
                      return cells;
                    })()}
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentI === 0 && currentW === 0) {
      return (
        <div>
          <p>初期状態 (dp[0][0] = 0)</p>
          <p>まだアイテムを選んでいない状態では価値は0です。</p>
        </div>
      );
    }
    
    // 安全チェック - 範囲外のインデックスや未初期化の場合の対応
    if (currentI >= items.length || !items[currentI]) {
      return <div>アイテムデータを読み込み中...</div>;
    }
    
    if (currentI < N) {
      const item = items[currentI];
      const canSelect = currentW - item.weight >= 0;
      
      // 安全チェック - dpTableが初期化されていない場合の対応
      const safeGetDpValue = (i: number, j: number) => { // Added types
        return dpTable && dpTable[i] && typeof dpTable[i][j] !== 'undefined' ? dpTable[i][j] : 0;
      };
      
      const selectingValue = canSelect ? 
        safeGetDpValue(currentI, currentW - item.weight) + item.value : 0;
      
      const notSelectingValue = safeGetDpValue(currentI, currentW);
      
      // 最終的な値の計算
      const finalValue = canSelect ? 
        Math.max(notSelectingValue, selectingValue) : 
        notSelectingValue;
        
      return (
        <div className="space-y-2">
          <p>
            <Badge variant="outline">ステップ (i={currentI}, w={currentW})</Badge> {item.name}
            (価値: {item.value}, 重さ: {item.weight}) について計算中
          </p>
          
          {canSelect ? (
            <>
              <motion.div 
                className="p-2 bg-yellow-50 rounded border border-yellow-200"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>
                  1. <span className="text-yellow-600 font-semibold">アイテムを選ぶ場合</span>: 
                  dp[{currentI}][{currentW - item.weight}] + value[{currentI}] = 
                  {safeGetDpValue(currentI, currentW - item.weight)} + {item.value} = {selectingValue}
                </p>
              </motion.div>
              
              <motion.div 
                className="p-2 bg-green-50 rounded border border-green-200"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p>
                  2. <span className="text-green-600 font-semibold">アイテムを選ばない場合</span>: 
                  dp[{currentI}][{currentW}] = {notSelectingValue}
                </p>
              </motion.div>
              
              <motion.div 
                className="p-2 bg-blue-50 rounded border border-blue-200"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p>
                  よって、dp[{currentI+1}][{currentW}] = 
                  max({notSelectingValue}, {selectingValue}) = {finalValue}
                </p>
                <p className="font-semibold mt-1">
                  このステップでの判断: アイテムを
                  {finalValue > notSelectingValue ? 
                    <span className="text-yellow-600"> 選ぶ </span> : 
                    <span className="text-green-600"> 選ばない </span>}
                </p>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div 
                className="p-2 bg-gray-50 rounded border border-gray-200"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>
                  このアイテムの重さ ({item.weight}) が現在の重量制限 ({currentW}) を超えるため選べません。
                </p>
                <p className="mt-1">
                  よって、dp[{currentI+1}][{currentW}] = dp[{currentI}][{currentW}] = {notSelectingValue}
                </p>
              </motion.div>
            </>
          )}
        </div>
      );
    }
    
    return <div>計算準備中...</div>;
  };
  
  // コード表示（ハイライト付き）
  const renderCode = () => {
    // 現在のステップでハイライトすべき行
    let highlightLines: number[] = []; // Added type
    const [showHeaderCode, setShowHeaderCode] = useState(false);
    const [showFunctionCode, setShowFunctionCode] = useState(false);
    const [showInputCode, setShowInputCode] = useState(false);
    
    if (isComplete) {
      // 計算完了時は結果出力行をハイライト
      highlightLines = [36];
    } else if (currentI < N && currentI < items.length && items[currentI]) {
      // 安全チェック: インデックスが範囲内で、アイテムが存在する場合
      const item = items[currentI];
      const canSelect = currentW - item.weight >= 0;
      
      if (canSelect) {
        // ifが通る場合は「選ぶ場合」と「選ばない場合」の両方の処理行をハイライト
        highlightLines = [28, 31];
      } else {
        // ifが通らない場合は「選ばない場合」の処理行のみをハイライト
        highlightLines = [31];
      }
    }
    
    // C++コード
    const cppCode = `// ナップサック問題のC++コード実装
#include <iostream>
#include <vector>
using namespace std;

template<class T> void chmax(T& a, T b) {
    if (a < b) {
        a = b;
    }
}

int main() {
    // 入力
    int N;
    long long W;
    cin >> N >> W;
    vector<long long> weight(N), value(N);
    for (int i = 0; i < N; ++i) cin >> weight[i] >> value[i];

    // DP テーブル定義
    vector<vector<long long>> dp(N + 1, vector<long long>(W + 1, 0));

    // DPループ
    for (int i = 0; i < N; ++i) {
        for (int w = 0; w <= W; ++w) {
            // i 番目の品物を選ぶ場合
            if (w - weight[i] >= 0) {
                chmax(dp[i + 1][w], dp[i][w - weight[i]] + value[i]);
            }
            // i 番目の品物を選ばない場合
            chmax(dp[i + 1][w], dp[i][w]);
        }
    }

    // 最適値の出力
    cout << dp[N][W] << endl;
}`;
    
    // 行ごとに分割
    const codeLines = cppCode.split('\\n');
    
    // 折りたたみセクションの定義
    const collapsedSections = [
      { start: 2, end: 4, title: "ヘッダー", state: showHeaderCode, setState: setShowHeaderCode },
      { start: 6, end: 10, title: "関数定義", state: showFunctionCode, setState: setShowFunctionCode },
      { start: 14, end: 18, title: "入力処理", state: showInputCode, setState: setShowInputCode }
    ];
    
    // 特殊文字をエスケープする関数
    const escapeHTML = (str: string) => { // Added type
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    // 行が省略セクションに含まれるかチェック
    const isLineCollapsed = (lineNum: number) => { // Added type
      return collapsedSections.some(section => 
        !section.state && lineNum >= section.start && lineNum <= section.end
      );
    };
    
    // シンプルなシンタックスハイライト用のCSSクラス
    const getTokenClass = (token: string) => { // Added type
      // キーワード
      if (/^(int|long|void|for|if|return|using|namespace|std|vector|cin|cout|endl|class|template)$/.test(token)) {
        return 'text-blue-400'; // キーワード: 青
      }
      // 関数
      else if (/^(chmax|main)$/.test(token)) {
        return 'text-yellow-300'; // 関数: 黄色
      }
      // 数字
      else if (/^[0-9]+$/.test(token)) {
        return 'text-purple-400'; // 数字: 紫
      }
      // 現在の変数強調
      else if ((token === 'i' || token === 'w') && currentI < N && currentI < items.length) {
        return 'font-bold text-pink-400'; // 現在の変数: ピンク + 太字
      }
      // その他
      return '';
    };
    
    // 一行のコードをトークン化してハイライト
    const highlightCodeLine = (line: string) => { // Added type
      // コメントの処理（コメントを先に取り出す）
      const commentMatch = line.match(/(\\/\\/.*$)/);
      let mainCode = line;
      let comment = '';
      
      if (commentMatch) {
        comment = commentMatch[0];
        mainCode = line.substring(0, line.indexOf(comment));
      }
      
      // 先頭のスペースを保持するために特別に処理
      const leadingSpacesMatch = mainCode.match(/^(\\s*)/); // Added null check possibility
      const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[0] : "";
      const codeWithoutLeadingSpaces = mainCode.substring(leadingSpaces.length);
      
      // コード部分をエスケープ
      const safeMainCode = escapeHTML(codeWithoutLeadingSpaces);
      
      // 単語ごとにハイライト適用
      const tokenizedCode = safeMainCode.split(/([^a-zA-Z0-9_])/).map((part, i) => {
        const token = part.trim();
        if (!token) return part; // 空白はそのまま
        
        const className = getTokenClass(token);
        
        if (className) {
          return `<span class="${className}">${part}</span>`;
        }
        return part;
      }).join('');
      
      // コメントを緑色で追加
      const highlightedLine = commentMatch 
        ? `${escapeHTML(leadingSpaces)}${tokenizedCode}<span class="text-green-400">${escapeHTML(comment)}</span>` 
        : `${escapeHTML(leadingSpaces)}${tokenizedCode}`;
        
      return highlightedLine;
    };
    
    // 行を実際に表示する関数（折りたたみ機能対応）
    const renderLine = (line: string, i: number) => { // Added types
      const lineNumber = i + 1;
      const isHighlighted = highlightLines.includes(lineNumber);
      
      // コードライン全体のクラス
      let lineClass = "code-line flex";
      if (isHighlighted) {
        lineClass += " bg-yellow-900 bg-opacity-30 border-l-2 border-yellow-500";
      }
      
      // 行番号のスタイル
      const lineNumberClass = "line-number text-gray-500 w-10 text-right pr-3 select-none flex-shrink-0";
      
      // 折りたたみセクションの処理
      for (const section of collapsedSections) {
        // セクションの開始行
        if (lineNumber === section.start) {
          if (!section.state) {
            // 折りたたみ状態
            return (
              <div key={`line-${lineNumber}`} className="code-line collapsed-section py-1">
                <span className={lineNumberClass}>{lineNumber}</span>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 mr-1 cursor-pointer text-gray-400" onClick={() => section.setState(true)} />
                  <span className="text-gray-400">{section.title} （クリックして展開）</span>
                </div>
              </div>
            );
          }
        }
        
        // 折りたたみ範囲内（非表示）
        if (!section.state && lineNumber > section.start && lineNumber <= section.end) {
          return null;
        }
        
        // 折りたたみセクションの終了行
      if (section.state && lineNumber === section.end) {
        return (
          <div key={`line-${lineNumber}`} className={`${lineClass} border-b border-gray-700 pb-1 mb-1 relative`}>
            <span className={lineNumberClass}>{lineNumber}</span>
            <pre className="m-0 p-0 whitespace-pre font-mono"><span dangerouslySetInnerHTML={{ __html: highlightCodeLine(line) }} className="code-content" /></pre>
            <button 
              className="absolute right-2 text-xs px-2 py-0.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
              onClick={() => section.setState(false)}
            >
              <ChevronDown className="w-3 h-3 inline mr-1" />
              折りたたむ
            </button>
          </div>
        );
      }
      }
      
      // 通常の行
      return (
        <div key={`line-${lineNumber}`} className={`${lineClass} py-1 relative`}>
          <span className={lineNumberClass}>{lineNumber}</span>
          <pre className="m-0 p-0 whitespace-pre font-mono"><span dangerouslySetInnerHTML={{ __html: highlightCodeLine(line) }} className="code-content" /></pre>
          
          {/* 現在のi, wに関するコメント */}
          {isHighlighted && currentI < N && currentI < items.length && items[currentI] && 
           (lineNumber === 28 || lineNumber === 31) && (
            <span className="absolute right-0 bg-blue-800 text-white px-2 py-0.5 rounded-l text-xs opacity-90">
              {lineNumber === 28 ? 
                `// 現在: i=${currentI}(${items[currentI].name}), w=${currentW}, weight=${items[currentI].weight}, value=${items[currentI].value}` : 
                `// 現在: dp[${currentI+1}][${currentW}] = max(dp[${currentI+1}][${currentW}], dp[${currentI}][${currentW}])`}
            </span>
          )}
          
          {/* ループコメント */}
          {lineNumber === 24 && currentI < N && currentI < items.length && items[currentI] && (
            <span className="absolute right-0 bg-purple-800 text-white px-2 py-0.5 rounded-l text-xs opacity-90">
              {`// 現在の計算位置: i=${currentI}, w=${currentW}`}
            </span>
          )}
        </div>
      );
    };
    
    return (
      <AnimatePresence>
        {showCode && (
          <motion.div 
            className="bg-gray-900 p-4 rounded-lg shadow-sm overflow-auto text-sm mt-4"
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'auto' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
          >
            <div className="code-container relative font-mono text-gray-100">
              {/* コード表示エリア */}
              <div className="code-lines">
                {codeLines.map((line, i) => renderLine(line, i))}
              </div>
              
              {/* 下部ステータス表示 */}
              <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-gray-300">
                <div className="text-xs">
                  {isComplete ? 
                    "計算完了: 最終結果を表示中" : 
                    `計算中: ステップ ${step}/${totalSteps} (i=${currentI}, w=${currentW})`}
                </div>
                <div>
                  <button 
                    className="text-xs px-2 py-1 bg-blue-900 hover:bg-blue-800 rounded mr-2"
                    onClick={() => {
                      setShowHeaderCode(!showHeaderCode);
                      setShowFunctionCode(!showFunctionCode);
                      setShowInputCode(!showInputCode);
                    }}
                  >
                    全て{showHeaderCode && showFunctionCode && showInputCode ? '折りたたむ' : '展開する'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  // DPテーブル表示
  const renderDPTable = () => {
    if (!dpTable || dpTable.length === 0) {
      return <div className="text-center py-4">DPテーブルを初期化中...</div>;
    }
    
    // テーブルのスクロール領域を設定
    // const tableWidth = Math.min(1000, (W + 2) * 60); // Unused
    
    // 安全にdpTableの行数と列数を取得
    const rowCount = Math.min(dpTable.length, N + 1);
    const colCount = Math.min(dpTable[0] ? dpTable[0].length : 0, W + 1);

    return (
      <motion.div
        className="overflow-auto bg-white rounded-lg shadow-lg p-4 max-w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-w-max">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-100 w-16">アイテム\\重さ</th>
                {Array.from({ length: colCount }, (_, w) => (
                  <motion.th 
                    key={`header-${w}`} 
                    className="border border-gray-300 p-2 bg-gray-100 w-12"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.5, w * 0.05) }}
                  >
                    {w}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }, (_, i) => {
                // セル行を安全に取得
                const rowData = dpTable[i] || Array(colCount).fill(0);
                
                return (
                  <motion.tr 
                    key={`row-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(0.5, i * 0.1) }}
                  >
                    <th className={`border border-gray-300 p-2 text-left
                      ${i > 0 && isComplete && selectedItems.some(item => items.indexOf(item) === i-1) 
                        ? 'bg-red-50' : 'bg-gray-50'}`}
                    >
                      {i === 0 ? '初期値' : `${i}: ${i <= items.length && items[i-1] ? items[i-1].name : '不明'}`}
                    </th>
                    {Array.from({ length: colCount }, (_, w) => {
                      // セル値を安全に取得
                      const cellValue = typeof rowData[w] !== 'undefined' ? rowData[w] : 0;
                      
                      return (
                        <motion.td 
                          key={`cell-${i}-${w}`} 
                          className={`border border-gray-300 p-2 text-center ${getCellStyle(i, w)}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            transition: { 
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                              delay: Math.min(0.5, 0.05 * (i + w))
                            }
                          }}
                        >
                          {cellValue}
                        </motion.td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          
          {/* テーブルに直接つける色の説明 */}
          <div className="mt-4 border-t pt-3">
            <h3 className="text-sm font-bold mb-2">色の説明:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {isComplete ? (
                <>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-red-100 border-2 border-red-500 mr-2"></span>
                    <span>最適解の価値 (dp[N][W])</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 mr-2"></span>
                    <span>選択されたアイテム</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-300 mr-2"></span>
                    <span>選択アイテムの参照セル</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-blue-100 border-2 border-blue-500 mr-2"></span>
                    <span>現在計算中のセル</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-green-100 border-2 border-green-500 mr-2"></span>
                    <span>参照セル - 選ばない場合</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-4 h-4 bg-yellow-100 border-2 border-yellow-500 mr-2"></span>
                    <span>参照セル - 選ぶ場合</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // アイテム表示・編集パネル
  const renderItemPanel = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>アイテム設定</CardTitle>
        <CardDescription>
          {editMode 
            ? "アイテムの詳細を編集してください" 
            : "現在のアイテムリスト"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editMode ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex gap-2 items-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div>
                  <Label htmlFor={`item-name-${index}`} className="text-sm">アイテム名</Label>
                  <Input
                    id={`item-name-${index}`}
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="border p-1" // Removed fixed width, rely on default or Tailwind
                    placeholder={`アイテム${index + 1}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`item-weight-${index}`} className="text-sm">重さ</Label>
                  <Input
                    id={`item-weight-${index}`}
                    type="number"
                    min="1"
                    value={item.weight}
                    onChange={(e) => updateItem(index, 'weight', e.target.value)}
                    className="w-20"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <Label htmlFor={`item-value-${index}`} className="text-sm">価値</Label>
                  <Input
                    id={`item-value-${index}`}
                    type="number"
                    min="1"
                    value={item.value}
                    onChange={(e) => updateItem(index, 'value', e.target.value)}
                    className="w-20"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  削除
                </Button>
              </motion.div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="mt-4">
              <h4 className="font-bold">新しいアイテムを追加</h4>
              <motion.div 
                className="flex gap-2 items-end mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <Label htmlFor="new-item-name" className="text-sm">アイテム名</Label>
                  <Input
                    id="new-item-name"
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder={`アイテム${items.length + 1}`}
                  />
                </div>
                <div>
                  <Label htmlFor="new-item-weight" className="text-sm">重さ</Label>
                  <Input
                    id="new-item-weight"
                    type="number"
                    min="1"
                    value={newItem.weight}
                    onChange={(e) => setNewItem({...newItem, weight: parseInt(e.target.value) || 1})}
                    className="w-20"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <Label htmlFor="new-item-value" className="text-sm">価値</Label>
                  <Input
                    id="new-item-value"
                    type="number"
                    min="1"
                    value={newItem.value}
                    onChange={(e) => setNewItem({...newItem, value: parseInt(e.target.value) || 1})}
                    className="w-20"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={addItem}
                >
                  追加
                </Button>
              </motion.div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="max-weight" className="font-bold block">最大重量</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="max-weight"
                  type="number"
                  min="1"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(parseInt(e.target.value) || 1)}
                  className="w-20 mt-1"
                  onFocus={(e) => e.target.select()}
                />
                <div className="text-sm text-gray-500">
                  ナップサックに入れられる最大重量を設定します
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={saveSettings}
              >
                設定を保存
              </Button>
              <Button
                variant="outline"
                onClick={resetToDefault}
              >
                初期値に戻す
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-1 mb-3">
              {items.map((item, index) => (
                <motion.li 
                  key={index}
                  className={`p-2 rounded-md ${isComplete && selectedItems.includes(item) ? 'bg-red-50' : 'bg-gray-50'}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {index + 1}: {item.name} (価値: {item.value}, 重さ: {item.weight})
                </motion.li>
              ))}
            </ul>
            <p className="font-bold mt-2">重量制限: {W}</p>
            <Button
              className="mt-2"
              onClick={() => setEditMode(true)}
              disabled={isComplete || isPlaying || step > 0}
            >
              <Edit className="w-4 h-4 mr-2" />
              アイテムと重量を編集
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
  
  // 制御パネル表示
  const renderControlPanel = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>制御パネル</CardTitle>
        <CardDescription>
          {isComplete 
            ? "計算が完了しました。リセットするとやり直せます。" 
            : `現在のステップ: ${step} / ${totalSteps}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">アニメーション速度</Label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm">遅い</span>
                <Slider
                  value={[speed]}
                  min={0.5}
                  max={3}
                  step={0.5}
                  onValueChange={handleSpeedChange}
                  disabled={isComplete}
                  className="flex-grow"
                />
                <span className="text-sm">速い</span>
              </div>
            </div>
            
            <div className="flex items-end">
              <div>
                <Toggle
                  pressed={showCode}
                  onPressedChange={setShowCode}
                >
                  コードを{showCode ? '非表示' : '表示'}
                </Toggle>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={step === 0 || isPlaying}
            >
              <StepBack className="w-4 h-4 mr-1" /> 
              前へ
            </Button>
            
            <Button
              variant={isPlaying ? "secondary" : "default"}
              size="sm"
              onClick={togglePlayPause}
              disabled={isComplete || step >= totalSteps}
            >
              {isPlaying 
                ? <><Pause className="w-4 h-4 mr-1" /> 一時停止</> 
                : <><Play className="w-4 h-4 mr-1" /> 再生</>}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextStep}
              disabled={isComplete || step >= totalSteps || isPlaying}
            >
              次へ <StepForward className="w-4 h-4 ml-1" />
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => setStep(totalSteps)}
              disabled={isComplete || step >= totalSteps || isPlaying}
            >
              <FastForward className="w-4 h-4 mr-1" />
              計算完了
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetVisualization}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              リセット
            </Button>
          </div>
          
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            {getCurrentStepDescription()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // メインレンダリング
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.h1 
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ナップサック問題の動的計画法可視化
      </motion.h1>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-semibold text-blue-700">ナップサック問題とは</h2>
        <p className="mt-1">
          限られた容量の「ナップサック」に価値と重さを持つ品物を詰め込み、価値の合計を最大化する問題です。
          この可視化では、動的計画法（DP）によって解を求めるプロセスを段階的に確認できます。
        </p>
      </div>
      
      {renderControlPanel()}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderDPTable()}
          {renderCode()}
        </div>
        
        <div className="lg:col-span-1">
          {renderItemPanel()}
        </div>
      </div>
    </div>
  );
};

export default KnapsackVisualizerEnhanced;