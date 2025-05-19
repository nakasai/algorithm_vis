const IntervalPartitionVisualizer = () => {
  // 基本データと状態管理
  const [n, setN] = React.useState(5); // 数列の長さ
  const [k, setK] = React.useState(2); // 分割数
  const [data, setData] = React.useState([]); // 元データ配列
  const [editData, setEditData] = React.useState([]); // 編集用データ
  const [editMode, setEditMode] = React.useState(false); // 編集モード
  const [costMatrix, setCostMatrix] = React.useState([]); // コスト行列 c[i][j]
  const [editCostMatrix, setEditCostMatrix] = React.useState(false); // コスト行列編集モード
  const [editCostData, setEditCostData] = React.useState([]); // 編集用コスト行列
  const [dp, setDp] = React.useState([]); // DP配列
  const [path, setPath] = React.useState([]); // 最適な分割点
  const [currentI, setCurrentI] = React.useState(0); // 現在のiインデックス
  const [currentJ, setCurrentJ] = React.useState(-1); // 現在のjインデックス
  const [isComplete, setIsComplete] = React.useState(false); // 計算完了フラグ
  const [step, setStep] = React.useState(0); // ステップ数
  const [totalSteps, setTotalSteps] = React.useState(0); // 合計ステップ数
  const [costFunction, setCostFunction] = React.useState('squared'); // コスト関数
  const [manualMode, setManualMode] = React.useState(false); // 手動配置モード
  const [manualPartitions, setManualPartitions] = React.useState([0]); // 手動で配置した分割点
  const [showTooltip, setShowTooltip] = React.useState(null); // ツールチップ表示
  const [errorMessage, setErrorMessage] = React.useState(""); // エラーメッセージ
  
  // コンポーネントマウント時に初期化
  React.useEffect(() => {
    generateInitialData();
  }, []);
  
  // 数列サイズまたはコスト関数変更時に再初期化
  React.useEffect(() => {
    if (data.length > 0) {
      initializeData();
    }
  }, [n, costFunction]);
  
  // ランダムデータ生成
  const generateInitialData = () => {
    try {
      const newData = Array.from({ length: n }, () => 10 + Math.floor(Math.random() * 50));
      setData(newData);
      setEditData([...newData]);
      initializeWithData(newData);
    } catch (error) {
      console.error("Data generation error:", error);
      setErrorMessage("データ生成中にエラーが発生しました。");
    }
  };
  
  // 初期データセットアップ（コストマトリックスとDP配列）
  const initializeData = () => {
    try {
      initializeWithData(data);
    } catch (error) {
      console.error("Initialization error:", error);
      setErrorMessage("初期化中にエラーが発生しました。");
    }
  };
  
  // 初期データセットアップ（コストマトリックスとDP配列）
  const initializeWithData = (inputData) => {
    // コスト行列の初期化（すべて0で埋める）
    const costs = Array(n + 1).fill().map(() => Array(n + 1).fill(0));
    
    // コスト行列の計算
    for (let j = 0; j <= n; j++) {
      for (let i = j + 1; i <= n; i++) {
        // 区間[j,i)の合計を計算: x[j] + x[j+1] + ... + x[i-1]
        let sum = 0;
        for (let k = j; k < i && k < inputData.length; k++) {
          sum += inputData[k];
        }
        costs[j][i] = sum;
      }
    }
    
    // DP配列の初期化
    const initialDp = Array(n + 1).fill(Infinity);
    initialDp[0] = 0; // 始点のコストは0
    
    // 状態更新
    setCostMatrix(costs);
    setDp(initialDp);
    setCurrentI(0);
    setCurrentJ(-1);
    setIsComplete(false);
    setPath([]);
    setStep(0);
    setTotalSteps((n + 1) * n / 2); // iとjの組み合わせの総数
    setManualPartitions([0]);
    setErrorMessage("");
  };
  
  // コスト関数
  const calculateCost = (inputData, i, j) => {
    if (!inputData || i >= j || i >= inputData.length) return 0;
    
    // 安全に配列の範囲内のデータを取得
    const segment = inputData.slice(i, Math.min(j, inputData.length));
    
    if (segment.length === 0) return 0;
    
    try {
      if (costFunction === 'squared') {
        // 区間内の要素の二乗和
        return segment.reduce((sum, val) => sum + val * val, 0);
      } else if (costFunction === 'range') {
        // 区間内の最大値と最小値の差
        const max = Math.max(...segment);
        const min = Math.min(...segment);
        return max - min;
      } else if (costFunction === 'sum') {
        // 区間内の要素の合計
        return segment.reduce((sum, val) => sum + val, 0);
      } else {
        // デフォルト: 区間の長さ
        return j - i;
      }
    } catch (error) {
      console.error("Cost calculation error:", error);
      return j - i; // エラー時はデフォルトのコスト
    }
  };
  
  // 次のステップ実行
  const nextStep = () => {
    if (isComplete || step >= totalSteps) {
      completeCalculation();
      return;
    }
    
    try {
      // 現在のi, jを計算
      let newI = 0;
      let newJ = 0;
      let count = 0;
      
      // ステップ数からi, jの値を計算
      outerLoop: for (let i = 1; i <= n; i++) {
        for (let j = 0; j < i; j++) {
          if (count === step) {
            newI = i;
            newJ = j;
            break outerLoop;
          }
          count++;
        }
      }
      
      // ステート更新
      setCurrentI(newI);
      setCurrentJ(newJ);
      
      // DPテーブルの更新
      setDp(prevDp => {
        const newDp = [...prevDp];
        
        // 安全チェック
        if (!costMatrix || !costMatrix[newJ] || costMatrix[newJ][newI] === undefined) {
          return newDp;
        }
        
        const currentValue = newDp[newJ] + costMatrix[newJ][newI];
        
        if (currentValue < newDp[newI]) {
          newDp[newI] = currentValue;
        }
        
        return newDp;
      });
      
      setStep(prev => prev + 1);
    } catch (error) {
      console.error("Step execution error:", error);
      setErrorMessage("ステップ実行中にエラーが発生しました。");
    }
  };
  
  // 前のステップに戻る
  const prevStep = () => {
    if (step <= 0) {
      return;
    }
    
    try {
      // ステップ数を減らす
      const newStep = step - 1;
      
      // 計算完了状態を解除
      if (isComplete) {
        setIsComplete(false);
      }
      
      // DPテーブルをリセットして最初から再計算
      const recalcDp = Array(n + 1).fill(Infinity);
      recalcDp[0] = 0;
      
      // 現在のi, jを計算
      let prevI = 0;
      let prevJ = 0;
      let stepCount = 0;
      
      // 新しいステップまでDPテーブルを再計算
      for (let i = 1; i <= n; i++) {
        for (let j = 0; j < i; j++) {
          // 前のステップのi, jを特定
          if (stepCount === newStep) {
            prevI = i;
            prevJ = j;
            // 最後のステップではDPテーブルを更新しない
            break;
          }
          
          // このステップでの更新を適用
          if (costMatrix && costMatrix[j] && typeof costMatrix[j][i] === 'number') {
            const currentValue = recalcDp[j] + costMatrix[j][i];
            if (currentValue < recalcDp[i]) {
              recalcDp[i] = currentValue;
            }
          }
          
          stepCount++;
        }
        if (stepCount === newStep) break;
      }
      
      // 状態更新
      setDp(recalcDp);
      setCurrentI(prevI);
      setCurrentJ(prevJ);
      setStep(newStep);
      setPath([]); // 計算完了状態から戻るときにパスをクリア
      
    } catch (error) {
      console.error("Previous step error:", error);
      setErrorMessage("前のステップに戻る処理中にエラーが発生しました。");
    }
  };
  
  // 自動実行（一気に計算完了まで）
  const autoComplete = () => {
    if (isComplete) return;
    completeCalculation();
  };
  
  // 計算完了処理
  const completeCalculation = () => {
    try {
      // 完全なDPテーブルの計算
      const finalDp = Array(n + 1).fill(Infinity);
      finalDp[0] = 0;
      
      // 復元用の前任ノード
      const prev = Array(n + 1).fill(-1);
      
      // DPテーブルの計算
      for (let i = 1; i <= n; i++) {
        for (let j = 0; j < i; j++) {
          if (costMatrix && costMatrix[j] && typeof costMatrix[j][i] === 'number') {
            const currentValue = finalDp[j] + costMatrix[j][i];
            if (currentValue < finalDp[i]) {
              finalDp[i] = currentValue;
              prev[i] = j;
            }
          }
        }
      }
      
      // 最適解のパス復元
      const optimalPath = [];
      let current = n;
      
      // 前任ノードをたどって最適経路を復元
      while (current > 0 && prev[current] !== -1) {
        optimalPath.unshift(current);
        current = prev[current];
      }
      
      // 始点を追加
      optimalPath.unshift(0);
      
      // 状態更新 - 中間状態の表示をクリア
      setDp(finalDp);
      setPath(optimalPath);
      setIsComplete(true);
      setStep(totalSteps);
      setErrorMessage("");
      
      // 中間計算のハイライトをクリア
      setCurrentI(-1);
      setCurrentJ(-1);
    } catch (error) {
      console.error("Calculation completion error:", error);
      setErrorMessage("計算完了処理中にエラーが発生しました。");
    }
  };
  
  // リセット処理
  const resetCalculation = () => {
    try {
      const initialDp = Array(n + 1).fill(Infinity);
      initialDp[0] = 0;
      
      setCurrentI(0);
      setCurrentJ(-1);
      setIsComplete(false);
      setDp(initialDp);
      setPath([]);
      setStep(0);
      setManualPartitions([0]);
      setErrorMessage("");
    } catch (error) {
      console.error("Reset error:", error);
      setErrorMessage("リセット中にエラーが発生しました。");
    }
  };
  
  // 手動分割の追加/削除
  const addManualPartition = (point) => {
    if (!manualMode) return;
    
    try {
      const newPartitions = [...manualPartitions];
      
      // すでに存在する場合は削除
      const existingIndex = newPartitions.indexOf(point);
      if (existingIndex !== -1) {
        // 0（始点）は削除不可
        if (point === 0) return;
        newPartitions.splice(existingIndex, 1);
      } else {
        // 昇順に挿入
        newPartitions.push(point);
        newPartitions.sort((a, b) => a - b);
      }
      
      setManualPartitions(newPartitions);
    } catch (error) {
      console.error("Manual partition error:", error);
      setErrorMessage("分割点の設定中にエラーが発生しました。");
    }
  };
  
  // 手動モードの区間コスト計算
  const calculateManualCost = () => {
    if (manualPartitions.length <= 1) return 0;
    
    try {
      let totalCost = 0;
      
      for (let i = 0; i < manualPartitions.length - 1; i++) {
        const start = manualPartitions[i];
        const end = manualPartitions[i + 1];
        
        if (costMatrix && costMatrix[start] && typeof costMatrix[start][end] === 'number') {
          totalCost += costMatrix[start][end];
        }
      }
      
      return totalCost;
    } catch (error) {
      console.error("Manual cost calculation error:", error);
      return 0;
    }
  };
  
  // データサイズの変更ハンドラ
  const handleSizeChange = (newSize) => {
    try {
      // 新しいサイズでデータを再生成
      const newN = Number(newSize);
      if (isNaN(newN) || newN < 3 || newN > 10) return;
      
      // ステップ実行中/計算完了時は変更不可
      if (step > 0 || isComplete || manualMode) return;
      
      setN(newN);
      
      // 新しいデータを生成
      const newData = Array.from({ length: newN }, () => 10 + Math.floor(Math.random() * 50));
      setData(newData);
      setEditData([...newData]);
      
      // 初期化
      initializeWithData(newData);
    } catch (error) {
      console.error("Size change error:", error);
      setErrorMessage("サイズ変更中にエラーが発生しました。");
    }
  };
  
  // データ編集を保存
  const saveEditedData = () => {
    try {
      if (editData.length !== n) {
        setErrorMessage("データの長さが配列サイズと一致しません。");
        return;
      }
      
      const numericData = editData.map(val => {
        const num = Number(val);
        return isNaN(num) ? 10 : num;
      });
      
      setData(numericData);
      initializeWithData(numericData);
      setEditMode(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Data save error:", error);
      setErrorMessage("データの保存中にエラーが発生しました。");
    }
  };
  
  // コスト行列の編集機能
  const startCostMatrixEdit = () => {
    // 現在のコスト行列をコピー
    const costCopy = Array(n + 1).fill().map((_, i) => 
      Array(n + 1).fill().map((_, j) => 
        costMatrix[i] && costMatrix[i][j] !== undefined ? costMatrix[i][j] : 0
      )
    );
    setEditCostData(costCopy);
    setEditCostMatrix(true);
  };
  
  // コスト行列編集を保存
  const saveCostMatrixEdit = () => {
    setCostMatrix(editCostData);
    setEditCostMatrix(false);
    
    // 計算をリセット
    resetCalculation();
  };
  
  // コスト行列編集をキャンセル
  const cancelCostMatrixEdit = () => {
    setEditCostMatrix(false);
  };
  
  // コスト行列の値を更新
  const updateCostMatrixValue = (j, i, value) => {
    if (j >= i) return; // 対角線上および下部は編集不可
    
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    const newEditCostData = [...editCostData];
    if (!newEditCostData[j]) {
      newEditCostData[j] = Array(n + 1).fill(0);
    }
    newEditCostData[j][i] = numValue;
    setEditCostData(newEditCostData);
  };
  
  // 分割数の変更
  const changePartitionCount = (newK) => {
    try {
      const kValue = Number(newK);
      if (isNaN(kValue) || kValue < 1 || kValue > n-1) {
        return;
      }
      setK(kValue);
    } catch (error) {
      console.error("Partition count error:", error);
    }
  };
  
  // 数列の描画
  const renderSequence = () => {
    const cellWidth = 60;
    const cellHeight = 40;
    const svgWidth = (n + 1) * cellWidth;
    const svgHeight = 100;
    
    return (
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-2">インデックス (0～{n})</h3>
        <svg width={svgWidth} height={svgHeight} className="border">
          {/* インデックス */}
          {Array.from({ length: n + 1 }, (_, i) => (
            <g key={`idx-${i}`}>
              <rect
                x={i * cellWidth}
                y={0}
                width={cellWidth}
                height={cellHeight}
                fill={i === 0 ? "#e5e7eb" : 
                      path.includes(i) ? "#d1fae5" : 
                      manualMode && manualPartitions.includes(i) ? "#fef3c7" : "#f3f4f6"}
                stroke="#9ca3af"
                strokeWidth="1"
                onClick={() => addManualPartition(i)}
                style={{ cursor: manualMode ? "pointer" : "default" }}
              />
              <text
                x={i * cellWidth + cellWidth / 2}
                y={cellHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
              >
                {i}
              </text>
            </g>
          ))}
          
          {/* 分割線（最適解） */}
          {!manualMode && isComplete && path.map((point, idx) => (
            point !== 0 && point !== n && (
              <line
                key={`divider-${idx}`}
                x1={point * cellWidth}
                y1={0}
                x2={point * cellWidth}
                y2={cellHeight}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,2"
              />
            )
          ))}
          
          {/* 手動分割線 */}
          {manualMode && manualPartitions.map((point, idx) => (
            point !== 0 && point !== n && (
              <line
                key={`manual-${idx}`}
                x1={point * cellWidth}
                y1={0}
                x2={point * cellWidth}
                y2={cellHeight}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,2"
              />
            )
          ))}
          
          {/* コスト表示用の区間 */}
          {!manualMode && isComplete && path.length > 1 ? (
            path.slice(0, -1).map((start, idx) => {
              const end = path[idx + 1];
              return (
                <g key={`interval-${idx}`}
                   onMouseEnter={() => setShowTooltip({ start, end, cost: costMatrix?.[start]?.[end] || 0 })}
                   onMouseLeave={() => setShowTooltip(null)}>
                  <rect
                    x={start * cellWidth}
                    y={cellHeight + 5}
                    width={(end - start) * cellWidth}
                    height={20}
                    fill="#bfdbfe"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    rx="3"
                    opacity="0.7"
                  />
                  <text
                    x={start * cellWidth + (end - start) * cellWidth / 2}
                    y={cellHeight + 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {costMatrix?.[start]?.[end] || 0}
                  </text>
                </g>
              );
            })
          ) : manualMode && manualPartitions.length > 1 ? (
            manualPartitions.slice(0, -1).map((start, idx) => {
              const end = manualPartitions[idx + 1];
              return (
                <g key={`manual-interval-${idx}`}
                   onMouseEnter={() => setShowTooltip({ start, end, cost: costMatrix?.[start]?.[end] || 0 })}
                   onMouseLeave={() => setShowTooltip(null)}>
                  <rect
                    x={start * cellWidth}
                    y={cellHeight + 5}
                    width={(end - start) * cellWidth}
                    height={20}
                    fill="#fef3c7"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    rx="3"
                    opacity="0.7"
                  />
                  <text
                    x={start * cellWidth + (end - start) * cellWidth / 2}
                    y={cellHeight + 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {costMatrix?.[start]?.[end] || 0}
                  </text>
                </g>
              );
            })
          ) : null}
        </svg>
        
        {/* ツールチップ */}
        {showTooltip && (
          <div className="bg-gray-800 text-white p-2 rounded text-sm absolute">
            区間 [{showTooltip.start}, {showTooltip.end}] のコスト: {showTooltip.cost}
          </div>
        )}
      </div>
    );
  };
  
  // コスト行列の描画
  const renderCostMatrix = () => {
    if (!costMatrix || !costMatrix.length) return null;
    
    const cellSize = 40;
    const headerSize = 30;
    const svgWidth = (n + 2) * cellSize;
    const svgHeight = (n + 2) * cellSize;
    
    return (
      <div className="mb-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">コスト行列 (c[j][i])</h3>
          <div className="flex space-x-2">
            {!editCostMatrix ? (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                onClick={startCostMatrixEdit}
                disabled={step > 0 || isComplete || manualMode}
              >
                コスト行列を編集
              </button>
            ) : (
              <>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  onClick={saveCostMatrixEdit}
                >
                  保存
                </button>
                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                  onClick={cancelCostMatrixEdit}
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>
        
        <div style={{minWidth: `${svgWidth}px`}}>
          {editCostMatrix ? (
            // 編集モード: テーブル表示
            <table className="border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100">j\i</th>
                  {Array.from({ length: n + 1 }, (_, i) => (
                    <th key={i} className="border border-gray-400 px-2 py-1 bg-gray-100">{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n + 1 }, (_, j) => (
                  <tr key={j}>
                    <th className="border border-gray-400 px-2 py-1 bg-gray-100">{j}</th>
                    {Array.from({ length: n + 1 }, (_, i) => (
                      <td key={i} className="border border-gray-400 p-1">
                        {j >= i ? (
                          // 対角線上および下部: 編集不可
                          <span className="text-gray-500">—</span>
                        ) : (
                          <input
                            type="number"
                            value={editCostData[j] && editCostData[j][i] !== undefined ? editCostData[j][i] : 0}
                            onChange={(e) => updateCostMatrixValue(j, i, e.target.value)}
                            className="w-full p-1 border rounded text-center"
                            min="0"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // 表示モード: SVG
            <svg width={svgWidth} height={svgHeight} className="border">
              {/* ヘッダー行 */}
              <rect x={0} y={0} width={headerSize} height={headerSize} fill="#e5e7eb" stroke="#9ca3af" />
              <text x={headerSize / 2} y={headerSize / 2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">j\i</text>
              
              {Array.from({ length: n + 1 }, (_, i) => (
                <g key={`header-col-${i}`}>
                  <rect
                    x={headerSize + i * cellSize}
                    y={0}
                    width={cellSize}
                    height={headerSize}
                    fill="#e5e7eb"
                    stroke="#9ca3af"
                  />
                  <text
                    x={headerSize + i * cellSize + cellSize / 2}
                    y={headerSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {i}
                  </text>
                </g>
              ))}
              
              {/* ヘッダー列 */}
              {Array.from({ length: n + 1 }, (_, j) => (
                <g key={`header-row-${j}`}>
                  <rect
                    x={0}
                    y={headerSize + j * cellSize}
                    width={headerSize}
                    height={cellSize}
                    fill="#e5e7eb"
                    stroke="#9ca3af"
                  />
                  <text
                    x={headerSize / 2}
                    y={headerSize + j * cellSize + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {j}
                  </text>
                </g>
              ))}
              
              {/* セル */}
              {Array.from({ length: n + 1 }, (_, j) => (
                Array.from({ length: n + 1 }, (_, i) => {
                  // 最適パスに含まれるセルを強調表示
                  const isInPath = isComplete && !manualMode &&
                                  path.slice(0, -1).some((start, idx) => start === j && path[idx + 1] === i);
                  
                  // 手動パスに含まれるセルを強調表示
                  const isInManualPath = manualMode && manualPartitions.length > 1 &&
                                        manualPartitions.slice(0, -1).some((start, idx) => 
                                          start === j && manualPartitions[idx + 1] === i);
                  
                  // 現在の処理中のセルを強調表示
                  const isCurrentCell = j === currentJ && i === currentI;
                  
                  return (
                    <g key={`cell-${j}-${i}`}>
                      <rect
                        x={headerSize + i * cellSize}
                        y={headerSize + j * cellSize}
                        width={cellSize}
                        height={cellSize}
                        fill={isInPath ? "#d1fae5" : 
                              isInManualPath ? "#fef3c7" :
                              isCurrentCell ? "#bfdbfe" : 
                              costMatrix[j] && costMatrix[j][i] > 0 ? "#f3f4f6" : "#e5e7eb"}
                        stroke="#9ca3af"
                        strokeWidth={isInPath || isInManualPath || isCurrentCell ? "2" : "1"}
                      />
                      <text
                        x={headerSize + i * cellSize + cellSize / 2}
                        y={headerSize + j * cellSize + cellSize / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                      >
                        {j >= i ? "—" : costMatrix[j] && costMatrix[j][i] !== undefined ? costMatrix[j][i] : ""}
                      </text>
                    </g>
                  );
                })
              ))}
            </svg>
          )}
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          <p>注: 対角線上および下部（i ≤ j）のセルは使用されません。</p>
          <p>c[j][i] は区間 [j, i) の要素の合計: x[j] + x[j+1] + ... + x[i-1]</p>
        </div>
      </div>
    );
  };
  
  // DP配列の描画
  const renderDpArray = () => {
    if (!dp || !dp.length) return null;
    
    const cellWidth = 60;
    const cellHeight = 40;
    const svgWidth = (n + 1) * cellWidth;
    const svgHeight = cellHeight * 2 + 40; // 高さを増やして余裕をもたせる
    
    return (
      <div className="mb-6 overflow-x-auto">
        <h3 className="font-bold text-lg mb-2">DP配列 (dp[i])</h3>
        <div style={{minWidth: `${svgWidth}px`}}>
          <svg width={svgWidth} height={svgHeight} className="border">
            {/* インデックス */}
            {Array.from({ length: n + 1 }, (_, i) => (
              <g key={`dp-idx-${i}`}>
                <rect
                  x={i * cellWidth}
                  y={0}
                  width={cellWidth}
                  height={cellHeight}
                  fill="#e5e7eb"
                  stroke="#9ca3af"
                />
                <text
                  x={i * cellWidth + cellWidth / 2}
                  y={cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                >
                  {i}
                </text>
              </g>
            ))}
            
            {/* DP値 */}
            {Array.from({ length: n + 1 }, (_, i) => (
              <g key={`dp-val-${i}`}>
                <rect
                  x={i * cellWidth}
                  y={cellHeight}
                  width={cellWidth}
                  height={cellHeight}
                  fill={i === currentI && !isComplete ? "#bfdbfe" : 
                        isComplete && i === n ? "#d1fae5" : "#f3f4f6"}
                  stroke="#9ca3af"
                  strokeWidth={(i === currentI && !isComplete) || (isComplete && i === n) ? "2" : "1"}
                />
                <text
                  x={i * cellWidth + cellWidth / 2}
                  y={cellHeight + cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                >
                  {dp[i] === Infinity ? "∞" : dp[i]}
                </text>
              </g>
            ))}
            
            {/* 更新中の値の表示（アロー） - 計算完了時には表示しない */}
            {currentI > 0 && currentJ >= 0 && costMatrix && costMatrix[currentJ] && !isComplete && (
              <g>
                <line
                  x1={currentJ * cellWidth + cellWidth / 2}
                  y1={cellHeight + cellHeight + 5}
                  x2={currentI * cellWidth + cellWidth / 2}
                  y2={cellHeight + cellHeight + 5}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(currentJ + currentI) / 2 * cellWidth}
                  y={cellHeight + cellHeight + 25}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#3b82f6"
                >
                  dp[{currentJ}] + c[{currentJ}][{currentI}] = {dp[currentJ] === Infinity ? "∞" : dp[currentJ]} + {costMatrix[currentJ][currentI] || 0} = {dp[currentJ] === Infinity ? "∞" : dp[currentJ] + (costMatrix[currentJ][currentI] || 0)}
                </text>
              </g>
            )}
            
            {/* 計算完了時のメッセージ */}
            {isComplete && (
              <text
                x={svgWidth / 2}
                y={cellHeight + cellHeight + 25}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#10b981"
              >
                計算完了: dp[{n}] = {dp[n]}
              </text>
            )}
            
            {/* 矢印マーカー定義 */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    );
  };
  
  // コードのハイライト
  const renderCode = () => {
    // ハイライトする行番号を決定
    let highlightLines = [];
    
    if (isComplete) {
      highlightLines = [25]; // 出力行
    } else if (currentI === 0 && currentJ === -1) {
      highlightLines = [17]; // 初期化
    } else {
      highlightLines = [20, 21]; // DP更新
    }
    
    const currentN = n;
    
    const code = `#include <iostream>
#include <vector>
using namespace std;

template<class T> void chmin(T& a, T b) {
    if (a > b) a = b;
}

const long long INF = 1LL << 60;

int main() {
    int N = ${currentN}; // 配列サイズ
    vector<vector<long long>> c(N + 1, vector<long long>(N + 1));
    // コスト行列の設定 (入力省略)
    
    vector<long long> dp(N + 1, INF);
    dp[0] = 0;
    
    for (int i = 1; i <= N; ++i) {
        for (int j = 0; j < i; ++j) {
            chmin(dp[i], dp[j] + c[j][i]);
        }
    }
    
    cout << dp[N] << endl;
}`;
    
    return (
      <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <h3 className="font-bold text-lg mb-2">アルゴリズムコード</h3>
        <pre className="text-sm">
          {code.split('\n').map((line, index) => (
            <div 
              key={index} 
              className={`${highlightLines.includes(index + 1) ? 'bg-yellow-200' : ''} pl-2`}
              style={{ position: 'relative' }}
            >
              <span className="inline-block w-6 text-gray-500">{index + 1}</span>
              {line}
              {index + 1 === 20 && currentI > 0 && currentJ >= 0 && !isComplete && (
                <span className="text-gray-500 ml-2">
                  {/* 現在の処理の説明 */}
                  {`// i=${currentI}, j=${currentJ}で更新中`}
                </span>
              )}
            </div>
          ))}
        </pre>
      </div>
    );
  };
  
  // 計算結果ステータス
  const renderStatus = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-bold text-lg mb-2">計算ステータス</h3>
        
        {errorMessage && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2">
              <span className="font-semibold">現在のステップ:</span> {step} / {totalSteps}
            </p>
            
            {isComplete && !manualMode && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="font-bold text-green-800">最適解:</p>
                <p>最小コスト: {dp && dp[n] !== Infinity ? dp[n] : '計算中...'}</p>
                <p>最適分割点: {path && path.length > 0 ? path.join(" → ") : '計算中...'}</p>
                <p>分割数: {path ? path.length - 1 : 0}</p>
              </div>
            )}
            
            {manualMode && manualPartitions && manualPartitions.length > 1 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="font-bold text-yellow-800">手動分割:</p>
                <p>合計コスト: {calculateManualCost()}</p>
                <p>分割点: {manualPartitions.join(" → ")}</p>
                <p>分割数: {manualPartitions.length - 1}</p>
              </div>
            )}
          </div>
          
          <div>
            {currentI > 0 && currentJ >= 0 && !isComplete && dp && costMatrix && costMatrix[currentJ] && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800">
                  DP更新中: <span className="font-bold">dp[{currentI}]</span>
                </p>
                <p>
                  計算: min(dp[{currentI}], dp[{currentJ}] + c[{currentJ}][{currentI}])
                </p>
                <p>
                  = min({dp[currentI] === Infinity ? "∞" : dp[currentI]}, {dp[currentJ] === Infinity ? "∞" : dp[currentJ]} + {costMatrix[currentJ][currentI] || 0})
                </p>
                <p>
                  = min({dp[currentI] === Infinity ? "∞" : dp[currentI]}, {dp[currentJ] === Infinity ? "∞" : dp[currentJ] + (costMatrix[currentJ][currentI] || 0)})
                </p>
                <p>
                  = {Math.min(
                      dp[currentI] === Infinity ? Infinity : dp[currentI], 
                      dp[currentJ] === Infinity ? Infinity : dp[currentJ] + (costMatrix[currentJ][currentI] || 0)
                    ) === Infinity ? "∞" : Math.min(
                      dp[currentI] === Infinity ? Infinity : dp[currentI], 
                      dp[currentJ] === Infinity ? Infinity : dp[currentJ] + (costMatrix[currentJ][currentI] || 0)
                    )}
                </p>
              </div>
            )}
            
            {isComplete && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-bold">
                  計算完了
                </p>
                <p>
                  最終結果: dp[{n}] = {dp[n]}
                </p>
                <p className="text-sm mt-2">
                  これは0から{n}までの区間を最適に分割したときの最小コストです。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // データの表示と編集パネル
  const renderDataPanel = () => {
    return (
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">データ配列</h3>
          <div className="flex space-x-2">
            {!editMode ? (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => setEditMode(true)}
                disabled={step > 0 || isComplete || manualMode}
              >
                データを編集
              </button>
            ) : (
              <>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  onClick={saveEditedData}
                >
                  保存
                </button>
                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                  onClick={() => {
                    setEditMode(false);
                    setEditData([...data]);
                  }}
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>
        
        {editMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {editData.map((val, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-8 text-right mr-2">{idx}:</span>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => {
                    const newEditData = [...editData];
                    newEditData[idx] = e.target.value;
                    setEditData(newEditData);
                  }}
                  className="border rounded p-1 w-full"
                  min="0"
                  max="100"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.map((val, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-8 text-right mr-2">{idx}:</span>
                <span className="border rounded p-1 bg-gray-50 w-full">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // 設定パネル
  const renderSettingPanel = () => {
    const currentN = n;
    const currentK = k;
    
    return (
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
                value={currentN}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full mr-4"
                disabled={step > 0 || isComplete || manualMode}
              />
              <span className="w-8 text-center">{currentN}</span>
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-semibold">分割数 (K)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max={Math.max(1, currentN-1)}
                value={currentK}
                onChange={(e) => changePartitionCount(e.target.value)}
                className="w-full mr-4"
              />
              <span className="w-8 text-center">{currentK}</span>
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-semibold">コスト関数</label>
            <select
              value={costFunction}
              onChange={(e) => setCostFunction(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={step > 0 || isComplete || manualMode}
            >
              <option value="squared">二乗和コスト</option>
              <option value="range">最大値と最小値の差</option>
              <option value="sum">要素の合計</option>
              <option value="length">区間の長さ</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 font-semibold">モード選択</label>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded ${!manualMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setManualMode(false)}
                disabled={step > 0 && !isComplete}
              >
                自動計算モード
              </button>
              <button
                className={`px-4 py-2 rounded ${manualMode ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                onClick={() => {
                  setManualMode(true);
                  resetCalculation();
                }}
                disabled={step > 0 && !isComplete}
              >
                手動分割モード
              </button>
            </div>
          </div>
          
          <div className="flex items-end space-x-4">
            {!manualMode && (
              <>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  onClick={() => prevStep()}
                  disabled={step <= 0}
                >
                  前のステップ
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  onClick={() => nextStep()}
                  disabled={isComplete}
                >
                  次のステップ
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  onClick={() => autoComplete()}
                  disabled={isComplete}
                >
                  計算完了
                </button>
              </>
            )}
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => resetCalculation()}
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 説明パネル
  const renderExplanationPanel = () => {
    const currentK = k;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">区間分割問題について</h2>
        
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <span className="font-semibold">問題概要:</span> 配列を{currentK}つの区間に分割するとき、各区間のコストの総和を最小化する問題です。
          </p>
          <p>
            <span className="font-semibold">動的計画法の考え方:</span> dp[i] を「0からiまでの区間を最適に分割したときの最小コスト」とし、以下の漸化式で解きます。
          </p>
          <p className="bg-gray-100 p-2">
            dp[i] = min(dp[j] + c[j][i]) for j = 0, 1, ..., i-1
          </p>
          <p>
            <span className="font-semibold">使い方:</span> 
            {manualMode ? 
              "手動モードでは、インデックス番号をクリックして分割点を設定できます。結果は最適解と比較できます。" : 
              "「次のステップ」ボタンでアルゴリズムを1ステップずつ進めるか、「計算完了」で結果を表示します。"}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">区間分割問題の動的計画法可視化</h1>
      
      {/* 設定パネル */}
      {renderSettingPanel()}
      
      {/* データパネル */}
      {renderDataPanel()}
      
      {/* 説明パネル */}
      {renderExplanationPanel()}
      
      {/* 可視化エリア */}
      <div className="mb-8">
        {renderStatus()}
        {renderSequence()}
        {renderCostMatrix()}
        {!manualMode && renderDpArray()}
        {renderCode()}
      </div>
    </div>
  );
};

export default IntervalPartitionVisualizer;
