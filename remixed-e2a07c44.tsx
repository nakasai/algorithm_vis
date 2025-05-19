import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 編集距離可視化コンポーネント
const EditDistanceVisualizer = () => {
  // 状態管理
  const [sourceStr, setSourceStr] = useState('horse');
  const [targetStr, setTargetStr] = useState('ros');
  const [dpTable, setDpTable] = useState([]);
  const [step, setStep] = useState(0);
  const [operations, setOperations] = useState([]);
  const [currentI, setCurrentI] = useState(0);
  const [currentJ, setCurrentJ] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // 計算用の定数
  const M = sourceStr.length;
  const N = targetStr.length;
  const totalSteps = (M + 1) * (N + 1);
  const INF = 1 << 29;

  // 初期化
  useEffect(() => {
    initializeDP();
  }, [sourceStr, targetStr]);

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

  // DPテーブルの初期化
  const initializeDP = useCallback(() => {
    try {
      // 明示的にサイズを確認
      const rows = Math.max(1, M + 1);
      const cols = Math.max(1, N + 1);
      
      // すべてのセルを初期状態（INF）にする
      const initialDp = Array(rows).fill().map(() => Array(cols).fill(INF));
      
      // 0,0のみ0に初期化（他は各ステップで埋めていく）
      initialDp[0][0] = 0;

      setDpTable(initialDp);
      setOperations([]);
      setCurrentI(0);
      setCurrentJ(0);
      setIsComplete(false);
      setStep(0);
      
      console.log(`DPテーブル初期化: ${rows}x${cols}`);
    } catch (error) {
      console.error('DPテーブルの初期化中にエラーが発生しました:', error);
      // 最小限のテーブルで回復
      setDpTable([[0]]);
      setStep(0);
    }
  }, [M, N, INF]);

  // ステップ変更時の処理
  useEffect(() => {
    if (step >= totalSteps) {
      completeDPCalculation();
      return;
    }

    const i = Math.floor(step / (N + 1));
    const j = step % (N + 1);

    setCurrentI(i);
    setCurrentJ(j);
    setIsComplete(false);

    // DPテーブルを完全に再計算（前のステップに戻るときも正しく動作するように）
    const rows = Math.max(1, M + 1);
    const cols = Math.max(1, N + 1);
    const newDpTable = Array(rows).fill().map(() => Array(cols).fill(INF));
    
    // 現在のステップまで計算
    for (let s = 0; s <= step; s++) {
      const si = Math.floor(s / (N + 1));
      const sj = s % (N + 1);
      
      if (si === 0 && sj === 0) {
        // 初期条件: dp[0][0] = 0
        newDpTable[0][0] = 0;
      } else if (si === 0) {
        // 初期条件: dp[0][j] = j
        newDpTable[0][sj] = sj;
      } else if (sj === 0) {
        // 初期条件: dp[i][0] = i
        newDpTable[si][0] = si;
      } else {
        // 置換または一致
        const replaceCost = sourceStr[si - 1] === targetStr[sj - 1] ? 0 : 1;
        const fromDiagonal = newDpTable[si - 1][sj - 1] + replaceCost;
        
        // 削除と挿入
        const fromTop = newDpTable[si - 1][sj] + 1;
        const fromLeft = newDpTable[si][sj - 1] + 1;
        
        newDpTable[si][sj] = Math.min(fromDiagonal, fromTop, fromLeft);
      }
    }
    
    setDpTable(newDpTable);
  }, [step, sourceStr, targetStr, N, M, totalSteps, INF]);

  // 完全なDP計算
  const completeDPCalculation = () => {
    try {
      // 明示的なサイズチェック
      const rows = Math.max(1, M + 1);
      const cols = Math.max(1, N + 1);
      
      // 最終DPテーブルの計算
      const finalDpTable = Array(rows).fill().map(() => Array(cols).fill(INF));
      
      // 各ステップを順に計算
      for (let s = 0; s < totalSteps; s++) {
        const i = Math.floor(s / (N + 1));
        const j = s % (N + 1);
        
        if (i === 0 && j === 0) {
          finalDpTable[0][0] = 0;
        } else if (i === 0) {
          finalDpTable[0][j] = j;
        } else if (j === 0) {
          finalDpTable[i][0] = i;
        } else {
          // 文字一致または置換
          const replaceCost = (sourceStr[i - 1] === targetStr[j - 1]) ? 0 : 1;
          finalDpTable[i][j] = Math.min(
            finalDpTable[i - 1][j - 1] + replaceCost,
            finalDpTable[i - 1][j] + 1,  // 削除
            finalDpTable[i][j - 1] + 1   // 挿入
          );
        }
      }

      setDpTable(finalDpTable);

      // バックトラックで操作を特定
      let i = M, j = N;
      const ops = [];
      const pathCells = new Set();

      while (i > 0 || j > 0) {
        // 安全性チェック - 範囲外の場合は処理を中断
        if (i < 0 || j < 0 || i >= rows || j >= cols || 
            !finalDpTable[i] || finalDpTable[i][j] === undefined) {
          console.error(`バックトラック中の無効なインデックス: i=${i}, j=${j}`);
          break;
        }
        
        pathCells.add(`${i},${j}`);

        if (i > 0 && j > 0 && finalDpTable[i][j] === finalDpTable[i - 1][j - 1] && 
            sourceStr[i - 1] === targetStr[j - 1]) {
          // 文字一致
          ops.unshift({
            type: 'match',
            sourceIndex: i - 1,
            targetIndex: j - 1,
            sourceLetter: sourceStr[i - 1],
            targetLetter: targetStr[j - 1]
          });
          i--; j--;
        } else if (i > 0 && j > 0 && finalDpTable[i][j] === finalDpTable[i - 1][j - 1] + 1) {
          // 置換
          ops.unshift({
            type: 'substitute',
            sourceIndex: i - 1,
            targetIndex: j - 1,
            sourceLetter: sourceStr[i - 1],
            targetLetter: targetStr[j - 1]
          });
          i--; j--;
        } else if (i > 0 && finalDpTable[i][j] === finalDpTable[i - 1][j] + 1) {
          // 削除
          ops.unshift({
            type: 'delete',
            sourceIndex: i - 1,
            targetIndex: j,
            sourceLetter: sourceStr[i - 1],
            targetLetter: null
          });
          i--;
        } else if (j > 0 && finalDpTable[i][j] === finalDpTable[i][j - 1] + 1) {
          // 挿入
          ops.unshift({
            type: 'insert',
            sourceIndex: i,
            targetIndex: j - 1,
            sourceLetter: null,
            targetLetter: targetStr[j - 1]
          });
          j--;
        } else {
          // 予期しないケース - 安全に進める
          console.warn('予期しない操作検出、デフォルトの移動');
          if (i > 0) i--; else j--;
        }

        pathCells.add(`${i},${j}`);
      }

      setOperations(ops);
      setIsComplete(true);
      window.pathCellsSet = pathCells;
      setIsPlaying(false);
      
      console.log('計算完了: 編集距離 =', finalDpTable[M][N]);
    } catch (error) {
      console.error('計算完了処理中にエラーが発生しました:', error);
      // エラー回復 - 最低限の状態を設定
      setIsComplete(true);
      setIsPlaying(false);
    }
  };

  // 現在の操作を取得
  const getCurrentOperation = () => {
    if (currentI === 0 || currentJ === 0) {
      return currentI === 0 && currentJ > 0 ? 'insert' : 
             currentI > 0 && currentJ === 0 ? 'delete' : 'initial';
    }

    // dpTableが更新されてない場合は何も返さない
    if (!dpTable[currentI] || typeof dpTable[currentI][currentJ] === 'undefined' || 
        !dpTable[currentI-1] || typeof dpTable[currentI-1][currentJ] === 'undefined' || 
        !dpTable[currentI][currentJ-1] || typeof dpTable[currentI][currentJ-1] === 'undefined' || 
        !dpTable[currentI-1][currentJ-1] || typeof dpTable[currentI-1][currentJ-1] === 'undefined') {
      return '';
    }

    const current = dpTable[currentI][currentJ];
    
    // 安全に前の状態を取得
    const diagValue = dpTable[currentI - 1][currentJ - 1];
    const topValue = dpTable[currentI - 1][currentJ];
    const leftValue = dpTable[currentI][currentJ - 1];
    
    if (sourceStr[currentI - 1] === targetStr[currentJ - 1] && diagValue === current) {
      return 'match';
    } else if (diagValue + 1 === current) {
      return 'substitute';
    } else if (topValue + 1 === current) {
      return 'delete';
    } else if (leftValue + 1 === current) {
      return 'insert';
    }

    return '';
  };

  // 現在のステップでの可能な操作を取得
  const getCurrentOperations = () => {
    if (currentI === 0 || currentJ === 0) return [];
    if (!dpTable[currentI] || !dpTable[currentI-1]) return [];

    const operations = [];
    const current = getCurrentOperation();

    // 置換または一致
    if (currentI > 0 && currentJ > 0) {
      const prevDiag = dpTable[currentI - 1][currentJ - 1];

      if (prevDiag !== INF) {
        if (sourceStr[currentI - 1] === targetStr[currentJ - 1]) {
          operations.push({
            type: 'match',
            description: `文字が一致（${sourceStr[currentI - 1]} = ${targetStr[currentJ - 1]}）`,
            cost: 0,
            newValue: prevDiag,
            cell: `dp[${currentI - 1}][${currentJ - 1}]`,
            value: prevDiag
          });
        } else {
          operations.push({
            type: 'substitute',
            description: `文字を置換（${sourceStr[currentI - 1]} → ${targetStr[currentJ - 1]}）`,
            cost: 1,
            newValue: prevDiag + 1,
            cell: `dp[${currentI - 1}][${currentJ - 1}]`,
            value: prevDiag
          });
        }
      }
    }

    // 削除
    if (currentI > 0) {
      const prevUp = dpTable[currentI - 1][currentJ];
      if (prevUp !== INF) {
        operations.push({
          type: 'delete',
          description: `文字を削除（${sourceStr[currentI - 1]}）`,
          cost: 1,
          newValue: prevUp + 1,
          cell: `dp[${currentI - 1}][${currentJ}]`,
          value: prevUp
        });
      }
    }

    // 挿入
    if (currentJ > 0) {
      const prevLeft = dpTable[currentI][currentJ - 1];
      if (prevLeft !== INF) {
        operations.push({
          type: 'insert',
          description: `文字を挿入（${targetStr[currentJ - 1]}）`,
          cost: 1,
          newValue: prevLeft + 1,
          cell: `dp[${currentI}][${currentJ - 1}]`,
          value: prevLeft
        });
      }
    }

    return operations;
  };

  // コードのハイライト行を取得
  const getHighlightLines = () => {
    if (isComplete) return [48];

    if (currentI === 0 && currentJ === 0) return [21, 24];
    if (currentI === 0 && currentJ > 0) return [43];
    if (currentI > 0 && currentJ === 0) return [40];

    const operation = getCurrentOperation();

    switch(operation) {
      case 'match': return [32];
      case 'substitute': return [35];
      case 'delete': return [40];
      case 'insert': return [43];
      default: return [29];
    }
  };

  // セルのスタイルを取得
  const getCellStyle = (i, j) => {
    // インデックスの境界チェック
    if (i < 0 || j < 0 || i > M || j > N) {
      return 'bg-white dark:bg-gray-800';
    }

    // 計算完了時は最短経路のセルのみをハイライト
    if (isComplete) {
      if (window.pathCellsSet && window.pathCellsSet.has(`${i},${j}`)) {
        return 'bg-red-100 dark:bg-red-900 border-red-500 border-2';
      }
      return 'bg-white dark:bg-gray-800';
    }

    // 現在計算中のセル
    if (currentI === i && currentJ === j) {
      return 'bg-blue-100 dark:bg-blue-900 border-blue-500 border-2';
    }

    try {
      const operation = getCurrentOperation();

      // インデックスの安全チェック
      const isSafeIndex = (row, col) => {
        return row >= 0 && col >= 0 && row <= M && col <= N && 
               dpTable[row] && typeof dpTable[row][col] !== 'undefined';
      };

      // 参照セル（対角、上、左）が存在する場合のみハイライト
      if (operation === 'match' && i === currentI - 1 && j === currentJ - 1 && 
          isSafeIndex(currentI - 1, currentJ - 1)) {
        return 'bg-green-100 dark:bg-green-900 border-green-500 border-2';
      } else if (operation === 'substitute' && i === currentI - 1 && j === currentJ - 1 && 
                isSafeIndex(currentI - 1, currentJ - 1)) {
        return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500 border-2';
      } else if (operation === 'delete' && i === currentI - 1 && j === currentJ && 
                isSafeIndex(currentI - 1, currentJ)) {
        return 'bg-red-100 dark:bg-red-900 border-red-500 border-2';
      } else if (operation === 'insert' && i === currentI && j === currentJ - 1 && 
                isSafeIndex(currentI, currentJ - 1)) {
        return 'bg-purple-100 dark:bg-purple-900 border-purple-500 border-2';
      }
    } catch (error) {
      console.error('セルスタイル取得エラー:', error);
    }

    return 'bg-white dark:bg-gray-800';
  };

  // 編集モード終了
  const saveEditedStrings = () => {
    setEditMode(false);
    initializeDP();
  };

  // 初期値に戻す
  const resetToDefault = () => {
    setSourceStr('horse');
    setTargetStr('ros');
    setEditMode(false);
    initializeDP();
  };

  // 文字列変換過程の計算
  const calculateTransformationSteps = () => {
    return operations.reduce((steps, op) => {
      let newStr = steps[steps.length - 1];

      switch (op.type) {
        case 'match': break;
        case 'substitute':
          newStr = newStr.substring(0, op.sourceIndex) + op.targetLetter + newStr.substring(op.sourceIndex + 1);
          steps.push(newStr);
          break;
        case 'delete':
          newStr = newStr.substring(0, op.sourceIndex) + newStr.substring(op.sourceIndex + 1);
          steps.push(newStr);
          break;
        case 'insert':
          newStr = newStr.substring(0, op.sourceIndex) + op.targetLetter + newStr.substring(op.sourceIndex);
          steps.push(newStr);
          break;
      }

      return steps;
    }, [sourceStr]).slice(1);
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
      // ステップを減らす
      setStep(prevStep => prevStep - 1);
    }
  };

  // スピードの変更
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  // リセット
  const resetVisualization = () => {
    // 再生状態をリセット
    setIsPlaying(false);
    
    // ステップを0に戻す
    setStep(0);
    
    // 状態を初期化
    setCurrentI(0);
    setCurrentJ(0);
    setIsComplete(false);
    setOperations([]);
    
    // dpTableを完全に新しく作り直す
    const rows = Math.max(1, M + 1);
    const cols = Math.max(1, N + 1);
    
    const newDpTable = Array(rows).fill().map(() => Array(cols).fill(INF));
    // 0,0のみ初期化
    newDpTable[0][0] = 0;
    
    setDpTable(newDpTable);
    
    // 経路情報をクリア
    if (window.pathCellsSet) {
      window.pathCellsSet = new Set();
    }
    
    console.log('可視化を完全にリセットしました');
  };

  // ソースコードの表示/非表示切り替え
  const toggleCode = () => {
    setShowCode(!showCode);
  };

  // DPテーブル表示
  const renderDPTable = () => {
    // 最低限のチェック
    if (!dpTable || !dpTable.length) {
      console.warn('dpTableが未初期化です');
      return (
        <div className="flex justify-center items-center h-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="text-gray-500">表の初期化中...</div>
        </div>
      );
    }

    return (
      <motion.div 
        className="overflow-auto max-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100 dark:bg-gray-700">i\j</th>
              <th className="border p-2 bg-gray-100 dark:bg-gray-700"></th>
              {targetStr.split('').map((char, index) => (
                <motion.th 
                  key={`col-${index}`} 
                  className="border p-2 bg-gray-100 dark:bg-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.5, index * 0.1) }}
                >
                  {char}
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border p-2 bg-gray-100 dark:bg-gray-700"></th>
              <td className={`border p-2 text-center ${getCellStyle(0, 0)}`}>
                {dpTable[0] && typeof dpTable[0][0] !== 'undefined' && dpTable[0][0] !== INF 
                  ? dpTable[0][0] 
                  : '∞'}
              </td>
              {Array.from({ length: Math.min(N, targetStr.length) }, (_, j) => (
                <td key={`cell-0-${j+1}`} className={`border p-2 text-center ${getCellStyle(0, j+1)}`}>
                  {dpTable[0] && typeof dpTable[0][j+1] !== 'undefined' && dpTable[0][j+1] !== INF 
                    ? dpTable[0][j+1] 
                    : '∞'}
                </td>
              ))}
            </tr>
            {sourceStr.split('').map((char, i) => (
              <tr key={`row-${i}`}>
                <motion.th 
                  className="border p-2 bg-gray-100 dark:bg-gray-700"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.5, i * 0.1) }}
                >
                  {char}
                </motion.th>
                <td className={`border p-2 text-center ${getCellStyle(i+1, 0)}`}>
                  {dpTable[i+1] && typeof dpTable[i+1][0] !== 'undefined' && dpTable[i+1][0] !== INF 
                    ? dpTable[i+1][0] 
                    : '∞'}
                </td>
                {Array.from({ length: Math.min(N, targetStr.length) }, (_, j) => {
                  // 安全チェック
                  const cellValue = dpTable[i+1] && typeof dpTable[i+1][j+1] !== 'undefined' && dpTable[i+1][j+1] !== INF 
                    ? dpTable[i+1][j+1] 
                    : '∞';
                    
                  return (
                    <motion.td 
                      key={`cell-${i+1}-${j+1}`} 
                      className={`border p-2 text-center ${getCellStyle(i+1, j+1)}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        transition: { 
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: Math.min(0.5, 0.05 * (i + j))
                        }
                      }}
                    >
                      {cellValue}
                    </motion.td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* テーブルに直接つける色の説明 */}
        <div className="mt-4 border-t pt-3">
          <h3 className="text-sm font-bold mb-2">色の説明:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {isComplete ? (
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 bg-red-100 dark:bg-red-900 border-2 border-red-500 mr-2"></span>
                <span>最適解の経路（最小編集距離のパス）</span>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 mr-2"></span>
                  <span>現在計算中のセル</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-green-100 dark:bg-green-900 border-2 border-green-500 mr-2"></span>
                  <span>参照セル - 文字一致</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 mr-2"></span>
                  <span>参照セル - 文字置換</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-red-100 dark:bg-red-900 border-2 border-red-500 mr-2"></span>
                  <span>参照セル - 文字削除</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 bg-purple-100 dark:bg-purple-900 border-2 border-purple-500 mr-2"></span>
                  <span>参照セル - 文字挿入</span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // 色の説明表示
  const renderColorLegend = () => {
    return (
      <motion.div 
        className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-bold mb-2">色の説明</h3>
        {isComplete ? (
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-red-100 dark:bg-red-900 border-2 border-red-500 mr-2"></span>
            <span>最適解の経路（最小編集距離のパス）</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 mr-2"></span>
              <span>現在計算中のセル</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-green-100 dark:bg-green-900 border-2 border-green-500 mr-2"></span>
              <span>文字一致</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 mr-2"></span>
              <span>文字置換</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-red-100 dark:bg-red-900 border-2 border-red-500 mr-2"></span>
              <span>文字削除</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-purple-100 dark:bg-purple-900 border-2 border-purple-500 mr-2"></span>
              <span>文字挿入</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // 制御パネル表示
  const renderControlPanel = () => {
    return (
      <motion.div 
        className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-bold mb-4">制御パネル</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">文字列 1</label>
            {editMode ? (
              <input 
                type="text" 
                value={sourceStr} 
                onChange={(e) => setSourceStr(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            ) : (
              <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700">{sourceStr}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">文字列 2</label>
            {editMode ? (
              <input 
                type="text" 
                value={targetStr} 
                onChange={(e) => setTargetStr(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            ) : (
              <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700">{targetStr}</div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">アニメーション速度</label>
            <div className="flex items-center space-x-2">
              <span>遅い</span>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.5" 
                value={speed} 
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="flex-grow"
              />
              <span>速い</span>
            </div>
          </div>
          <div className="flex items-end">
            <div className="text-sm mt-2">
              <div><span className="font-medium">現在のステップ:</span> {isComplete ? "完了" : `${step} / ${totalSteps}`}</div>
              {!isComplete && <div><span className="font-medium">位置:</span> (i={currentI}, j={currentJ})</div>}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {editMode ? (
            <>
              <motion.button 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                whileTap={{ scale: 0.95 }}
                onClick={saveEditedStrings}
              >
                適用
              </motion.button>
              <motion.button 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                whileTap={{ scale: 0.95 }}
                onClick={resetToDefault}
              >
                初期値に戻す
              </motion.button>
              <motion.button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(false)}
              >
                キャンセル
              </motion.button>
            </>
          ) : (
            <>
              <motion.button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                disabled={step === 0}
              >
                ◀ 前へ
              </motion.button>
              
              <motion.button 
                className={`px-4 py-2 ${isPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                disabled={isComplete || step >= totalSteps}
              >
                {isPlaying ? '⏸ 一時停止' : '▶ 再生'}
              </motion.button>
              
              <motion.button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={isComplete || step >= totalSteps}
              >
                次へ ▶
              </motion.button>
              
              <motion.button 
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(totalSteps)}
                disabled={isComplete || step >= totalSteps}
              >
                計算完了
              </motion.button>
              
              <motion.button 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                whileTap={{ scale: 0.95 }}
                onClick={resetVisualization}
              >
                リセット
              </motion.button>
              
              <motion.button 
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                disabled={isPlaying}
              >
                文字列を編集
              </motion.button>
              
              <motion.button 
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                whileTap={{ scale: 0.95 }}
                onClick={toggleCode}
              >
                {showCode ? 'コードを隠す' : 'コードを表示'}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // 計算ステップ情報表示
  const renderStepInfo = () => {
    if (isComplete) return null;
    
    return (
      <motion.div 
        className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-bold mb-2">計算ステップ</h3>
        
        {currentI === 0 && currentJ === 0 ? (
          <div>
            <p>初期条件: dp[0][0] = 0</p>
            <p>空文字列から空文字列への変換コストは0です。</p>
          </div>
        ) : currentI === 0 ? (
          <div>
            <p>初期条件: dp[0][{currentJ}] = {currentJ}</p>
            <p>空文字列から文字列「{targetStr.substring(0, currentJ)}」への最小編集距離は{currentJ}です。</p>
            <p>（{currentJ}回の挿入操作で変換可能）</p>
          </div>
        ) : currentJ === 0 ? (
          <div>
            <p>初期条件: dp[{currentI}][0] = {currentI}</p>
            <p>文字列「{sourceStr.substring(0, currentI)}」から空文字列への最小編集距離は{currentI}です。</p>
            <p>（{currentI}回の削除操作で変換可能）</p>
          </div>
        ) : (
          <div>
            <p>計算: 文字列「{sourceStr.substring(0, currentI)}」を「{targetStr.substring(0, currentJ)}」に変換</p>
            <p>現在の文字: {sourceStr[currentI-1]} と {targetStr[currentJ-1]}</p>
            
            <div className="mt-2">
              <p className="font-medium">可能な操作:</p>
              <ul className="space-y-2 mt-1">
                {getCurrentOperations().map((op, index) => (
                  <motion.li 
                    key={index} 
                    className={`p-2 rounded ${
                      op.type === getCurrentOperation() ? 
                        op.type === 'match' ? 'bg-green-100 dark:bg-green-900 font-bold' : 
                        op.type === 'substitute' ? 'bg-yellow-100 dark:bg-yellow-900 font-bold' : 
                        op.type === 'delete' ? 'bg-red-100 dark:bg-red-900 font-bold' : 
                        'bg-purple-100 dark:bg-purple-900 font-bold'
                      : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {op.description}: {op.cell} {op.cost > 0 ? `+ ${op.cost}` : ''} = {op.newValue}
                    {op.type === getCurrentOperation() && ' (選択)'}
                  </motion.li>
                ))}
              </ul>
              
              <p className="mt-2">
                よって、dp[{currentI}][{currentJ}] = {dpTable[currentI] && dpTable[currentI][currentJ] !== INF ? dpTable[currentI][currentJ] : '∞'}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // 結果表示
  const renderResult = () => {
    if (!isComplete) return null;
    
    return (
      <motion.div 
        className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-bold mb-2">計算結果</h3>
        
        <p>編集距離（Levenshtein距離）: <span className="font-bold text-xl">{dpTable[M][N]}</span></p>
        
        <div className="mt-4">
          <p className="font-medium">必要な操作:</p>
          <ul className="space-y-1 mt-1">
            {operations.map((op, index) => {
              let description = '';
              let opClass = '';
              
              switch (op.type) {
                case 'match':
                  description = `${op.sourceLetter} は既に一致`;
                  opClass = 'text-green-600 dark:text-green-400';
                  break;
                case 'substitute':
                  description = `${op.sourceLetter} を ${op.targetLetter} に置換`;
                  opClass = 'text-yellow-600 dark:text-yellow-400';
                  break;
                case 'delete':
                  description = `${op.sourceLetter} を削除`;
                  opClass = 'text-red-600 dark:text-red-400';
                  break;
                case 'insert':
                  description = `${op.targetLetter} を挿入`;
                  opClass = 'text-purple-600 dark:text-purple-400';
                  break;
              }
              
              return (
                <motion.li 
                  key={index}
                  className={opClass}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {index + 1}. {description}
                </motion.li>
              );
            })}
          </ul>
        </div>
        
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-medium">文字列変換過程:</p>
          <div className="flex flex-col mt-2 bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <motion.div 
              className="font-mono"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {sourceStr}
            </motion.div>
            
            {calculateTransformationSteps().map((step, index) => (
              <motion.div 
                key={index} 
                className="font-mono"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index + 1) * 0.2 }}
              >
                ↓ {step}
              </motion.div>
            ))}
            
            <motion.div 
              className="font-mono font-bold"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (calculateTransformationSteps().length + 1) * 0.2 }}
            >
              ↓ {targetStr}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // コード表示
  const renderCode = () => {
    if (!showCode) return null;
    
    const highlightLines = getHighlightLines();
    
    return (
      <motion.div 
        className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 font-bold">
          編集距離アルゴリズムのコード
        </div>
        <div className="p-4 overflow-auto max-h-96">
          <pre className="text-sm">
            <code>
              {`// 編集距離問題のC++コード実装
#include <iostream>
#include <string>
#include <vector>
using namespace std;

template<class T> void chmin(T& a, T b) {
    if (a > b) {
        a = b;
    }
}

const int INF = 1 << 29; // 非常に大きな値

int main() {
    // 入力
    string S, T;
    cin >> S >> T;
    
    // DP テーブル定義
    vector<vector<int>> dp(S.size() + 1, vector<int>(T.size() + 1, INF));

    // DP 初期条件
    dp[0][0] = 0;

    // DPループ
    for (int i = 0; i <= S.size(); ++i) {
        for (int j = 0; j <= T.size(); ++j) {
            // 置換操作
            if (i > 0 && j > 0) {
                if (S[i - 1] == T[j - 1]) {
                    chmin(dp[i][j], dp[i - 1][j - 1]);
                }
                else {
                    chmin(dp[i][j], dp[i - 1][j - 1] + 1);
                }
            }
            
            // 削除操作
            if (i > 0) chmin(dp[i][j], dp[i - 1][j] + 1);

            // 挿入操作
            if (j > 0) chmin(dp[i][j], dp[i][j - 1] + 1);
        }
    }
    
    // 答えの出力
    cout << dp[S.size()][T.size()] << endl;
}`.split('\n').map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = highlightLines.includes(lineNumber);

                return (
                  <div
                    key={lineNumber}
                    className={isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900' : ''}
                    style={{ paddingLeft: '1em' }}
                  >
                    <span className="mr-2 text-gray-400">{lineNumber}</span>
                    {line}
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.h1 
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        編集距離（レーベンシュタイン距離）可視化
      </motion.h1>
      
      {renderControlPanel()}
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          {renderDPTable()}
          {renderStepInfo()}
          {renderResult()}
        </div>
        
        <div className="lg:col-span-3">
          {renderCode()}
        </div>
      </div>
    </div>
  );
};

export default EditDistanceVisualizer;
